/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'random undirected',
    files: [ 'lib/modules/Network/random-undirected.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A random undirected network.',
    date: '2020-03-26'
  }, {
    parameters: [ 'n', 'p' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = [],
        n = settings.n,
        p = settings.p,
        edgesAvailable = n * (n - 1) / 2,
        edgesToAdd = Math.floor(p * edgesAvailable),
        currentP = edgesToAdd / edgesAvailable;

      for (var i = 0; i < n; i++) {
        adjacencyLists[i] = [];
      }
      
      for (var i = 0; i < n; i++) {
        for (var j = i; j < n; j++) {
          --edgesAvailable;
          if (Math.random() < currentP) {
            adjacencyLists[i].push(j);
            adjacencyLists[j].push(i);
            --edgesToAdd;
            currentP = edgesToAdd / edgesAvailable;
          }
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return settings.network.n;
    }
  });
}());
