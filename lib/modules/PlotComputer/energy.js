'use strict';

spimosimCore.modules.add('PlotComputer', 
  'energy',
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
