/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', '2d-lattice', {//2d lattice with von Neumann neighbor hood
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
