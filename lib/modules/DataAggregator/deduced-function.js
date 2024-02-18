'use strict';
(function () {
function DeducedFunctionDataAggregator(plotter, settings) {
  spimosimCore.TimeDataAggregator.call(this, plotter, settings);
  this.fnString = settings.fnString;
  this.varCount = plotter.dataSource.owner.getSeriesLabels().length - 1;
};
DeducedFunctionDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

DeducedFunctionDataAggregator.prototype.getConsts = function() {
  return {
    fnString: this.fnString,
    varCount: this.varCount
  };
}


DeducedFunctionDataAggregator.prototype.getVars = function(from, to) {
  from = Math.max(this.plotter.dataSource.tMin, from);
  return {
    x: this.plotter.dataSource.getData(from, to), // update with new data
    offset: from
  };
}

// These values configure a fitter
DeducedFunctionDataAggregator.prototype.fittable = true;
DeducedFunctionDataAggregator.prototype.isPdf = false;
DeducedFunctionDataAggregator.prototype.isCdf = false;
DeducedFunctionDataAggregator.prototype.isDiscrete = false;
spimosimCore.modules.add('DataAggregator',{
  "name": "deduced function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "deduced function",
  "date": "2024-02-17",
  "depends": [],
  "files": [
    "lib/modules/DataAggregator/deduced-function.js"
  ]
}, DeducedFunctionDataAggregator);
}());
