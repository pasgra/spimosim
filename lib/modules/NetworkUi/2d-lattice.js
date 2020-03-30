/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: '2d-lattice',
    files: [ 'lib/modules/NetworkUi/2d-lattice.js' ],
    depends: [ 'module:Video/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a two dimensional lattice with von Neumann neighborhood.',
    date: '2020-03-26'
  }, {//2d lattice with von Neumann neighbor hood
  labelText: '2D lattice',
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
      key: 'h',
      min: 1,
      value: 32,
      max: Math.sqrt(spimosimNetwork.MAX_NODES),
      step: 1,
      syncURI: true
    },
    periodic: {
      type: 'checkbox',
      labelText: 'Periodic boundary conditions',
      value: true,
      syncURI: true
    }
  }
});
