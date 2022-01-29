'use strict';

(function () {
  function CumulatedDataAggregator(plotter, settings) {
    spimosimCore.DataAggregator.call(this, plotter, settings);
    this.ofTimeseries = (plotter.dataSource.getDataY != null);
  };
  CumulatedDataAggregator.prototype = Object.create(spimosimCore.DataAggregator.prototype);

  CumulatedDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues,
      ofTimeseries: this.ofTimeseries
    };
  };

  CumulatedDataAggregator.prototype.getVars = function (from, to) {
    if (this.ofTimeseries) {
      return {
        dataY: this.plotter.dataSource.getDataY(from, to) // update with new data
      };
    } else {
      return {
        dataY: this.plotter.dataSource.dataY // send full data
      };
    }
  };

  CumulatedDataAggregator.prototype.isCdf = true;
  
  spimosimCore.modules.add('DataAggregator', {
    name: 'cumulated',
    files: [ 'lib/modules/DataAggregator/cumulated.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, CumulatedDataAggregator);
})();
