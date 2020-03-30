/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'nd-lattice',
    files: [ 'lib/modules/Network/nd-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'An n-dimensional lattice with von Neumann neighbor hood.',
    date: '2020-03-26'
  }, {//n dimensional lattice with von Neumann neighbor hood
    parameters: [ 'dims', 'L', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var dims = settings.dims,
        L = settings.L,
        periodic = settings.periodic,
        n = Math.pow(L, dims),
        adjacencyLists = [],
        neighbors,
        L_k = 1,
        k, i;

      for (i = 0; i < n; i++) {
        adjacencyLists[i] = [];
      }

      for (k = 0; k < dims; k++) {
        for (i = 0; i < n; i++) {
          if ((~~(i / L_k)) % L === 0) {
            if (periodic) {
              adjacencyLists[i].push(i - L_k + L_k * L);
            }
          } else {
            adjacencyLists[i].push(i - L_k);
          }
          if ((~~(i / L_k + 1)) % L === 0) {
            if (periodic) {
              adjacencyLists[i].push(i + L_k - L_k * L);
            }
          } else {
            adjacencyLists[i].push(i + L_k);
          }
        }

        L_k *= L;
      }

      for (var i = 0; i < n; i++) {
        adjacencyLists[i] = spimosimNetwork.removeWrongNeighbors(i, adjacencyLists[i]);
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return Math.pow(settings.network.L, settings.network.dims);
    }
  });
}());
