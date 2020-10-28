/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('VarInitializer', {
    name: 'int range',
    files: [ 'lib/modules/VarInitializer/int-range.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Generates random integers in a given range with equal probability.',
    date: '2020-03-26'
  }, spimosimUi.VarInitializer, {
    getValue: function (modelSettings) {
      var n = modelSettings.network.size,
        values = new Int32Array(n),
        min = this.config.min,
        num = 'num' in this.config ? this.config.num : modelSettings.parameters[this.config.numberVarName];

      for (var i = 0; i < n; i++) {
        values[i] = ~~(Math.random() * num) + min
      }

      return values;
    },

    hasValue: function () {
      return true;
    }
  },
  {
    protocolVarType: 'Int32Array'
  });
