'use strict';

(function () {
  function AutoCorrelationPlotComputer(consts) {
    spimosimCore.MultiSeriesTimePlotComputer.call(this, consts,
      consts.maxTimeStep + 1);

    if (!consts.perStepMode) {
      var maxTimeStep = consts.maxTimeStep;

      this.sums = new Float64Array(maxTimeStep);
      this.sumsThen = new Float64Array(maxTimeStep);
      this.crossSums = new Float64Array(maxTimeStep);
      this.counters = new Int32Array(maxTimeStep);

      for (var i = 0; i < maxTimeStep; i++) {
        this.sums[i] = 0;
        this.sumsThen[i] = 0;
        this.crossSums[i] = 0;
        this.counters[i] = 0;
      }
    }
  }
  AutoCorrelationPlotComputer.prototype =
    Object.create(spimosimCore.MultiSeriesTimePlotComputer.prototype);

  AutoCorrelationPlotComputer.prototype.getYValues = function (t, vars) {
    var correlations = this.getCorrelations(t, vars);
    var fit = this.fitExp(correlations);

    return [ fit ].concat(correlations);
  };

  AutoCorrelationPlotComputer.prototype.getCorrelations = function (t, vars) {
    var dataY = vars.dataY,
      intervalLength = this.consts.intervalLength,
      offset = vars.offset,
      maxTimeStep = this.consts.maxTimeStep,
      correlation,
      correlations = [];

    if (this.consts.absValues) {
      for (var i = 0, len = dataY.length; i < len; i++) {
        dataY[i] = Math.abs(dataY[i])
      }
    }

    if (this.consts.perStepMode) {
      for (var i = 0; i < maxTimeStep; i++) {
        correlations[i] = NaN;
      }

      maxTimeStep = Math.max(0, Math.min(maxTimeStep,
        t - offset - intervalLength + 1));

      var sum, sumThen, crossSum;

      sum = 0;
      for (var t2 = t - intervalLength + 1; t2 <= t; t2++) {
        var value = dataY[t2 - offset];

        sum += value;
      }

      if (isFinite(sum)) {
        for (var timeStep = 1; timeStep <= maxTimeStep; timeStep++) {
          sumThen = 0;
          crossSum = 0;

          for (var t2 = t - intervalLength + 1; t2 <= t; t2++) {
            var value = dataY[t2 - offset],
              valueThen = dataY[t2 - offset - timeStep];

            sumThen += valueThen;
            crossSum += value * valueThen;
          }

          correlation = crossSum / intervalLength -
            sum * sumThen / intervalLength / intervalLength;

          correlations[timeStep - 1] = correlation;
        }
      }
    } else {
      var value = dataY[t - offset];

      if (isFinite(value)) {
        for (var i = 0; i < maxTimeStep; i++) {
          var timeStep = i + 1;
          var valueThen = dataY[t - offset - timeStep];

          if (isFinite(valueThen)) {
            this.sums[i] += value;
            this.sumsThen[i] += valueThen;
            this.crossSums[i] += value * valueThen;
            this.counters[i]++;
          }
        }
      }

      for (var i = 0; i < maxTimeStep; i++) {
        var counter = this.counters[i]
        correlations[i] = this.crossSums[i] / counter -
          this.sums[i] * this.sumsThen[i] / counter / counter;
      }
    }

    return correlations;
  }

  function expFunction(time, c, correlationTime) {
    return c * Math.exp(-time / correlationTime);
  }

  AutoCorrelationPlotComputer.prototype.fitExp =
      function (correlations) {
    var len = correlations.length,
      dataX = new Float64Array(len);

    for (var i = 0; i < len; i++) {
      dataX[i] = i + 1;
    }

    if (len >= 3) {
      var positiveLength = 0;

      while (correlations[positiveLength] > 0) {
        positiveLength++;
      }

      var halfIndex = positiveLength >> 1,
        earlierHalfProduct = 1,
        laterHalfProduct = 1;

      for (var i = 0; i < halfIndex; i++) {
        earlierHalfProduct *= correlations[i];
      }

      for (var i = halfIndex; i < positiveLength; i++) {
        laterHalfProduct *= correlations[i];
      }

      var guess = [
          correlations[0],
          (Math.log(laterHalfProduct) / halfIndex -
            Math.log(earlierHalfProduct) / (positiveLength - halfIndex)) /
            (positiveLength / 2)
        ],
        fit = tools.fitLeastSquares.exponential(dataX, correlations, guess);

      var alpha = -1 / fit.solution[1];
      if (alpha > 0) {
        return alpha;
      } else {
        return NaN;
      }
    } else {
      return NaN;
    }
  }
  
  spimosimCore.modules.add('PlotComputer', {
    name: 'auto correlation',
    files: [ 'lib/modules/PlotComputer/auto-correlation.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for auto correlation.',
    date: '2020-03-26'
  }, AutoCorrelationPlotComputer);
  spimosimCore.modules.add('PlotComputer', {
    name: 'multi series auto correlation',
    files: [ 'lib/modules/PlotComputer/auto-correlation.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for auto correlation for multi series at once.',
    date: '2020-03-26'
  }, AutoCorrelationPlotComputer);
}());
