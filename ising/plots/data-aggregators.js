/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
 * This modules extracts the needed information for the plot from the protocol
 */
spimosimCore.modules.add('DataAggregator', // Register a DataAggregator
  'ising/magnetisation change', // Call it 'ising/magnetisation change'
  spimosimCore.TimeDataAggregator, // Base it on spimosimCore.TimeDataAggregator
  {
    getConsts: function () { // Return data that does not change over the simulation
      return {
        // This plot has no such data. If it had a custom setting it would be transfered like this:
//        aCustomSetting: this.settings.aCustomSetting,
      };
    },

    getVars: function (from, to) { // The data is processed block wise. This
                                   // function returns all data needed to
                                   // calculate the change in magnetisation from
                                   // 'from' (including 'from') to 'to' (without 'to')

      from = Math.max(0, from - 1); // To calculate the change one more step of history is needed
      
      // A DataAggregator has a Plotter (containing several plots) that has a dataSource
      // (the simulation) that has a protocol. We want that protocol.
      var protocol = this.plotter.dataSource.protocol; 
      
      return {
        magnetisation: protocol.getAllTransferable('magnetisation', from, to), // Get the magentisation as an array that is transferable over a webworker
        offset: from // The array magnetisation starts at offset
      };
    }
  }
);
