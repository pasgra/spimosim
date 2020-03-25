'use strict';

(function () {
  var CumulatedPlotDisplay = spimosimCore.modules.get('PlotDisplay', 'cumulated');
   
  function MultiSeriesCumulatedPlotDisplay(plotter, settings) {
    spimosimUi.PlotDisplay.call(this, plotter, settings);
  }
  MultiSeriesCumulatedPlotDisplay.prototype = Object.create(CumulatedPlotDisplay.prototype);

  MultiSeriesCumulatedPlotDisplay.optionText = CumulatedPlotDisplay.optionText;
  MultiSeriesCumulatedPlotDisplay.prototype.description = CumulatedPlotDisplay.description;

  MultiSeriesCumulatedPlotDisplay.getSettingsConfig = function (plotter) {
    var config = CumulatedPlotDisplay.getSettingsConfig.call(plotter);

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

  spimosimCore.modules.add('PlotDisplay', 'multi series cumulated', MultiSeriesCumulatedPlotDisplay);
})();
