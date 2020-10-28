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


  function Video1dLattice(initializer, config, videoSection, colorSet) {
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

  Video1dLattice.prototype = Object.create(Video.prototype);
  Video1dLattice.prototype.drawMethod = 'image data';


  Video1dLattice.prototype.initGui = function () {
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
    /*this.attachEventListeners([
      {
        dispatcher: this.domCache.buttonSaveAnimatedGif,
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
        dispatcher: this.domCache.buttonSaveFrame,
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
    ]);*/

    return box;
  }

  Video1dLattice.prototype.setSimulation = function (simulation) {
    if (this.simulation) {
      this.detachEventListener(this.newDataListener);
	}
    Video.prototype.setSimulation.call(this, simulation);
    this.newDataListener.dispatcher = simulation;
    this.attachEventListener(this.newDataListener);

    var n = simulation.modelSettings.video.width;
    this.n = n;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = n;
    this.domCache.videoCanvas.height = Math.min(this.tMax, CANVAS_MAX_HEIGHT);

    this.imageData = this.createImageData(this.ctx);
    this.pixels = new Int32Array(this.imageData.data.buffer);

    this.shownT = -1;
  };

  Video1dLattice.prototype.setVideoDimensions = function (e) {
    var tMax = this.initializer.simulation.getTMax();
    var oldPic = this.ctx.getImageData(0, 0, this.domCache.videoCanvas.width, this.domCache.videoCanvas.height);
    this.tMax = Math.min(tMax, CANVAS_MAX_HEIGHT);
    this.domCache.videoCanvas.height = this.tMax;
    this.ctx.putImageData(oldPic, 0, 0);
  };

  Video1dLattice.prototype.draw = function (clock) {
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

  Video1dLattice.prototype.drawFrame = function (t) {
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

  Video1dLattice.prototype.getFrameWidth = function () {
    return this.n;
  };

  Video1dLattice.prototype.getFrameHeight = function () {
    return 1;
  };

  spimosimCore.modules.add('Video', {
    name: '1d-lattice',
    files: [ 'lib/modules/Video/1d-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a 1d lattice as a line and multiple time steps below each other.',
    date: '2020-03-26'
  }, Video1dLattice);
}());
