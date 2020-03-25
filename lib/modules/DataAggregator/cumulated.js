'use strict';

(function () {
  function CumulatedDataAggregator(plotter, settings) {
    spimosimCore.DataAggregator.call(this, plotter, settings);
  };
  CumulatedDataAggregator.prototype = Object.create(spimosimCore.DataAggregator.prototype);

  CumulatedDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues
    };
  };

  CumulatedDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.getDataY(from, to)
    };
  };

  CumulatedDataAggregator.prototype.isCdf = true;
  
  spimosimCore.modules.add('DataAggregator', 'cumulated', CumulatedDataAggregator);
})();
