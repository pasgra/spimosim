'use strict';

spimosimCore.modules.add('PlotComputer', 
  'energy'{
    name: 'energy',
    files: [ 'lib/modules/PlotComputer/energy.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A example plot computer for energy.',
    date: '2020-03-26'
  },
  spimosimCore.TimePlotComputer,
  {
    constructor: function (consts) {
      spimosimCore.TimePlotComputer.call(this, consts);
    },

    getYValue: function (t, vars) {
      return vars.energy[t - vars.offset];
    }
  }
);
