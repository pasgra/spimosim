'use strict';

(function () {
  function MeanValueDataAggregator(plotter, settings) {
    spimosimCore.MultiSeriesTimeDataAggregator.call(this, plotter, settings, 2);
  };
  MeanValueDataAggregator.prototype = Object.create(spimosimCore.MultiSeriesTimeDataAggregator.prototype);

  MeanValueDataAggregator.prototype.getConsts = function () {
    return {
      perStepMode: this.settings.perStepMode,
      intervalLength: this.settings.intervalLength
    };
  };

  MeanValueDataAggregator.prototype.getVars = function (from, to) {
    if (this.settings.perStepMode) {
      from = Math.max(0, from - this.settings.intervalLength + 1);
    }
    var dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.getDataY(from, to),
      offset: from
    };
  };

  MeanValueDataAggregator.prototype.getData = function (tStart, tEnd) {
    var dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY[0].length + this.tMin;
    } else {
      tEnd = Math.min(dataY[0].length + this.tMin, tEnd);
    }

    if (tStart < tEnd) {
      if (this.fitter) {
        var fittedDataY = this.fitter.getAllFittedDataY(dataX.slice(tStart - this.tMin, tEnd - this.tMin)),
          len = fittedDataY.length,
          point;

        for (var t = tStart; t < tEnd; t++) {
          point = [ t, [ dataY[0][t - this.tMin], dataY[1][t - this.tMin] ] ];

          for (var i = 0; i < len; i++) {
            point.push(fittedDataY[i][t - tStart]);
          }  
          data.push(point);
        }

      } else {
        for (var t = tStart; t < tEnd; t++) {
          data.push([ t, [ dataY[0][t - this.tMin], dataY[1][t - this.tMin] ] ]);
        }
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };


  spimosimCore.modules.add('DataAggregator', 'mean value', MeanValueDataAggregator);
})();
