/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('VarInitializer', 'int range', spimosimUi.VarInitializer, {
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
  },
  {
    protocolVarType: 'Int32Array'
  });
