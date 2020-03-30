/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;

  function cE(name) {
    return document.createElement(name);
  }

  function VideoNetwork(initializer, config, videoSection, colorSet) {
    DynamicVideo.call(this, initializer, config, videoSection, colorSet);
  }
  VideoNetwork.prototype = Object.create(DynamicVideo.prototype);

  VideoNetwork.prototype.getVisOptions = function () {
    var colorHighlight = this.colorSet.strColorSet.HIGHLIGHT,
      colorEdges = this.colorSet.strColorSet.EDGES,
      colorNodes = this.colorSet.strColorSet.NODES,
      colorNeutral = this.colorSet.strColorSet.NEUTRAL;
    return {
      physics: {
        maxVelocity: 150,
        minVelocity: .2,
        solver: 'forceAtlas2Based',
        timestep: 1,
        stabilization: {
          enabled: true,
          iterations: 32,
          updateInterval: 8,
          fit: true
        },
        barnesHut: {
          damping: 0,
        }
      },
      nodes: {
        shape: 'dot',
        color: {
          background: colorNeutral,
          border: colorNodes,
          highlight: {
            background: colorNeutral,
            border: colorHighlight
          }
        }
      },
      edges: {
        color: {
          color: colorEdges,
          highlight: colorHighlight
        }
      },
      layout: {
        improvedLayout: false
      }
    };
  };

  VideoNetwork.prototype.initGui = function () {
    var box = DynamicVideo.prototype.initGui.call(this);

    if (this.features['menu']) {
      var headingNetwork = cE('h4');
      headingNetwork.textContent = 'Network positions';
      this.domCache.divMenuContent.appendChild(headingNetwork);
      var buttonFreezeNetwork = cE('button');
      buttonFreezeNetwork.textContent = 'Freeze node positions';
      buttonFreezeNetwork.className = 'freeze-network';

      this.domCache.divMenuContent.appendChild(buttonFreezeNetwork);

      this.domCache.buttonFreezeNetwork = buttonFreezeNetwork;
      var video = this;
      this.domCache.buttonFreezeNetwork.addEventListener('click', function () {
        video.visNetwork.stopSimulation();
      });
    }

    this.domCache.divVideo.classList.add('video-network');
    
    return box;
  }

  VideoNetwork.prototype.drawFrame = function (t) {
    try {
      var protocol = this.simulation.protocol;

      this.drawFrameInImageData(this.pixels, protocol, t, this.drawMode);

      if (this.visNetwork) {
        this.setNodeColors();
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

  VideoNetwork.prototype.setNodeColors = function () {
    var nodeColors = this.nodeColors,
      data = this.pixels,
      n = this.simulation.modelSettings.network.size,
      int2StrMap = this.colorSet.int2StrMap;

    for (var i = 0; i < n; i++) {
      nodeColors[i].background = int2StrMap[data[i]];
    }

    this.visNetwork.redraw();
  };

  VideoNetwork.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);

    if (this.visNetwork) {
      this.visNetwork.destroy();
    }

    var n = simulation.modelSettings.network.size,
      video = this;

    this.pixels = new Int32Array(n);

    function setAdjacencyLists(objects) {
      if (objects.adjacencyLists) {
        video.setAdjacencyLists(objects.adjacencyLists);
      } else {
        simulation.once('requested objects', setAdjacencyLists);
      }
    }

    this.simulation.requestBackendObjects([ 'adjacencyLists' ]);
    this.simulation.once('requested objects', setAdjacencyLists);
  };

  VideoNetwork.prototype.setAdjacencyLists = function (adjacencyLists) {
    var n = adjacencyLists.length,
      edgeArray = [],
      nodeArray = [];

    for (var i = 0; i < n; i++) {
      var neighbors = adjacencyLists[i],
        len = neighbors.length;
      nodeArray.push({
        id: i,
        size: 12 * Math.sqrt(len)
      });

      for (var indexJ = 0; indexJ < len; indexJ++) {
        var j = neighbors[indexJ];

        if (j < i || adjacencyLists[j].indexOf(i) === -1) {
          edgeArray.push({
            from:i,
            to: j
          });
        }
      }
    }

    var data = {
        nodes: new vis.DataSet(nodeArray),
        edges: new vis.DataSet(edgeArray)
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

    this.visNetwork = visNetwork;
    this.nodeColors = nodeColors;
  };

  VideoNetwork.prototype.destroy = function () {
    if (this.visNetwork) {
      this.visNetwork.destroy();
      this.visNetwork = undefined;
    }
    DynamicVideo.prototype.destroy.call(this);
  };

  spimosimCore.modules.add('Video', {
    name: 'network',
    files: [ 'lib/modules/Video/network.js' ],
    depends: [ 'lib:dygraph' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a static network.',
    date: '2020-03-26'
  }, VideoNetwork);
}());
