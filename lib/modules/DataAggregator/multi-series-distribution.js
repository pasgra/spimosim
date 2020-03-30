'use strict';

(function () {
  var DistributionDataAggregator = spimosimCore.modules.get('DataAggregator', 'distribution');
  
  function MultiSeriesDistributionDataAggregator(plotter, settings) {
    DistributionDataAggregator.call(this, plotter, settings);
  };

  MultiSeriesDistributionDataAggregator.prototype = Object.create(DistributionDataAggregator.prototype);

  MultiSeriesDistributionDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
    };
  };


  MultiSeriesDistributionDataAggregator.prototype.getConsts = function () {
    var consts = DistributionDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };
  
  spimosimCore.modules.add('DataAggregator', {
    name: 'multi series distribution',
    files: [ 'lib/modules/DataAggregator/multi-series-distribution.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, MultiSeriesDistributionDataAggregator);
})();
