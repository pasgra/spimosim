/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', 'dynamic-directed', {
  labelText: 'Dynamic directed network',
  getVideoSettings: function (modelSettings) {
    return {
      type: 'dynamic directed network'
    };
  },
  parameters: {
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
