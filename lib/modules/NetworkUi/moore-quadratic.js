/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'moore-quadratic',
    files: [ 'lib/modules/NetworkUi/moore-quadratic.js' ],
    depends: [ 'module:Video/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A two dimensional lattice with Moore neighborhood.',
    date: '2020-03-26'
  }, {
  labelText: 'L×L lattice with Moore neighborhood',
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
