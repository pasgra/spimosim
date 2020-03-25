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

  spimosimCore.modules.add('PlotDisplay', 'distribution', DistributionPlotDisplay);
})();
