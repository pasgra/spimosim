/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var VarInitializer = spimosimUi.VarInitializer,
    modules = spimosimCore.modules;

  function SpinExpectationValueVarInitializer(config, controls, varName) {
    this.name  = 'spin-expectation-value-' + varName;
    config = tools.copyInto(config, {
      labelText: '⟨' + varName + '(t=0)⟩',
      name: this.name,
      value: '0',
      min: '-1',
      max: '1',
      step: '.01',
      diabled: false,
      shown: false
    });

    VarInitializer.call(this, config, controls, varName);
  }
  SpinExpectationValueVarInitializer.prototype = Object.create(VarInitializer.prototype);
  
  SpinExpectationValueVarInitializer.prototype.hasGui = function () {
    return !this.config.disabled || this.config.shown;
  }

  SpinExpectationValueVarInitializer.prototype.initGui = function () {
    var config = tools.copyInto(this.config, {}),
      name = this.name,
      varName = this.varName,
      controls = this.controls;

    config.syncURI = true;

    var setting = graphicTools.createSetting(config);

    this.domCache.setting = setting;

    if (config.key) {
      this.keyMap[config.key] = setting;
    }

    setting.addEventListener('change', function () {
      controls.restartOrUpdateSettings('settings');
    });

    return setting.domElement;
  };

  SpinExpectationValueVarInitializer.prototype.getValue = function (modelSettings) {
    var n = modelSettings.network.size;
    var expectationValue;
    if (this.hasGui()) {
      expectationValue = this.domCache.setting.getValue();
    } else {
      expectationValue = 'value' in this.config ? this.config.value : 0;
    }

    var spins = new Int8Array(n);

    for (var i = 0; i < n; i++) {
      spins[i] = 2 * Math.random() - 1 < expectationValue ?
        1 :
        -1;
    }

    return spins;
  };

  SpinExpectationValueVarInitializer.prototype.hasValue = function () {
    return true;
  };

  modules.add('VarInitializer', 'spin expectation value', SpinExpectationValueVarInitializer);

  modules.add('VarInitializer', 'int range', VarInitializer, {
    getValue: function (modelSettings) {
      var n = modelSettings.network.size,
        values = new Int32Array(n),
        min = this.config.min,
        num = 'num' in this.config ? this.config.num : modelSettings[this.config.numberVarName];

      for (var i = 0; i < n; i++) {
        values[i] = ~~(Math.random() * num) + min
      }

      return values;
    },

    hasValue: function () {
      return true;
    }
  });
  
  modules.add('VarInitializer', 'copy', VarInitializer, {
    customConstructor: function (config, controls, varName) {
      if (config.gui) {
        this.gui = true;
      } else {
        this.gui = false;
        this.value = (config.value !== false);
      }
      VarInitializer.call(this, config, controls, varName);
      this.name  = 'reuse-' + varName;
    },

    hasGui: function () {
      return this.config.gui;
    },

    getValue: function (modelSettings) {
      if (modelSettings.varsCopied === undefined) {
        modelSettings.varsCopied = [];
      }
      modelSettings.varsCopied.push(this.varName);
      
      var initializer = this.controls.initializer;
      return initializer.simulation.protocol.get(this.varName, initializer.clock.getT());
    },
    
    hasValue: function (newSettings, automaticStart) {
      if (!automaticStart || (this.gui ? !this.domCache.setting.getValue() : !this.value) || !this.controls.initializer.simulation) {
        return false;
      }
      var oldSettings = this.controls.initializer.simulation.modelSettings;
      if (oldSettings === undefined || !spimosimCore.networkRegister.sameSettings(oldSettings, newSettings)) {
        return false;
      }

      try {
        var initializer = this.controls.initializer;
        initializer.simulation.protocol.get(this.varName, initializer.clock.getT());
      } catch (e) {
        if (e === 'Unknown frame') {
          return false;
        } else {
          throw e;
        }
      }

      return true;
    },

    initGui: function () {
      var config = this.config,
        name = this.name,
        varName = this.varName,
        controls = this.controls;


      var newConfig = {
        labelText: 'Reuse old state when changing settings',
        name: name,
        value: ('value' in config) ? config.value : false,
        type: 'checkbox',
        syncUri: true
      };

      var setting = graphicTools.createSetting(newConfig);
      this.domCache.setting = setting;

      if (config.key) {
        this.keyMap[config.key] = setting;
      }

      return setting.domElement;
    }
  });

  function FloatExpectationValueVarInitializer(config, controls,
      varName) {
    SpinExpectationValueVarInitializer.call(this, config, controls, varName);
    this.name = 'float-expectation-value-' + varName;
  }
  FloatExpectationValueVarInitializer.prototype =
    Object.create(SpinExpectationValueVarInitializer.prototype);

  FloatExpectationValueVarInitializer.prototype.getValue = function (modelSettings) {
    var n = modelSettings.network.size,
      expectationValue = this.domCache.setting.getValue(),
      min = this.config.min,
      max = this.config.max,
      border = (expectationValue - min) / (max - min);

    var floats = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      if (Math.random() < border) {
        floats[i] = Math.random() * (expectationValue - min) + min;
      } else {
        floats[i] = max - Math.random() * (max - expectationValue);
      }
    }

    return floats;
  };

  modules.add('VarInitializer', 'float expectation value', FloatExpectationValueVarInitializer);


  function SpinImageVarInitializer(config, controls, varName) {
    VarInitializer.call(this, config, controls, varName);
    this.name = 'init-upload-' + varName;
    this.spins = undefined;
    this.network = {};
  }
  SpinImageVarInitializer.prototype = Object.create(VarInitializer.prototype);

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

  modules.add('VarInitializer', 'spin image', SpinImageVarInitializer);
}());
