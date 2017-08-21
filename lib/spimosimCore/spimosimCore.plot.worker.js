/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

importScripts('tools.js', 'spimosimCore.js', '../../ext_lib/lib/numeric/numeric-1.2.8-2.min.js');

spimosimCore.modules.newRegister('PlotComputer');

spimosimCore.PlotComputer = (function () {
  function PlotComputer(consts) {
    this.consts = consts;

    this.meta = {};
  }

  PlotComputer.prototype.getTransfers = function () {
    return [];
  };

  PlotComputer.prototype.concatData = false;

  return PlotComputer;
}());


spimosimCore.TimePlotComputer = (function () {
  function TimePlotComputer(consts) {
    spimosimCore.PlotComputer.call(this, consts);
  }

  TimePlotComputer.prototype.getTransfers = function () {
    var transferList = [
      this.dataY.buffer
    ];

    this.dataY = undefined;

    return transferList;
  };

  TimePlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd) {
    this.dataY = new Float64Array(tEnd - tStart);
    var i = 0;

    for (var t = tStart; t < tEnd; t++) {
      this.dataY[i++] = this.getYValue(t, vars);
    }

    this.meta.tStart = tStart;
    this.meta.tEnd = tEnd;
  };

  return TimePlotComputer;
}());

spimosimCore.MultiSeriesTimePlotComputer = (function () {
  function MultiSeriesTimePlotComputer(consts, n) {
    spimosimCore.PlotComputer.call(this, consts);
    this.n = n;
  }

  MultiSeriesTimePlotComputer.prototype.getTransfers = function () {
    var transferList = [];

    for (var i = 0; i < this.n; i++) {
      transferList.push(this.dataY[i].buffer);
    };

    this.dataY = undefined;

    return transferList;
  };

  MultiSeriesTimePlotComputer.prototype.calcDataInterval =
      function (vars, tStart, tEnd) {
    this.dataY = [];
    for (var i = 0; i < this.n; i++) {
      this.dataY[i] = new Float64Array(tEnd - tStart);
    }

    this.meta.tStart = tStart;
    this.meta.tEnd = tEnd;

    for (var t = tStart; t < tEnd; t++) {
      var yValues = this.getYValues(t, vars);
      for (var i = 0; i < this.n; i++) {
        this.dataY[i][t - tStart] = yValues[i];
      }
    }
  };

  return MultiSeriesTimePlotComputer;
}());


spimosimCore.MeanValuePlotComputer = (function () {
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

  return MeanValuePlotComputer;
}());

spimosimCore.DistributionPlotComputer = (function () {
  function DistributionPlotComputer(consts) {
    spimosimCore.PlotComputer.call(this, consts);

    this.dataX = new Float64Array(0);
    this.dataY = new Float64Array(0);

    this.data = {};
  }

  DistributionPlotComputer.prototype =
    Object.create(spimosimCore.PlotComputer.prototype);

  DistributionPlotComputer.prototype.calcDataInterval = function (vars, tStart,
      tEnd) {
    var absValues = this.consts.absValues,
      newData = vars.dataY,
      data = this.data,
      value;

    if (absValues) {
      for (var i = 0, len = newData.length; i < len; i++) {
        value = newData[i];
        if (isFinite(value)) {
          value = Math.abs(value);
          data[value] = (data[value] || 0) + 1;
        }
      }
    } else {
      for (var i = 0, len = newData.length; i < len; i++) {
        value = newData[i];
        if (isFinite(value)) {
          data[value] = (data[value] || 0) + 1;
        }
      }
    }

    var keys = Object.keys(data),
      len = keys.length,
      dataX = new Float64Array(len),
      dataY = new Float64Array(len);

    dataX.set(keys);
    dataX.sort();

    for (var i = 0; i < len; i++) {
      dataY[i] = data[dataX[i]];
    }

    this.dataX = dataX;
    this.dataY = dataY;
  };

  return DistributionPlotComputer;
}());

spimosimCore.CumulatedPlotComputer = (function () {
  function CumulatedPlotComputer(consts) {
    spimosimCore.PlotComputer.call(this, consts);

    this.dataX = new Float64Array(0);
    this.dataY = new Float64Array(0);

    this.data = {};
  }

  CumulatedPlotComputer.prototype =
    Object.create(spimosimCore.PlotComputer.prototype);

  CumulatedPlotComputer.prototype.calcDataInterval = function (vars, tStart,
      tEnd) {
    var absValues = this.consts.absValues,
      newData = vars.dataY,
      data = this.data,
      value;

    if (absValues) {
      for (var i = 0, len = newData.length; i < len; i++) {
        value = newData[i];
        if (isFinite(value)) {
          value = Math.abs(value);
          data[value] = (data[value] || 0) + 1;
        }
      }
    } else {
      for (var i = 0, len = newData.length; i < len; i++) {
        value = newData[i];
        if (isFinite(value)) {
          data[value] = (data[value] || 0) + 1;
        }
      }
    }

    var keys = Object.keys(data),
      len = keys.length,
      dataX = new Float64Array(len),
      dataY = new Float64Array(len);

    dataX.set(keys);
    dataX.sort();

    var sum = 0;
    for (var i = len - 1; i >= 0; i--) {
      sum += data[dataX[i]];
      dataY[i] = sum;
    }

    this.dataX = dataX;
    this.dataY = dataY;
  };

  return CumulatedPlotComputer;
}());

spimosimCore.AutoCorrelationPlotComputer = (function () {
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
  return AutoCorrelationPlotComputer;
}());

spimosimCore.modules.add('PlotComputer', 
  'energy',
  spimosimCore.TimePlotComputer,
  {
    constructor: function (consts) {
      spimosimCore.TimePlotComputer.call(this, consts);
    },

    getYValue: function (t, vars) {
      return vars.energy[t - vars.offset] / this.consts.n;
    }
  }
);

spimosimCore.modules.add('PlotComputer', 'mean value', spimosimCore.MeanValuePlotComputer);
spimosimCore.modules.add('PlotComputer', 'multi series mean value', spimosimCore.MeanValuePlotComputer);
spimosimCore.modules.add('PlotComputer', 'distribution', spimosimCore.DistributionPlotComputer);
spimosimCore.modules.add('PlotComputer', 'multi series distribution', spimosimCore.DistributionPlotComputer);
spimosimCore.modules.add('PlotComputer', 'cumulated', spimosimCore.CumulatedPlotComputer);
spimosimCore.modules.add('PlotComputer', 'multi series cumulated', spimosimCore.CumulatedPlotComputer);
spimosimCore.modules.add('PlotComputer', 'auto correlation',
  spimosimCore.AutoCorrelationPlotComputer);
spimosimCore.modules.add('PlotComputer', 'multi series auto correlation',
  spimosimCore.AutoCorrelationPlotComputer);

spimosimCore.PlotWorker = (function () {
  function PlotWorker() {
    this.totalTime = .1;
    this.totalSteps = 0;

    var worker = this;

    self.addEventListener('message', function (msg) {
      switch (msg.data.command) {
        case 'init':
          worker.init(msg.data.plotType, msg.data.consts, msg.data.plotUrls);
          break;
        case 'calc steps':
          worker.calcSteps(msg.data.vars, msg.data.tStart, msg.data.tEnd);
          break;
        default:
          throw 'Unknown command: ' + msg.data.command;
      }
    });
  }

  PlotWorker.prototype.concatData = false;

  PlotWorker.prototype.calcSteps = function (vars, tStart, tEnd) {
    var startTime = Date.now();

    this.plotComputer.calcDataInterval(vars, tStart, tEnd);

    this.totalTime += Date.now() - startTime;
    this.totalSteps += tEnd - tStart;

    this.sendData(tStart, tEnd);
  };

  PlotWorker.prototype.init = function (plotType, consts, plotUrls) {
    for (var i = 0, len = plotUrls.length; i < len; i++) {
      importScripts(plotUrls[i]);
    }

    this.plotComputer = new (spimosimCore.modules.get('PlotComputer', plotType))(consts);

    self.postMessage({
      type: 'initialized'
    });
  };

  PlotWorker.prototype.sendData = function (tStart, tEnd) {
    var plotComputer = this.plotComputer,
      msg = {
        type: 'new data',
        dataX: plotComputer.dataX,
        dataY: plotComputer.dataY,
        meta: plotComputer.meta,
        t: tEnd - 1,
        msPerStep: this.totalTime / this.totalSteps
      },
      transferList = plotComputer.getTransfers();

    self.postMessage(msg, transferList);
  };

  return PlotWorker;
})();

new spimosimCore.PlotWorker();
