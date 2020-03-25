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
        enables: [ 'intervalLength' ]
      },
      intervalLength: {
        min: 0,
        max: 1000,
        value: 50,
        step: 1,
        disabled: true,
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
      errorBars: true
    };
  };
  
  spimosimCore.modules.add('PlotDisplay', 'mean value', MeanValuePlotDisplay);
})();
