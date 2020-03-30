'use strict';

(function () {
  spimosimCore.modules.add('PlotDisplay', 
    {
      name: 'energy',
      files: [ 'lib/modules/PlotDisplay/energy.js' ],
      depends: [ 'module:DataAggregator/energy' ],
      version: '1.0',
      author: 'Pascal Grafe',
      description: 'A plot display.',
      date: '2020-03-26'
    },
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
