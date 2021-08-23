
'use strict';
(function () {
function toFunction(fnString, vars) {
  var args = [ null, "t" ].concat(vars);

  args.push('"use strict";' + tools.LOAD_MATH_IN_SCOPE +
            'return ' + fnString + ';');

  return new (Function.prototype.bind.apply(Function, args));
};


function ProtocolFunctionPlotComputer(consts) {
  spimosimCore.TimePlotComputer.call(this, consts);
  this.func = toFunction(consts.fnString, consts.varNames);
  this.varNames = consts.varNames;
}
ProtocolFunctionPlotComputer.prototype = Object.create(spimosimCore.TimePlotComputer.prototype);

ProtocolFunctionPlotComputer.prototype.getYValue = function (t, vars) {
  var argList = [t];
  for (var i = 0; i < this.varNames.length; i++) {
    argList.push(vars[this.varNames[i]]);
  }
  return this.func.apply(null, argList);
}
spimosimCore.modules.add('PlotComputer',{
  "name": "protocol function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "Protocol function",
  "date": "2021-08-23",
  "depends": [],
  "files": [
    "lib/modules/PlotComputer/protocol-function.js"
  ]
}, ProtocolFunctionPlotComputer);
}());
