'use strict';

(function () {
  var Video2dLattice = spimosimCore.modules.get('Video', '2d-lattice');

  function cE(name) {
    return document.createElement(name);
  }

  function VideoNdLattice(initializer, config, videoSection, colorSet) {
    Video2dLattice.call(this, initializer, config, videoSection, colorSet);
  }
  VideoNdLattice.prototype = Object.create(Video2dLattice.prototype);

  VideoNdLattice.prototype.initGui = function () {
    var box = Video2dLattice.prototype.initGui.call(this);
    this.domCache.divVideo.classList.remove('video-2d');
    this.domCache.divVideo.classList.add('video-nd');
    
    if (this.features['menu']) {
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
    }

    return box;
  }

  VideoNdLattice.prototype.destroy = function () {
    Video2dLattice.prototype.destroy.call(this);
    if (this.domCache.divOffsetInputs) {
      this.domCache.formOffsetInputs.remove();
    }
  }

  VideoNdLattice.prototype.setSimulation = function (simulation) {
    spimosimUi.DynamicVideo.prototype.setSimulation.call(this, simulation);

    var L = simulation.modelSettings.video.L,
      dims = simulation.modelSettings.video.dims,
      video = this;
    
    this.pixelsOffset = 0;
    
    if (this.domCache.divOffsetInputs) {
      graphicTools.removeAllChildNodes(this.domCache.divOffsetInputs);

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

  VideoNdLattice.prototype.drawFrameInImageData = function (pixels, protocol, t, drawMode) {
    var offset = this.pixelsOffset;
    this.drawModes[drawMode].draw.call(this, pixels, protocol, t, offset);
  };

  VideoNdLattice.prototype.drawFrame = function (t) {
    Video2dLattice.prototype.drawFrame.call(this, t);
    this.shownDataOffset = this.pixelsOffset;
  };

  VideoNdLattice.prototype.isFrameShown = function (t) {
    return t !== this.shownT ||
      this.pixelsOffset !== this.shownDataOffset ||
      this.drawMode !== this.shownDrawMode;
  };

  spimosimCore.modules.add('Video', {
    name: 'nd-lattice',
    files: [ 'lib/modules/Video/nd-lattice.js' ],
    depends: [ 'module:Video/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows 2d layers of an n dimensional lattice.',
    date: '2020-03-26'
  }, VideoNdLattice);
}());
