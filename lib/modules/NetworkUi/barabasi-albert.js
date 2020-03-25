/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', 'barabasi-albert', {
  labelText: 'Barabási–Albert',
  getVideoSettings: function (modelSettings) {
    return {
      type: 'network'
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
    n: {
      labelText: 'n',
      key: 'n',
      min: 1,
      value: 32,
      max: 1024,
      step: 1,
      syncURI: true
    }
  }
});
