/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  function SpinImageVarInitializer(config, controls, varName) {
    spimosimUi.VarInitializer.call(this, config, controls, varName);
    this.name = 'init-upload-' + varName;
    this.spins = undefined;
    this.network = {};
  }
  SpinImageVarInitializer.prototype = Object.create(spimosimUi.VarInitializer.prototype);

  SpinImageVarInitializer.prototype.initGui = function (config) {
    var setting = graphicTools.createFileSetting({
      labelText: 'Upload image of initial state',
      name: this.name,
    });

    var setting = setting;

    this.domCache.setting = setting;

    var initializer = this;
    setting.addEventListener('change', function () {
      initializer.parseFile();
    });

    return setting.domElement;
  };

  SpinImageVarInitializer.prototype.parseFile = function () {
    var input = this.domCache.setting;
    if (input.getValue().length !== 1) {
      this.invalidFile();
      return;
    }

    var name = this.controls.getParameterNameForInput(this),
      file = input.getValue()[0],
      fileUrl = URL.createObjectURL(file),
      initializer = this,
      img = new Image();

    img.onload = function () {
      URL.revokeObjectURL(fileUrl);
      initializer.parseImage(img);
    };

    img.src = fileUrl;

    this.controls.restartOrUpdateSettings('settings');
  };

  SpinImageVarInitializer.prototype.parseImage = function (img) {
    var canvas = document.createElement('canvas'),
      width = img.width,
      height = img.height;

    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    var pixels = new Int32Array(
      ctx.getImageData(0, 0, width, height).data.buffer);

    var colors = {}
    for (var i = 0, len = pixels.length; i < len; i++) {
      colors[pixels[i]] = true;
    }

    var colorArray = [];
    for (var color in colors) {
      if (colors.hasOwnProperty(color)) {
        colorArray.push(parseInt(color, 10));
      }
    }

    if (colorArray.length > 2) {
      alert('This image has more than two colors.');
      this.invalidFile();
      return;
    }

    var colorUp = Math.max(colorArray[0], colorArray[1]),
      spins = new Int8Array(width * height);

    for (var i = 0, len = pixels.length; i < len; i++) {
      if (pixels[i] === colorUp) {
        spins[i] = 1;
      } else {
        spins[i] = -1;
      }
    }

    this.value = spins;

    this.modelSettings = {
      width: width,
      height: height
    };

    this.validFile();

    this.controls.restartOrUpdateSettings('settings');
  };

  SpinImageVarInitializer.prototype.setFileMsg = function (msg) {
    this.domCache.setting.setMsg(msg);
  };

  SpinImageVarInitializer.prototype.validFile = function () {
    this.domCache.setting.setValid();
    this.domCache.setting.setMsg('');
  };

  SpinImageVarInitializer.prototype.invalidFile = function () {
    this.domCache.setting.setInvalid();
    this.domCache.setting.removeFile();

    this.value = undefined;
  };

  SpinImageVarInitializer.prototype.getValue = function () {
    return this.value;
  };

  SpinImageVarInitializer.prototype.hasValue = function (modelSettings) {
    if (this.value === undefined) {
      return false;
    }

    var width = this.modelSettings.width;
    var height = this.modelSettings.height;

    if (modelSettings.height !== height && modelSettings.width !== width) {
      this.setFileMsg('Error: height≠' + height + ', width≠' + width);
      return false;
    } else if (modelSettings.height !== height) {
      this.setFileMsg('Error: height≠' + height);
      return false;
    } else if (modelSettings.width !== width) {
      this.setFileMsg('Error: width≠' + width);
      return false;
    }

    this.setFileMsg('');
    return true;
  };

  SpinImageVarInitializer.protocolVarType = 'spin-array';

  spimosimCore.modules.add('VarInitializer', {
    name: 'spin image',
    files: [ 'lib/modules/VarInitializer/spin-image.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Uses pixels from a image to inialize a 2d spin/boolean lattice.',
    date: '2020-03-26'
  }, SpinImageVarInitializer);
}());
