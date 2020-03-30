/* Copyright 2020 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'barabasi-albert-lattice-vis',
    files: [ 'lib/modules/NetworkUi/barabasi-albert-lattice-vis.js' ],
    depends: [ 'module:Video/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a Barabasi Albert network as a lattice.',
    date: '2020-03-26'
  }, {
  labelText: 'Barabási–Albert (show as lattice)',
  getVideoSettings: function (modelSettings) {
    return {
      type: '2d-lattice',
      width: modelSettings.network.sqrtn,
      height: modelSettings.network.sqrtn
    };
  },
  parameters: {
    m: {
      labelText: 'm',
      key: 'm',
      min: 1,
      value: 2,
      max: 50,
      step: 1,
      syncURI: true
    },
    sqrtn: {
      labelText: 'sqrt(n)',
      key: 'n',
      min: 1,
      value: 64,
      max: 1024,
      step: 1,
      syncURI: true
    }
  }
});

