'use strict';

(function () {
  function DistributionDataAggregator(plotter, settings) {
    spimosimCore.DataAggregator.call(this, plotter, settings);
    this.ofTimeseries = (plotter.dataSource.getDataY != null);
  };
  DistributionDataAggregator.prototype = Object.create(spimosimCore.DataAggregator.prototype);

  DistributionDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues,
      ofTimeseries: this.ofTimeseries
    };
  };

  DistributionDataAggregator.prototype.getVars = function (from, to) {
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

  DistributionDataAggregator.prototype.isPdf = true;
  
  spimosimCore.modules.add('DataAggregator', {
    name: 'distribution',
    files: [ 'lib/modules/DataAggregator/distribution.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, DistributionDataAggregator);
})();
