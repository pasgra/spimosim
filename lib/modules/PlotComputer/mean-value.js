'use strict';

(function () {
  function MeanValuePlotComputer(consts) {
    spimosimCore.MultiSeriesTimePlotComputer.call(this, consts, 2);

    if (!consts.perStepMode) {
      this.sum = 0;
      this.squareSum = 0;
      this.counter = 0;
    }
  }
  MeanValuePlotComputer.prototype =
    Object.create(spimosimCore.MultiSeriesTimePlotComputer.prototype);

  MeanValuePlotComputer.prototype.getYValues = function (t, vars) {
    var dataY = vars.dataY,
      offset = vars.offset,
      value,
      counter, sum, squareSum,
      mean, stdDev;

    if (this.consts.perStepMode) {
      counter = this.consts.intervalLength;
      sum = 0;
      squareSum = 0;

      for (var t2 = t - counter + 1; t2 <= t; t2++) {
        value = dataY[t2 - offset];

        sum += value;
        squareSum += value * value;
      }
    } else {
      value = dataY[t - offset];

      if (isFinite(value)) {
        this.counter++;
        this.sum += value;
        this.squareSum += value * value;
      }

      sum = this.sum;
      squareSum = this.squareSum;
      counter = this.counter;
    }

    mean = sum / counter;
    stdDev = Math.sqrt(squareSum / counter - mean * mean);

    return [ mean, stdDev ];
  };

  spimosimCore.modules.add('PlotComputer', {
    name: 'mean value',
    files: [ 'lib/modules/PlotComputer/mean-value.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for mean value.',
    date: '2020-03-26'
  }, MeanValuePlotComputer);
  spimosimCore.modules.add('PlotComputer', {
    name: 'multi series mean value',
    files: [ 'lib/modules/PlotComputer/mean-value.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for multi series mean value.',
    date: '2020-03-26'
  }, MeanValuePlotComputer);
}());
