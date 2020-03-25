/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', 'quadratic', {//quadratic 2d lattice with von Neumann neighbor hood
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
