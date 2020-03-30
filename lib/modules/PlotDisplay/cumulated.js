'use strict';

(function () {
  function CumulatedPlotDisplay(plotter, settings) {
    spimosimUi.PlotDisplay.call(this, plotter, settings);
  }
  CumulatedPlotDisplay.prototype = Object.create(spimosimUi.PlotDisplay.prototype);

  CumulatedPlotDisplay.optionText = 'Cumulated distribution';
  CumulatedPlotDisplay.prototype.description = 'Cumulated distribution of y values';

  CumulatedPlotDisplay.prototype.fittable = true;

  CumulatedPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      absValues : {
        labelText: 'Use absolute values',
        value: false,
        type: 'checkbox'
      }
    };
  };

  CumulatedPlotDisplay.prototype.seriesLabels = [ 'value', 'cumulated value' ];

  CumulatedPlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Cumulated Distribution',
      labels: this.getSeriesLabels(true)
    };
  };
  
  spimosimUi.PlotDisplay.deducedPlotTypeRegister.add("cumulated", CumulatedPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'cumulated',
    files: [ 'lib/modules/PlotDisplay/cumulated.js' ],
    depends: [ 'module:DataAggregator/cumulated' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, CumulatedPlotDisplay);
})();
