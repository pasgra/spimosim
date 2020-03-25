/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', 'moore-quadratic', {//quadratic 2d lattice with Moore neighbor hood
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
