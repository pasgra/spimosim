/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', 'quadratic', {
  labelText: 'L×L lattice',
  getVideoSettings: function (modelSettings) {
    return {
      type: '2d-lattice',
      width: modelSettings.network.L,
      height: modelSettings.network.L
    };
  },
  parameters: {
    L: {
      labelText: 'L',
      key: 'l',
      min: 1,
      value: 32,
      max: Math.sqrt(spimosimNetwork.MAX_NODES),
      step: 1,
      syncURI: true
    }
  }
});
