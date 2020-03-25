/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', '1d-lattice', {
  labelText: '1D lattice',//The shown label text
  getVideoSettings: function (modelSettings) {
    return {
      type: '1d-lattice',
      width: modelSettings.network.width
    };
  },
  //Config for inputs created video graphicTools.createSetting. See there for
  //documentation.
  //Their parsed values will be passed to the simulation to define the network
  parameters: {
    n: {
      labelText: 'n',
      key: 'n',//Use key 'n' as a shortcut to increase/decrease the value
      min: 1,
      value: 128,
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
