'use strict';

(function () {
  spimosimCore.modules.add('PlotDisplay', 
    'energy',
    spimosimUi.TimePlotDisplay,
    {
      description: 'Total energy',
      customConstructor: function (plotter, settings) {
        TimePlotDisplay.call(this, plotter, settings);
      },

      getPlotOptions: function () {
        return {
          title: 'Total energy',
          xlabel: 't',
          labels: this.getSeriesLabels(true)
        };
      },
    },
    {
      optionText: 'Total energy',
    }
  );

})();
