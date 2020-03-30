/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'moore-2d-lattice',
    files: [ 'lib/modules/NetworkUi/moore2d-lattice.js' ],
    depends: [ 'module:Video/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A two dimensional lattice with moore neighborhood.',
    date: '2020-03-26'
  }, {
  labelText: '2D lattice with Moore neighborhood',
  getVideoSettings: function (modelSettings) {
    return {
      type: '2d-lattice',
      width: modelSettings.network.width,
      height: modelSettings.network.height
    };
  },
  parameters: {
    width: {
      labelText: 'width',
      key: 'w',
      min: 1,
      value: 32,
      max: Math.sqrt(spimosimNetwork.MAX_NODES),
      step: 1,
      syncURI: true
    },
    height: {
      labelText: 'height',
      key: 'w',
      min: 1,
      value: 32,
      max: Math.sqrt(spimosimNetwork.MAX_NODES),
      step: 1,
      syncURI: true
    }
  }
});
