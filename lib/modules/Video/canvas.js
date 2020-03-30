/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;

  function cE(name) {
    return document.createElement(name);
  }

  function VideoCanvas(initializer, config, videoSection, colorSet) {
    DynamicVideo.call(this, initializer, config, videoSection, colorSet);
  }
  VideoCanvas.prototype = Object.create(DynamicVideo.prototype);
  
  VideoCanvas.prototype.drawMethod = 'canvas';

  VideoCanvas.prototype.initGui = function () {
    var box = DynamicVideo.prototype.initGui.call(this);

    this.domCache.divVideo.classList.add('canvas-video');

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

  VideoCanvas.prototype.drawFrame = function (t) {
    try {
      var protocol = this.simulation.protocol;

      this.drawFrameInContext(this.ctx, protocol, t, this.drawMode);

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
            this.setBackground(this.colorSet.strColorSet.NEUTRAL);

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
  
  VideoCanvas.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);

    this.width = 400;
    this.height = 400;

    //Sets the dimension of the canvas
    this.domCache.videoCanvas.width  = 400;
    this.domCache.videoCanvas.height = 400;
  };

  VideoCanvas.prototype.setFrameNotSimulated = function (frameNotSimulated) {
    DynamicVideo.prototype.setFrameNotSimulated.call(this, frameNotSimulated);

    if (frameNotSimulated && this.ctx) {
      this.setBackground(0);
    }
  }

  VideoCanvas.prototype.setStartingSimulation = function (startingSimulation) {
    DynamicVideo.prototype.setStartingSimulation.call(this, startingSimulation);

    if (startingSimulation && this.ctx) {
      this.setBackground(0);
    }
  }
  
  VideoCanvas.prototype.setBackground = function (color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.domCache.videoCanvas.width, this.domCache.videoCanvas.height);
  };

  spimosimCore.modules.add('Video', {
    name: 'canvas',
    files: [ 'lib/modules/Video/canvas.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows something on a canvas.',
    date: '2020-03-26'
  }, VideoCanvas);
}());
