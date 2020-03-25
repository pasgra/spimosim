/* Copyright 2020 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('Network', 'barabasi-albert-lattice-vis', {
    parameters: [ 'sqrtn', 'm' ],
    calculateNetworkSize: function (settings) {
      return settings.network.sqrtn * settings.network.sqrtn;
    },
    generateAdjacencyLists: function (settings) {
      settings.n = settings.sqrtn * settings.sqrtn;
      return spimosimCore.modules.get('Network', 'barabasi-albert').generateAdjacencyLists(settings);
    }
});
