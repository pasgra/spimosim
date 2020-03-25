'use strict';

(function () {
  var DistributionPlotDisplay = spimosimCore.modules.get('PlotDisplay', 'distribution');
  
  function MultiSeriesDistributionPlotDisplay(plotter, settings) {
    spimosimUi.PlotDisplay.call(this, plotter, settings);
  }
  MultiSeriesDistributionPlotDisplay.prototype = Object.create(DistributionPlotDisplay.prototype);

  MultiSeriesDistributionPlotDisplay.optionText = DistributionPlotDisplay.optionText;
  MultiSeriesDistributionPlotDisplay.prototype.description = DistributionPlotDisplay.description;

  MultiSeriesDistributionPlotDisplay.getSettingsConfig = function (plotter) {
    var config = DistributionPlotDisplay.getSettingsConfig.call(plotter);

    var plot = plotter.dataSource.owner;

    var values = [];
    for (var i = 0, len = plot.n; i < len; i++) {
      values.push(i);
    }

    config.seriesNo = {
      name: 'seriesNo',
      labelText: 'Time series',
      values: values,
      texts: plot.getSeriesLabels(),
      type: 'select'
    };

    return config;
  };

  spimosimCore.modules.add('PlotDisplay', 'multi series distribution', MultiSeriesDistributionPlotDisplay);
})();
