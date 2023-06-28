
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

ProtocolFunctionPlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd, saveSteps) {
  this.dataY = new Float64Array(tEnd - tStart);
  var i = 0;
  let argList;

  for (var t = tStart; t < tEnd; t++) {
    argList = [t];
    for (var j = 0; j < this.varNames.length; j++) {
      argList.push(vars[this.varNames[j]][t - tStart]);
    }
    this.dataY[i++] = this.func.apply(null, argList);
  }

  this.meta.tStart = tStart;
  this.meta.tEnd = tEnd;
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
