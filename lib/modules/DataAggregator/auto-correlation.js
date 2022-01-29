'use strict';

(function () {
  function AutoCorrelationDataAggregator(plotter, settings) {
    spimosimCore.MultiSeriesTimeDataAggregator.call(this, plotter, settings, settings.maxTimeStep + 1);
    this.ofTimeseries = (plotter.dataSource.getDataY != null);
  };
  AutoCorrelationDataAggregator.prototype = Object.create(spimosimCore.MultiSeriesTimeDataAggregator.prototype);

  AutoCorrelationDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues,
      maxTimeStep: this.settings.maxTimeStep,
      perStepMode: this.settings.perStepMode,
      intervalLength: this.settings.intervalLength
    };
  };

  AutoCorrelationDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;
    if (this.settings.perStepMode) {
      from = Math.max(dataSource.tMin,
        from - this.settings.maxTimeStep - this.settings.intervalLength + 1);
    } else {
      from = Math.max(dataSource.tMin, from - this.settings.maxTimeStep);
    }
    
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

  AutoCorrelationDataAggregator.prototype.getData = function (tStart, tEnd) {
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
      for (var t = tStart; t < tEnd; t++) {
        var point = [ t ];
        for (var i = 1; i < this.n; i++) {
          point.push(dataY[i][t - this.tMin]);
        }
        data.push(point);
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  AutoCorrelationDataAggregator.prototype.getDataFit = function (tStart, tEnd) {
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
      for (var t = tStart; t < tEnd; t++) {
        data.push([ t, dataY[0][t - this.tMin] ]);
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  AutoCorrelationDataAggregator.prototype.getSingleStepData = function (t) {
    var dataY = this.dataY,
      n = this.n,
      data = [];

    if (dataY[0][t - this.tMin] === undefined) {
      throw 'Unknown frame';
    }

    for (var i = 1; i < n; i++) {
      data.push([
        i,
        dataY[i][t - this.tMin]
      ]);
    }

    return data;
  };

  AutoCorrelationDataAggregator.prototype.getStepCsv = function (t) {
    var dataY = this.dataY,
      str = '';

    for (var i = 1; i < this.n; i++) {
      str += i + ' ' + dataY[i][t - this.tMin] + '\n';
    }

    return str;
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'auto correlation',
    files: [ 'lib/modules/DataAggregator/auto-correlation.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator for auto correlation.',
    date: '2020-03-26'
  }, AutoCorrelationDataAggregator);
})();
