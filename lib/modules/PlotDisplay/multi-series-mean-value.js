'use strict';

(function () {
  var MeanValuePlotDisplay = spimosimCore.modules.get('PlotDisplay', 'mean value');
   
  function MultiSeriesMeanValuePlotDisplay(plotter, settings) {
    spimosimUi.MultiSeriesTimePlotDisplay.call(this, plotter, settings, 2);
  }
  MultiSeriesMeanValuePlotDisplay.prototype = Object.create(MeanValuePlotDisplay.prototype);

  MultiSeriesMeanValuePlotDisplay.optionText = MeanValuePlotDisplay.optionText;
  MultiSeriesMeanValuePlotDisplay.prototype.description = MeanValuePlotDisplay.prototype.description;

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
  
  spimosimUi.MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.add("multi series mean value", MultiSeriesMeanValuePlotDisplay);
  
  spimosimCore.modules.add('PlotDisplay', {
    name: 'multi series mean value',
    files: [ 'lib/modules/PlotDisplay/multi-series-mean-value.js' ],
    depends: [ 'module:DataAggregator/multi series mean value' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, MultiSeriesMeanValuePlotDisplay);
})();
