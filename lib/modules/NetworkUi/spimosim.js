/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', 'spimosim', {
  labelText: 'SpiMoSim!',
  getVideoSettings: function (modelSettings) {
    return {
      type: '2d-lattice',
      width: 200,
      height: 30
    };
  }
});
