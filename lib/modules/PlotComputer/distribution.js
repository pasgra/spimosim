'use strict';

(function () {
  function DistributionPlotComputer(consts) {
    spimosimCore.PlotComputer.call(this, consts);

    this.dataX = new Float64Array(0);
    this.dataY = new Float64Array(0);

    this.data = {};
  }

  DistributionPlotComputer.prototype =
    Object.create(spimosimCore.PlotComputer.prototype);

  DistributionPlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd) {
    var absValues = this.consts.absValues,
      newData = vars.dataY,
      data = this.data,
      value;
    
    if (!this.consts.ofTimeseries) {
      // Received full data. Overwrite instead of update
      this.dataX = new Float64Array(0);
      this.dataY = new Float64Array(0);
    }

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

  spimosimCore.modules.add('PlotComputer', {
    name: 'distribution',
    files: [ 'lib/modules/PlotComputer/distribution.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for .',
    date: '2020-03-26'
  }, DistributionPlotComputer);
  spimosimCore.modules.add('PlotComputer', {
    name: 'multi series distribution',
    files: [ 'lib/modules/PlotComputer/distribution.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for .',
    date: '2020-03-26'
  }, DistributionPlotComputer);
}());
