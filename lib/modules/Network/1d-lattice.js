/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: '1d-lattice',
    files: [ 'lib/modules/Network/1d-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A one dimensional lattice / a chain.',
    date: '2020-03-26'
  }, {
    parameters: [ 'n', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = [],
        n = settings.n,
        periodic = settings.periodic,
        neighbors, i;

      if (periodic) {
        //Periodic boundary conditions. The first and the last agent are neighbors
        for (i = 0; i < n; i++) {
          neighbors = [
            (n + i - 1) % n,//the left neighbor
            (i + 1) % n//the right neighbor
          ];

          //The periodic boundary conditions can cause the agent to be its own
          //neighbor and the left and right neighbor or the the lower and upper
          //neighbor to be the same agent
          neighbors = spimosimNetwork.removeWrongNeighbors(i, neighbors);

          adjacencyLists[i] = neighbors;
        }
      } else {
        for (i = 0; i < n; i++) {
          neighbors = [];
          if (i !== 0) {
            neighbors.push(i - 1);//the left neighbor
          }
          if (i !== n - 1) {
            neighbors.push(i + 1);//the right neighbor
          }

          adjacencyLists[i] = neighbors;
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return settings.network.n;
    }
  });
}());
