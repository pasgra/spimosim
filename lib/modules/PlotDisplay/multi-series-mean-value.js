'use strict';

(function () {
  var MeanValuePlotDisplay = spimosimCore.modules.get('PlotDisplay', 'mean value');
   
  function MultiSeriesMeanValuePlotDisplay(plotter, settings) {
    spimosimUi.MultiSeriesTimePlotDisplay.call(this, plotter, settings, 2);
  }
  MultiSeriesMeanValuePlotDisplay.prototype = Object.create(MeanValuePlotDisplay.prototype);

  MultiSeriesMeanValuePlotDisplay.optionText = MeanValuePlotDisplay.optionText;
  MultiSeriesMeanValuePlotDisplay.prototype.description = MeanValuePlotDisplay.description;

  MultiSeriesMeanValuePlotDisplay.getSettingsConfig = function (plotter) {
    var config = MeanValuePlotDisplay.getSettingsConfig.call(plotter);

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
  
  spimosimCore.modules.add('PlotDisplay', 'multi series mean value', MultiSeriesMeanValuePlotDisplay);
})();
