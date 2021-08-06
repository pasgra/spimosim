/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
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
    });

    spimosimUi.VarInitializer.call(this, config, controls, varName);
  }
  SpinExpectationValueVarInitializer.prototype = Object.create(spimosimUi.VarInitializer.prototype);

  SpinExpectationValueVarInitializer.protocolVarType = 'SpinArray';
  
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

  spimosimCore.modules.add('VarInitializer', {
    name: 'spin expectation value',
    files: [ 'lib/modules/VarInitializer/spin-expectation-value.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Generates random spins/booleans with a given expectation value.',
    date: '2020-03-26'
  }, SpinExpectationValueVarInitializer);
}());
