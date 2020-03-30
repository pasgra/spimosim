/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'spimosim',
    files: [ 'lib/modules/NetworkUi/spimosim.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Spimosim.',
    date: '2020-03-26'
  }, {
  labelText: 'SpiMoSim!',
  getVideoSettings: function (modelSettings) {
    return {
      type: '2d-lattice',
      width: 200,
      height: 30
    };
  }
});
