'use strict';

(function () {
  function DiffIntDataAggregator(plotter, settings) {
    spimosimCore.TimeDataAggregator.call(this, plotter, settings);
  };
  DiffIntDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

  DiffIntDataAggregator.prototype.getConsts = function () {
    return {
      repeat: this.settings.repeat,
      timeStep: this.settings.timeStep,
      operation: this.settings.operation
    };
  };

  DiffIntDataAggregator.prototype.getVars = function (from, to) {
    return {
      dataY: this.plotter.dataSource.getDataY(from, to),
      offset: from
    };
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'diff-int',
    files: [ 'lib/modules/DataAggregator/diff-int.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, DiffIntDataAggregator);
})();
