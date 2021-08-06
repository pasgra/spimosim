'use strict';

(function () {
  function MeanValuePlotDisplay(plotter, settings) {
    spimosimUi.MultiSeriesTimePlotDisplay.call(this, plotter, settings, 2);
  }
  MeanValuePlotDisplay.prototype = Object.create(spimosimUi.MultiSeriesTimePlotDisplay.prototype);

  MeanValuePlotDisplay.prototype.description = 'The mean value over all or n previous values and the their standard deviation';
  MeanValuePlotDisplay.optionText = 'Mean value';

  MeanValuePlotDisplay.prototype.seriesLabels = [ 'Mean value', 'Standard deviation' ];

  MeanValuePlotDisplay.getSettingsConfig = function (plotter) {
    return {
      perStepMode : {
        labelText: 'Use only recent data for every step.',
        value: false,
        type: 'checkbox',
        name: 'perStepName',
      },
      intervalLength: {
        min: 0,
        max: 1000,
        value: 50,
        step: 1,
        parent: 'perStepMode',
        parentValue: true,
        name: 'intervalLength',
        labelText: 'Interval length'
      }
    };
  };

  MeanValuePlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Mean value',
      xlabel: 't',
      labels: this.getSeriesLabels(true),
      errorBars: true,
      sigma: 1
    };
  };
  
  spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.add("mean value", MeanValuePlotDisplay);
  
  spimosimCore.modules.add('PlotDisplay', {
    name: 'mean value',
    files: [ 'lib/modules/PlotDisplay/mean-value.js' ],
    depends: [ 'module:DataAggregator/mean value' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, MeanValuePlotDisplay);
})();
