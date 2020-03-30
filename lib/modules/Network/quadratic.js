/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'quadratic',
    files: [ 'lib/modules/Network/quadratic.js' ],
    depends: [ 'module:Network/2d-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A quadratic two dimensional lattice with con Neumann neighbor hood.',
    date: '2020-03-26'
  }, {//quadratic 2d lattice with von Neumann neighbor hood
    parameters: [ 'L' ],
    generateAdjacencyLists: function (settings) {
      return spimosimCore.modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: settings.L,
        height: settings.L,
        periodic: true
      })
    },
    calculateNetworkSize: function (settings) {
      return settings.network.L * settings.network.L;
    }
  });
}());
