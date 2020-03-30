'use strict';

(function () {
  var MeanValueDataAggregator = spimosimCore.modules.get('DataAggregator', 'mean value');
  
  function MultiSeriesMeanValueDataAggregator(plotter, settings) {
    MeanValueDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesMeanValueDataAggregator.prototype = Object.create(MeanValueDataAggregator.prototype);

  MultiSeriesMeanValueDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;
    from = Math.max(dataSource.tMin, from);

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
      offset: from
    };
  };


  MultiSeriesMeanValueDataAggregator.prototype.getConsts = function () {
    var consts = MeanValueDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'multi series mean value',
    files: [ 'lib/modules/DataAggregator/multi-series-mean-value.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, MultiSeriesMeanValueDataAggregator);
})();
