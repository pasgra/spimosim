'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;

  function cE(name) {
    return document.createElement(name);
  }

  function Video2dLattice(initializer, config, videoSection, colorSet) {
    DynamicVideo.call(this, initializer, config, videoSection, colorSet);
  }
  Video2dLattice.prototype = Object.create(DynamicVideo.prototype);
  
  Video2dLattice.prototype.drawMethod = 'image data';

  Video2dLattice.prototype.initGui = function () {
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
          dispatcher: this.domCache.buttonSaveAnimatedGif,
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
          dispatcher: this.domCache.buttonSaveFrame,
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
      dispatcher: this.domCache.canvasFrame,
      type: 'click',
      callback: function (e){
        if (!video.domCache.formVideoMenu.contains(e.target)) {
          video.playPause();
        }
      }
    });
    
    return box;
  }

  Video2dLattice.prototype.drawFrame = function (t) {
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
        if (this.simulation.getTMaxCalculated() >= 0) {
          if (t <= this.simulation.getTMaxCalculated()) {
            this.shownT = t;
            this.shownDrawMode = this.drawMode;

            this.setBackground(this.colorSet.strColorSet.INVALID);
            this.setFrameNotSaved(true);
            this.setFrameNotSimulated(false);
          } else {
            this.clearBackground();
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
  
  Video2dLattice.prototype.setBackground = function (color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.domCache.videoCanvas.width, this.domCache.videoCanvas.height);
  };

  Video2dLattice.prototype.clearBackground = function () {
    this.ctx.clearRect(0, 0, this.domCache.videoCanvas.width, this.domCache.videoCanvas.height);
  };

  Video2dLattice.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);

    var width = simulation.modelSettings.video.width,
      height = simulation.modelSettings.video.height;

    if (isNaN(width)) {
      throw new Error("simulation.modelSettings.network.width is not set or is invalid. simulation.modelSettings.network = " + JSON.stringify(simulation.modelSettings.network));
    }
    if (isNaN(height)) {
      throw new Error("simulation.modelSettings.network.height is not set or is invalid. simulation.modelSettings.network = " + JSON.stringify(simulation.modelSettings.network));
    }

    this.width = width;
    this.height = height;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = width;
    this.domCache.videoCanvas.height = height;

    this.imageData = this.createImageData(this.ctx);
    this.pixels = new Int32Array(this.imageData.data.buffer);
  };

  Video2dLattice.prototype.setFrameNotSimulated = function (frameNotSimulated) {
    DynamicVideo.prototype.setFrameNotSimulated.call(this, frameNotSimulated);

    if (frameNotSimulated && this.ctx) {
      this.clearBackground();
    }
  }

  Video2dLattice.prototype.setStartingSimulation = function (startingSimulation) {
    DynamicVideo.prototype.setStartingSimulation.call(this, startingSimulation);

    if (startingSimulation && this.ctx) {
      this.clearBackground();
    }
  }
  
  spimosimCore.modules.add('Video', {
    name: '2d-lattice',
    files: [ 'lib/modules/Video/2d-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a 2d lattice as a rectangle with colored pixels.',
    date: '2020-03-26'
  }, Video2dLattice);
}());

