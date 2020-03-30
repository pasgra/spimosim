'use strict';

(function () {
  var CumulatedDataAggregator = spimosimCore.modules.get('DataAggregator', 'cumulated');
  
  function MultiSeriesCumulatedDataAggregator(plotter, settings) {
    CumulatedDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesCumulatedDataAggregator.prototype = Object.create(CumulatedDataAggregator.prototype);

  MultiSeriesCumulatedDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
    };
  };


  MultiSeriesCumulatedDataAggregator.prototype.getConsts = function () {
    var consts = CumulatedDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'multi series cumulated',
    files: [ 'lib/modules/DataAggregator/multi-series-cumulated.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, MultiSeriesCumulatedDataAggregator);
})();
