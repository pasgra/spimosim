/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'moore-quadratic',
    files: [ 'lib/modules/Network/moore-quadratic.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A quadratic two dimensional lattice with Moore neighbor hood.',
    date: '2020-03-26'
  }, {//quadratic 2d lattice with Moore neighbor hood
    parameters: [ 'L' ],
    generateAdjacencyLists: function (settings) {
      return spimosimCore.modules.get('Network', 'moore-2d-lattice').generateAdjacencyLists({
        width: settings.L,
        height: settings.L
      })
    },
    calculateNetworkSize: function (settings) {
      return settings.network.L * settings.network.L;
    }
  });
}());
