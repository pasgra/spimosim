/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
 * This modules computes the change in magnetisation
 */

spimosimCore.modules.add('PlotComputer',
  'ising/magnetisation change',
  spimosimCore.TimePlotComputer,
  {
    getYValue: function (t, vars) { // returns the change in magnetisation at time step t

      // vars if the data returned by dataAggregators.getVars() (see file data-aggregators.js)
      var magnetisation = vars.magnetisation,
        offset = vars.offset;

      return (magnetisation[t - offset] - magnetisation[t - 1 - offset]);
    }
  });
