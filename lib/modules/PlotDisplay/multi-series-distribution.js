'use strict';

(function () {
  var DistributionPlotDisplay = spimosimCore.modules.get('PlotDisplay', 'distribution');
  
  function MultiSeriesDistributionPlotDisplay(plotter, settings) {
    spimosimUi.PlotDisplay.call(this, plotter, settings);
  }
  MultiSeriesDistributionPlotDisplay.prototype = Object.create(DistributionPlotDisplay.prototype);

  MultiSeriesDistributionPlotDisplay.optionText = DistributionPlotDisplay.optionText;
  MultiSeriesDistributionPlotDisplay.prototype.description = DistributionPlotDisplay.prototype.description;

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
  
  spimosimUi.MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.add("multi series distribution", MultiSeriesDistributionPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'multi series distribution',
    files: [ 'lib/modules/PlotDisplay/multi-series-distribution.js' ],
    depends: [ 'module:DataAggregator/multi series distribution' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, MultiSeriesDistributionPlotDisplay);
})();
