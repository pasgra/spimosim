'use strict';

(function () {
  function DistributionPlotDisplay(plotter, settings) {
    spimosimUi.PlotDisplay.call(this, plotter, settings);
  }
  DistributionPlotDisplay.prototype = Object.create(spimosimUi.PlotDisplay.prototype);

  DistributionPlotDisplay.optionText = 'Distribution';
  DistributionPlotDisplay.prototype.description = 'Distribution of y-values';

  DistributionPlotDisplay.prototype.fittable = true;

  DistributionPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      absValues : {
        labelText: 'Use absolute values',
        value: false,
        type: 'checkbox'
      }
    };
  };

  DistributionPlotDisplay.prototype.seriesLabels = [ 'value', 'count' ];

  DistributionPlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Distribution',
      labels: this.getSeriesLabels(true)
    };
  };
  
  spimosimUi.PlotDisplay.deducedPlotTypeRegister.add("distribution", DistributionPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'distribution',
    files: [ 'lib/modules/PlotDisplay/distribution.js' ],
    depends: [ 'module:DataAggregator/distribution' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, DistributionPlotDisplay);
})();
