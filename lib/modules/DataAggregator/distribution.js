'use strict';

(function () {
  function DistributionDataAggregator(plotter, settings) {
    spimosimCore.DataAggregator.call(this, plotter, settings);
  };
  DistributionDataAggregator.prototype = Object.create(spimosimCore.DataAggregator.prototype);

  DistributionDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues
    };
  };

  DistributionDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;
    return {
      dataY: dataSource.getDataY(from, to)
    };
  };

  DistributionDataAggregator.prototype.isPdf = true;
  
  spimosimCore.modules.add('DataAggregator', 'distribution', DistributionDataAggregator);
})();
