'use strict';

(function () {
  function FIRIIRPlotDisplay(plotter, settings) {
    spimosimUi.TimePlotDisplay.call(this, plotter, settings);
  }
  FIRIIRPlotDisplay.prototype = Object.create(spimosimUi.TimePlotDisplay.prototype);

  FIRIIRPlotDisplay.prototype.description = 'FIR or IIR filter';
  FIRIIRPlotDisplay.optionText = 'FIR or IIR filter';

  FIRIIRPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      b: {
        type: "string",
        value: "0.5,0.5",
        labelText: 'numerator coefficients separated by commas'
      },
      a: {
        type: "string",
        value: "1",
        labelText: 'denominator coefficients separated by commas (use 1 for FIR)'
      }
    };
  };

  FIRIIRPlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: "FIR/IRR filter",
      xlabel: 't',
      labels: this.getSeriesLabels(true),
    };
  };

  spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.add("fir-iir", FIRIIRPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'fir-iir',
    files: [ 'lib/modules/PlotDisplay/fir-iir.js' ],
    depends: [ 'module:DataAggregator/fir-iir' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, FIRIIRPlotDisplay);
})();
