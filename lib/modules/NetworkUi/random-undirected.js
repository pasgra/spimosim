/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'random undirected',
    files: [ 'lib/modules/NetworkUi/random-undirected.js' ],
    depends: [ 'module:Video/network' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a random undirected network.',
    date: '2020-03-26'
  }, {
  labelText: 'Random undirected network',
  getVideoSettings: function (modelSettings) {
    return {
      type: 'network',
    };
  },
  parameters: {
    n: {
      labelText: 'n',
      key: 'n',
      min: 1,
      value: 128,
      max: 1024,
      step: 1,
      logScale: true,
      syncURI: true
    },
    p: {
      labelText: 'Proportion of egdes created',
      value: '.1',
      min: 0.0000001,
      max: 1,
      step: 'any',
      key: 'p',
      logScale: true,
      syncURI: true
    }
  }
});
