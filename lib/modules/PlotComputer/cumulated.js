'use strict';

(function () {
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
    for (var i = 0; i < len; i++) {
      sum += data[dataX[i]];
      dataY[i] = sum;
    }

    this.dataX = dataX;
    this.dataY = dataY;
  };

  spimosimCore.modules.add('PlotComputer', 'cumulated', CumulatedPlotComputer);
  spimosimCore.modules.add('PlotComputer', 'multi series cumulated', CumulatedPlotComputer);
})();
