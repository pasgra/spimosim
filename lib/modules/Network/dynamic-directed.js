/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', 'dynamic-directed', {
    parameters: [ 'n' ],
    calculateNetworkSize: function (settings) {
      return settings.network.n;
    },
    generateAdjacencyLists: function (settings) {
      var n = settings.n,
        adjacencyLists = [];

      for (var i = 0; i < n; i++) {
        adjacencyLists.push([]);
      }

      if (settings.connections !== undefined) {
        var c = settings.connections;
        for (var i = 0; i < n; i++) {
          var neighbors = adjacencyLists[i];
          for (var j = 0; j < n; j++) {
            if (c[j * n + i] !== 0) {
              neighbors.push(j);
            }
          }
        }
      }

      return adjacencyLists;
    }
  });
}());
