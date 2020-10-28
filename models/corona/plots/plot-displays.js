/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
 * This modules shows the plot
 */

spimosimCore.modules.add('PlotDisplay',
  'ising/magnetisation change',
  spimosimUi.TimePlotDisplay,
  {
    description: 'The change in magnetisation.', // Describe what is shown

    getPlotOptions: function () { // The returns options that are passed to the Dygraphs library. See http://dygraphs.com/options.html
      return {
        title: 'Magnetisation change',
        xlabel: 't',
        labels: [
          't',
          'magnetisation change'
        ]
      };
    }
  },
  /* The previous functions are added to the prototype of spimosimUi.TimePlotDisplay. The following parameters are assigned to the Object itself*/
  {
    optionText: 'Magnetisation change', // This text is shown as the option text in the select in the create plot menu
  }
);
