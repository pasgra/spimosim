'use strict';

(function () {
  function FIRIIRDataAggregator(plotter, settings) {
    spimosimCore.TimeDataAggregator.call(this, plotter, settings);
  };
  FIRIIRDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

  FIRIIRDataAggregator.prototype.getConsts = function () {
    return {
      a: this.settings.a.split(",").map(parseFloat),
      b: this.settings.b.split(",").map(parseFloat)
    };
  };

  FIRIIRDataAggregator.prototype.getVars = function (from, to) {
    return {
      dataY: this.plotter.dataSource.getDataY(from, to),
      offset: from
    };
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'fir-iir',
    files: [ 'lib/modules/DataAggregator/fir-iir.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator.',
    date: '2020-03-26'
  }, FIRIIRDataAggregator);
})();
