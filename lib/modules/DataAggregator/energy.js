'use strict';

//This creates a new constructor of an plot of the energy of the model and
//registers it directly.
spimosimCore.modules.add('DataAggregator',
  {
    name: 'energy',//id in the register
    files: [ 'lib/modules/DataAggregator/energy.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  },
  spimosimCore.TimeDataAggregator,//Inherit from TimeDataAggregator
  {
    getConsts: function () {
      return {};
    },

    getVars: function (from, to) {
      return {
        energy: this.plotter.dataSource.protocol.getAllTransferable('energy', from, to),//to use this plot your simulation must save an variable called energy
        offset: from//offset of the array called 'energy'
      };
    }
  }
);
