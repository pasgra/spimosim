'use strict';

(function () {
  function MeanValueDataAggregator(plotter, settings) {
    spimosimCore.MultiSeriesTimeDataAggregator.call(this, plotter, settings, 2);
    this.ofTimeseries = (plotter.dataSource.getDataY != null);
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
    
    if (this.ofTimeseries) {
      return {
        dataY: this.plotter.dataSource.getDataY(from, to), // update with new data
        offset: from
      };
    } else {
      return {
        dataY: this.plotter.dataSource.dataY, // send full data
        offset: 0
      };
    }
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

  spimosimCore.modules.add('DataAggregator', {
    name: 'mean value',
    files: [ 'lib/modules/DataAggregator/mean-value.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, MeanValueDataAggregator);
})();
