/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: '2d-lattice',
    files: [ 'lib/modules/Network/2d-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A two dimensional lattice with von Neumann neighbor hood.',
    date: '2020-03-26'
  }, {//2d lattice with von Neumann neighbor hood
    parameters: [ 'width', 'height', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var width = settings.width,
        height = settings.height,
        periodic = settings.periodic,
        adjacencyLists = [],
        n = width * height,
        x, y, neighbors, i;

      if (periodic) {
        //periodic boundary conditions
        for (i = 0; i < n; i++) {
          //The index i in 1D represents the index (x,y) in 1D
          //i = x + y*width
          x = i % width;
          y = Math.floor(i / width);
          neighbors = [
            (width + x - 1) % width + y * width,//the left neighbor
            (x + 1) % width + y * width,//the right neighbor
            x + (height + y - 1) % height * width,//the upper neighbor
            x + (y + 1) % height * width,//the lower neighbor
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
          if (i % width !== 0) {
            neighbors.push(i - 1);//the left neighbor
          }
          if ((i + 1) % width !== 0) {
            neighbors.push(i + 1);//the right neighbor
          }
          if (i - width >= 0) {
            neighbors.push(i - width);//the upper neighbor
          }
          if (i + width < n) {
            neighbors.push(i + width);//the upper neighbor
          }

          adjacencyLists[i] = neighbors;
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return settings.network.width * settings.network.height;
    }
  });
}());
