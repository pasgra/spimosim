/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var CANVAS_MAX_HEIGHT = 2048,//The maximal possible size of a canvas depends on the browser. 2048 should be fine
    Video = spimosimUi.Video;

  spimosimUi.colorSet.HIGHLIGHT = '#6e95b5';
  spimosimUi.colorSet.EDGES = '#4682b4';
  spimosimUi.colorSet.EDGES_INHIBITING = '#b40431';
  spimosimUi.colorSet.NODES = '#4682b4';


  function cE(name) {
    return document.createElement(name);
  }


  function Video1d(initializer, config, videoSection, colorSet) {
    Video.call(this, initializer, config, videoSection, colorSet);
    var video = this;
    this.newDataListener = {
      dispatcher: undefined,
      type: 'new data',
      callback: function () {
        video.setVideoDimensions();
	  }
	}
    this.shownT = -1;
    this.setVideoDimensions();
  }

  Video1d.prototype = Object.create(Video.prototype);

  Video1d.prototype.initGui = function () {
    var divVideo = cE('div');
    divVideo.className = 'video-static';

    var canvasFrame = cE('div');
    canvasFrame.className = 'canvas-frame';
    var videoMenuDomCache = this.initVideoMenu();
    canvasFrame.appendChild(videoMenuDomCache.formVideoMenu);

    var videoCanvas = cE('canvas');
    videoCanvas.height = 100;
    videoCanvas.width = 100;
    canvasFrame.appendChild(videoCanvas);


    divVideo.appendChild(canvasFrame);

    var box = cE('div');
    this.shownT = -1;

    this.domCache = videoMenuDomCache;
    this.domCache.box = box;
    this.domCache.divVideo = divVideo;
    this.domCache.canvasFrame = canvasFrame;
    this.domCache.videoCanvas = videoCanvas;

    box.appendChild(divVideo);
    
    var video = this;
    this.attachEventListeners([
      {
        dispatcher: $(this.domCache.buttonSaveAnimatedGif),
        type: 'click',
        callback: function boundSaveAnimatedGif() {
          var t, tMax, fileName;

          t = graphicTools.askForNumber(
            'Which is the first frame that you want to save?', video.simulation.getTMin(),
            video.simulation.getTMaxCalculated());
          if (t === undefined) {
            return;
          }
          
          tMax = graphicTools.askForNumber(
            'Which is the last frame that you want to save?', t,
              video.simulation.getTMaxCalculated());
          if (tMax === undefined) {
            return;
          }
          
          var stepsPerFrame = graphicTools.askForNumber(
            'How many simulated steps per frame?', 1, tMax - t);
          if (stepsPerFrame === undefined) {
            return;
          }
          
          fileName = video.getAnimatedGifFileName(t, tMax, video,drawModes[video.drawMode].text);
          spimosimUi.imageSaver.saveAnimatedGif(video.simulation,
              video, video.initializer.downloader, 20, stepsPerFrame, t, tMax, fileName, video.config.gifWorkerUrl);
        }
      },
      {
        dispatcher: $(this.domCache.buttonSaveFrame),
        type: 'click',
        callback: function boundSaveFrame() {
          var t = graphicTools.askForNumber('Which frame do you want to save?', video.simulation.getTMin(),
              video.simulation.getTMaxCalculated()),
            fileName = video.getFrameFileName(t, video.drawModes[video.drawMode].text);

          if (t !== undefined) {
            spimosimUi.imageSaver.saveFrame(video.simulation, video, t);
          }
        }
      }
    ]);

    return box;
  }

  Video1d.prototype.setSimulation = function (simulation) {
    if (this.simulation) {
      this.detachEventListener(this.newDataListener);
	}
    Video.prototype.setSimulation.call(this, simulation);
    this.newDataListener.dispatcher = simulation;
    this.attachEventListener(this.newDataListener);

    var n = this.simulation.modelSettings.network.size;

    this.n = n;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = n;
    this.domCache.videoCanvas.height = Math.min(this.tMax, CANVAS_MAX_HEIGHT);

    this.imageData = this.createImageData(this.ctx);
    this.pixels = new Int32Array(this.imageData.data.buffer);

    this.shownT = -1;
  };

  Video1d.prototype.setVideoDimensions = function (e) {
    var tMax = this.initializer.controls.getTMax();
    var oldPic = this.ctx.getImageData(0, 0, this.domCache.videoCanvas.width, this.domCache.videoCanvas.height);
    this.tMax = Math.min(tMax, CANVAS_MAX_HEIGHT);
    this.domCache.videoCanvas.height = this.tMax;
    this.ctx.putImageData(oldPic, 0, 0);
  };

  Video1d.prototype.draw = function (clock) {
    var tMax = Math.min(Math.min(this.tMax, this.simulation.getTMaxCalculated()), CANVAS_MAX_HEIGHT);
    var linesDrawn = 0;
    
    if (this.drawMode !== this.shownDrawMode) {
      this.shownT = -1;
      this.shownDrawMode = this.drawMode;
    }
    
    // Draw up to 16 lines at one
    while (this.shownT < tMax && ++linesDrawn < 16) {
      this.drawFrame(this.shownT + 1);
    }
  };

  Video1d.prototype.drawFrame = function (t) {
    var protocol = this.simulation.protocol;
    try {
      this.drawFrameInImageData(this.pixels, protocol, t, this.drawMode);

      this.ctx.putImageData(this.imageData, 0, t);
      this.shownT = t;
    } catch (e) {
      if (e === 'Unknown variable') {
        this.ctx.fillStyle =
          this.colorSet.strColorSet.INVALID;
        this.ctx.fillRect(0, t, this.domCache.videoCanvas.width, 1);
        this.shownT = t;
      } else if (e === 'Unknown frame') {
        this.ctx.fillStyle =
          this.colorSet.strColorSet.NEUTRAL;
        this.ctx.fillRect(0, t, this.domCache.videoCanvas.width, 1);
        this.shownT = t;
      } else {
        throw e;
      }
    }
  };

  Video1d.prototype.getFrameWidth = function () {
    return this.n;
  };

  Video1d.prototype.getFrameHeight = function () {
    return 1;
  };

  spimosimCore.modules.add('Video', '1d-lattice', Video1d);
}());

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;

  function cE(name) {
    return document.createElement(name);
  }

  function Video2d(initializer, config, videoSection, colorSet) {
    DynamicVideo.call(this, initializer, config, videoSection, colorSet);
  }
  Video2d.prototype = Object.create(DynamicVideo.prototype);

  Video2d.prototype.initGui = function () {
    var box = DynamicVideo.prototype.initGui.call(this);

    this.domCache.divVideo.classList.add('video-2d');

    var video = this;
    
    if (this.features['downloads menu']) {
      var buttonSaveFrame = cE('button');
      buttonSaveFrame.className = 'save-frame';
      buttonSaveFrame.textContent = 'Frame as PNG';
      this.domCache.downloadMenu.appendChild(buttonSaveFrame);
      this.domCache.buttonSaveFrame = buttonSaveFrame;

      var buttonSaveAnimatedGif = cE('button');
      buttonSaveAnimatedGif.className = 'save-animated-gif';
      buttonSaveAnimatedGif.textContent = 'Animated GIF';
      this.domCache.downloadMenu.appendChild(buttonSaveAnimatedGif);
      this.domCache.buttonSaveAnimatedGif = buttonSaveAnimatedGif;
      this.attachEventListeners([
        {
          dispatcher: $(this.domCache.buttonSaveAnimatedGif),
          type: 'click',
          callback: function () {
            var t, tMax, fileName, fps;

            t = graphicTools.askForNumber(
              'Which is the first frame that you want to save?', video.simulation.getTMin(),
              video.simulation.getTMaxCalculated());
            if (t === undefined) {
              return;
            }

            tMax = graphicTools.askForNumber(
              'Which is the last frame that you want to save?', t,
              video.simulation.getTMaxCalculated());
            if (tMax === undefined) {
              return;
            }

            var stepsPerFrame = graphicTools.askForNumber(
              'How many simulated steps per frame?', 1, tMax - t);
            if (stepsPerFrame === undefined) {
              return;
            }
            
            fileName = video.getAnimatedGifFileName(t, tMax, video.drawModes[video.drawMode].text);
            fps = parseInt(video.initializer.clock.fps);

            spimosimUi.imageSaver.saveAnimatedGif(video.simulation,
                video, video.initializer.downloader, fps, stepsPerFrame, t, tMax, fileName, video.config.gifWorkerUrl);
          }
        },
        {
          dispatcher: $(this.domCache.buttonSaveFrame),
          type: 'click',
          callback: function (){
            var t = parseInt(video.initializer.clock.getT()),
              fileName = video.getFrameFileName(t, video.drawModes[video.drawMode].text);

            if (t) {
              spimosimUi.imageSaver.saveFrame(video.simulation, video, t,
                fileName);
            }
          }
        }
      ]);
    }
    
    this.attachEventListener({
      dispatcher: $(this.domCache.canvasFrame),
      type: 'click',
      callback: function (e){
        if (!video.domCache.formVideoMenu.contains(e.target)) {
          video.playPause();
        }
      }
    });
    
    return box;
  }

  Video2d.prototype.drawFrame = function (t) {
    try {
      var protocol = this.simulation.protocol;

      this.drawFrameInImageData(this.pixels, protocol, t, this.drawMode);

      this.ctx.putImageData(this.imageData, 0, 0);

      this.setFrameNotSaved(false);
      this.setFrameNotSimulated(false);
      this.setStartingSimulation(false);

      this.shownT = t;
      this.shownDrawMode = this.drawMode;
    } catch (e) {
      this.shownT = undefined;
      if (e === 'Unknown variable' || e === 'Unknown frame') {
        if (this.simulation.tMaxCalculated >= 0) {
          if (t <= this.simulation.tMaxCalculated) {
            this.shownT = t;
            this.shownDrawMode = this.drawMode;

            this.ctx.fillStyle =
              this.colorSet.strColorSet.INVALID;
            this.ctx.fillRect(0, 0, this.domCache.videoCanvas.width,
              this.domCache.videoCanvas.height);

            this.setFrameNotSaved(true);
            this.setFrameNotSimulated(false);
          } else {
            this.ctx.fillStyle =
              this.colorSet.strColorSet.NEUTRAL;
            this.ctx.fillRect(0, 0, this.domCache.videoCanvas.width,
              this.domCache.videoCanvas.height);

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

  Video2d.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);

    var width = simulation.modelSettings.video.width,
      height = simulation.modelSettings.video.height;

    this.width = width;
    this.height = height;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = width;
    this.domCache.videoCanvas.height = height;

    this.imageData = this.createImageData(this.ctx);
    this.pixels = new Int32Array(this.imageData.data.buffer);
  };

  Video2d.prototype.setFrameNotSimulated = function (frameNotSimulated) {
    DynamicVideo.prototype.setFrameNotSimulated.call(this, frameNotSimulated);

    if (frameNotSimulated && this.ctx) {
      this.ctx.clearRect(0, 0, this.domCache.videoCanvas.width,
        this.domCache.videoCanvas.height);
    }
  }

  Video2d.prototype.setStartingSimulation = function (startingSimulation) {
    DynamicVideo.prototype.setStartingSimulation.call(this, startingSimulation);

    if (startingSimulation && this.ctx) {
      this.ctx.clearRect(0, 0, this.domCache.videoCanvas.width,
        this.domCache.videoCanvas.height);
    }
  }

  function VideoNd(initializer, config, videoSection, colorSet) {
    Video2d.call(this, initializer, config, videoSection, colorSet);
  }
  VideoNd.prototype = Object.create(Video2d.prototype);

  VideoNd.prototype.initGui = function () {
    var box = Video2d.prototype.initGui.call(this);
    this.domCache.divVideo.classList.remove('video-2d');
    this.domCache.divVideo.classList.add('video-nd');

    var formOffsetInputs = cE('div');
    formOffsetInputs.className = 'offset-inputs settings';

    var headingOffsetInputs = cE('h3');
    headingOffsetInputs.textContent = 'Scroll through the dimensions';
    formOffsetInputs.appendChild(headingOffsetInputs);
    
    var divOffsetInputs = cE('div');
    formOffsetInputs.appendChild(divOffsetInputs);

    this.domCache.divMenuContent.appendChild(formOffsetInputs);
    this.domCache.formOffsetInputs = formOffsetInputs;
    this.domCache.divOffsetInputs = divOffsetInputs;

    return box;
  }

  VideoNd.prototype.destroy = function () {
    Video2d.prototype.destroy.call(this);
    this.domCache.formOffsetInputs.remove();
  }

  VideoNd.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);

    var L = simulation.modelSettings.video.L,
      dims = simulation.modelSettings.video.dims,
      video = this;

    graphicTools.removeAllChildNodes(this.domCache.divOffsetInputs);
    this.pixelsOffset = 0;
    if (dims > 2) {
      this.domCache.divOffsetInputs.display = 'block';
      for (var k = 3; k <= dims; k++) {
        (function (dim) {
          var setting = graphicTools.createSetting({
              name: 'x_' + dim,
              labelText: 'x<sub>' + dim + '</sub>',
              value: 0,
              min: 0,
              max: L - 1,
              step: 1
            });

          video.attachEventListener({
            dispatcher: setting,
            type: 'change',
            callback: function (e) {
              var L = video.L,
                val = setting.getValue(),
                oldOffset = video.pixelsOffset,
                oldVal = (~~(oldOffset / Math.pow(L, dim - 1)) % L);

              video.pixelsOffset += Math.pow(L, dim - 1) * (val - oldVal);
            }
          });

          video.domCache.divOffsetInputs.appendChild(setting.domElement);
        }(k));
      }
    } else {
      this.domCache.divOffsetInputs.display = 'none';
    }

    this.L = L;
    this.width = L;
    this.height = L;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = L;
    this.domCache.videoCanvas.height = L;

    this.imageData = this.createImageData(this.ctx);
    this.pixels = new Int32Array(this.imageData.data.buffer);
  };

  VideoNd.prototype.drawFrameInImageData = function (pixels, protocol, t, drawMode) {
    var offset = this.pixelsOffset;
    this.drawModes[drawMode].draw.call(this, pixels, protocol, t, offset);
  };

  VideoNd.prototype.drawFrame = function (t) {
    Video2d.prototype.drawFrame.call(this, t);
    this.shownDataOffset = this.pixelsOffset;
  };

  VideoNd.prototype.isFrameShown = function (t) {
    return t !== this.shownT ||
      this.pixelsOffset !== this.shownDataOffset ||
      this.drawMode !== this.shownDrawMode;
  };

  spimosimCore.modules.add('Video', '2d-lattice', Video2d);
  spimosimCore.modules.add('Video', 'nd-lattice', VideoNd);
}());

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
        if (this.simulation.tMaxCalculated >= 0) {
          if (t <= this.simulation.tMaxCalculated) {
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

  spimosimCore.modules.add('Video', 'network', VideoNetwork);
  
  
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
        if (this.simulation.tMaxCalculated >= 0) {
          if (t <= this.simulation.tMaxCalculated) {
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

  spimosimCore.modules.add('Video', 'dynamic directed network', VideoDynamicDirectedNetwork);
}());
