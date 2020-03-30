'use strict';

(function () {
  var AutoCorrelationDataAggregator = spimosimCore.modules.get('DataAggregator', 'auto correlation');

  function MultiSeriesAutoCorrelationDataAggregator(plotter, settings) {
    AutoCorrelationDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesAutoCorrelationDataAggregator.prototype = Object.create(AutoCorrelationDataAggregator.prototype);

  MultiSeriesAutoCorrelationDataAggregator.prototype.getVars = function (from,
      to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;
    if (this.settings.perStepMode) {
      from = Math.max(this.tMin,
        from - this.settings.maxTimeStep - this.settings.intervalLength + 1);
    } else {
      from = Math.max(dataSource.tMin, from - this.settings.maxTimeStep);
    }

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
      offset: from
    };
  };


  MultiSeriesAutoCorrelationDataAggregator.prototype.getConsts = function () {
    var consts = AutoCorrelationDataAggregator.prototype.getConsts.call(this);

    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };
  
  spimosimCore.modules.add('DataAggregator', {
    name: 'multi series auto correlation',
    files: [ 'lib/modules/DataAggregator/multi-series-auto-correlation.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, MultiSeriesAutoCorrelationDataAggregator);
})();
