/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var SpinExpectationValueVarInitializer = spimosimCore.modules.get('VarInitializer', 'spin expectation value');
  function FloatExpectationValueVarInitializer(config, controls, varName) {
    SpinExpectationValueVarInitializer.call(this, config, controls, varName);
    this.name = 'float-expectation-value-' + varName;
  }
  FloatExpectationValueVarInitializer.prototype = Object.create(SpinExpectationValueVarInitializer.prototype);

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

  FloatExpectationValueVarInitializer.protocolVarType = 'Float64Array';

  spimosimCore.modules.add('VarInitializer', {
    name: 'float expectation value',
    files: [ 'lib/modules/VarInitializer/float-expectation-value.js' ],
    depends: ['module:VarInitializer/spin expectation value'],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Generates random floats with a given expectation value.',
    date: '2020-03-26'
  }, FloatExpectationValueVarInitializer);
}());
