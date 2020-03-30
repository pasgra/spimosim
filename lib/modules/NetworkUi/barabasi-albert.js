/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'barabasi-albert',
    files: [ 'lib/modules/NetworkUi/barabasi-albert.js' ],
    depends: [ 'module:Video/network' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows a Barabasi Albert network using dygraphs.',
    date: '2020-03-26'
  }, {
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
