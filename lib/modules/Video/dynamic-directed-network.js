/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo,
    VideoNetwork = spimosimCore.modules.get('Video', 'network');

  function cE(name) {
    return document.createElement(name);
  }
  
  function VideoDynamicDirectedNetwork(initializer, config, videoSection, colorSet) {
    VideoNetwork.call(this, initializer, config, videoSection, colorSet);
  }
  VideoDynamicDirectedNetwork.prototype = Object.create(VideoNetwork.prototype);

  VideoDynamicDirectedNetwork.prototype.drawFrame = function (t) {
    try {
      var protocol = this.simulation.protocol;

      this.drawFrameInImageData(this.pixels, protocol, t, this.drawMode);

      if (this.visNetwork) {
        this.setNodeColors();
        this.updateLinks(protocol.get('connections', t));
      }

      this.setFrameNotSaved(false);
      this.setFrameNotSimulated(false);
      this.setStartingSimulation(false);

      this.shownT = t;
    } catch (e) {
      this.shownT = undefined;

      if (e === 'Unknown variable' || e === 'Unknown frame') {
        if (this.simulation.getTMaxCalculated() >= 0) {
          if (t <= this.simulation.getTMaxCalculated()) {
            this.shownT = t;

            this.setFrameNotSaved(true);
            this.setFrameNotSimulated(false);
          } else {
            this.setFrameNotSaved(false);
            this.setFrameNotSimulated(true);
          }
        } else {
          this.setStartingSimulation(true);
        }
      }

      throw e;
    }
  };

  VideoDynamicDirectedNetwork.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);
    
    this.pixels = new Int32Array(simulation.modelSettings.network.size);

    if (this.visNetwork) {
      this.visNetwork.destroy();
    }

    this.initVis();
  };

  VideoDynamicDirectedNetwork.prototype.initVis = function () {
    var n = this.simulation.modelSettings.network.size,
      edgeArray = [],
      nodeArray = [],
      colorHighlight = this.colorSet.strColorSet.HIGHLIGHT,
      colorEdges = this.colorSet.strColorSet.EDGES,
      colorNeutral = this.colorSet.strColorSet.NEUTRAL;

    for (var i = 0; i < n; i++) {
      nodeArray.push({
        id: i,
        size: 12
      });
    }

    var data = {
        nodes: new vis.DataSet(nodeArray),
        edges: new vis.DataSet([])
      },
      options = this.getVisOptions();

    var visNetwork = new vis.Network(this.domCache.canvasContainer, data, options);

    var nodeColors = [],
      nodes = visNetwork.body.nodes,
      color;

    for (var i = 0; i < n; i++) {
      color = nodes[i].options.color;
      color.hover = color;
      color.highlight = color;

      nodeColors[i] = nodes[i].options.color;
    }

    this.shownConnectionMatrix = new Int8Array(n * n);
    this.edges = data.edges;
    this.n = n;

    this.visNetwork = visNetwork;
    this.nodeColors = nodeColors;
  };

  
  VideoDynamicDirectedNetwork.prototype.setEdge = function (i, j, state) {
    var oldState = this.shownConnectionMatrix[i * this.n + j];

    var id = (i << 16) + j;
    if (oldState === state) {
      return;
    }
    
    this.shownConnectionMatrix[i * this.n + j] = state;
    if (state === 0) {
      this.edges.remove(id);
    } else {
      var type, color;
      if (state === 1) {
        color = this.colorSet.strColorSet.EDGES;
        type = 'arrow';
      } else {
        color = this.colorSet.strColorSet.EDGES_INHIBITING;
        type = 'circle';
      }
      var options = {
        id: id,
        from: j,
        to: i,
        smooth: false,
        arrows:{
          to: {
            enabled: true,
            type: type
          }
        },
        color: {
          color: color,
          highlight: color
        }
      };

      if (oldState === 0) {
        this.edges.add(options);
      } else {
        this.edges.update(options);
      }
    }
  };

  VideoDynamicDirectedNetwork.prototype.updateLinks = function (connections) {
    var n = this.n;
    for (var i = 0; i < n; i++) {
      for (var j = 0; j < n; j++) {
        this.setEdge(i, j, connections[i * n + j]);
      }
    }
  };

  spimosimCore.modules.add('Video', {
    name: 'dynamic directed network',
    files: [ 'lib/modules/Video/dynamic-directed-network.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A network with directed connection that can change over time.',
    date: '2020-03-26'
  }, VideoDynamicDirectedNetwork);
}());
