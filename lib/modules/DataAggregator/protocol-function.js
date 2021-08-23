'use strict';
(function () {
function ProtocolFunctionDataAggregator(plotter, settings) {
  spimosimCore.TimeDataAggregator.call(this, plotter, settings);
  this.varNames = [];
  for (var i = 0; ; i++) {
    if (settings.hasOwnProperty("varName_" + i) && settings["varName_" + i] !== "-") {
      this.varNames.push(settings["varName_" + i]);
    } else {
      break;
    }
  }
  this.fnString = settings.fnString;
};
ProtocolFunctionDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

ProtocolFunctionDataAggregator.prototype.getConsts = function() {
  return {
    varNames: this.varNames,
    fnString: this.fnString
  };
}


ProtocolFunctionDataAggregator.prototype.getVars = function(from, to) {
  var vars = {};
  for (var i = 0; i < this.varNames.length; i++) {
    vars[this.varNames[i]] = this.plotter.dataSource.protocol.getAllTransferable(this.varNames[i], from, to)
  };
  return vars;
}

// These values configure a fitter
ProtocolFunctionDataAggregator.prototype.fittable = true;
ProtocolFunctionDataAggregator.prototype.isPdf = false;
ProtocolFunctionDataAggregator.prototype.isCdf = false;
ProtocolFunctionDataAggregator.prototype.isDiscrete = false;
spimosimCore.modules.add('DataAggregator',{
  "name": "protocol function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "Protocol function",
  "date": "2021-08-23",
  "depends": [],
  "files": [
    "lib/modules/DataAggregator/protocol-function.js"
  ]
}, ProtocolFunctionDataAggregator);
}());
