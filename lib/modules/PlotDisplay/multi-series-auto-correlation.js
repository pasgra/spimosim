'use strict';

(function () {
  var AutoCorrelationPlotDisplay = spimosimCore.modules.get('PlotDisplay', 'auto correlation');
   
  function MultiSeriesAutoCorrelationPlotDisplay(plotter, settings) {
    spimosimUi.MultiSeriesTimePlotDisplay.call(this, plotter, settings, settings.maxTimeStep + 1);
  }
  MultiSeriesAutoCorrelationPlotDisplay.prototype = Object.create(AutoCorrelationPlotDisplay.prototype);

  MultiSeriesAutoCorrelationPlotDisplay.optionText = AutoCorrelationPlotDisplay.optionText;
  MultiSeriesAutoCorrelationPlotDisplay.prototype.description = AutoCorrelationPlotDisplay.prototype.description;

  MultiSeriesAutoCorrelationPlotDisplay.getSettingsConfig = function (plotter) {
    var config = AutoCorrelationPlotDisplay.getSettingsConfig(plotter);
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
  
  spimosimUi.MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.add("multi series auto correlation", MultiSeriesAutoCorrelationPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'multi series auto correlation',
    files: [ 'lib/modules/PlotDisplay/multi-series-auto-correlation.js' ],
    depends: [ 'module:DataAggregator/multi series auto correlation' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, MultiSeriesAutoCorrelationPlotDisplay);
})();
