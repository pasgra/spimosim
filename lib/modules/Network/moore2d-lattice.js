/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'moore-2d-lattice',
    files: [ 'lib/modules/Network/moore2d-lattice.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A two dimensional lattice with moore neighbor hood.',
    date: '2020-03-26'
  }, {
    parameters: [ 'width', 'height' ],
    generateAdjacencyLists: function (settings) {
      var width = settings.width,
        height = settings.height,
        adjacencyLists = [],
        n = width * height,
        x, y, neighbors, i;

      for (i = 0; i < n; i++) {
        //The index i in 1D represents the index (x,y) in 1D
        //i = x + y*width
        x = i % width;
        y = Math.floor(i / width);
        neighbors = [
          (width + x - 1) % width + (height + y - 1) % height * width,//the upper left neighbor
          (width + x - 1) % width + y * width,//the left neighbor
          (width + x - 1) % width + (y + 1) % height * width,//the lower left neighbor
          x + (y + 1) % height * width,//the lower neighbor
          (x + 1) % width + (y + 1) % height * width,//the lower right neighbor
          (x + 1) % width + y * width,//the right neighbor
          (x + 1) % width + (height + y -  1) % height * width,//the upper right neighbor
          x + (height + y - 1) % height * width,//the upper neighbor
        ];

        //The periodic boundary conditions can cause the agent to be its own
        //neighbor and the left and right neighbor or the the lower and upper
        //neighbor to be the same agent
        neighbors = spimosimNetwork.removeWrongNeighbors(i, neighbors);

        adjacencyLists[i] = neighbors;
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return settings.network.width * settings.network.height;
    }
  });
}());
