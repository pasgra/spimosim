/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'dynamic directed',
    files: [ 'lib/modules/NetworkUi/dynamic-directed.js' ],
    depends: [ 'module:dynamic directed network' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A dynamic directed network.',
    date: '2020-03-26'
  }, {
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
