'use strict';
(function () {
function toFunction(fnString, varCount) {
  var args = [ null, "t" ];
  if (varCount > 1) {
    for (var i = 0; i < varCount; i++) {
      args.push("x" + i);
    }
  } else {
    args.push("x");
  }

  args.push('"use strict";' + tools.LOAD_MATH_IN_SCOPE +
            'return ' + fnString + ';');

  return new (Function.prototype.bind.apply(Function, args));
};


function DeducedFunctionPlotComputer(consts) {
  spimosimCore.TimePlotComputer.call(this, consts);
  this.varCount = consts.varCount;
  this.func = toFunction(consts.fnString, this.varCount);
}
DeducedFunctionPlotComputer.prototype = Object.create(spimosimCore.TimePlotComputer.prototype);

DeducedFunctionPlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd, saveSteps) {
  this.dataY = new Float64Array(tEnd - tStart);
  var i = 0;

  if (this.varCount > 1) {
    for (var t = tStart; t < tEnd; t++) {
      this.dataY[i++] = this.func.apply(null, vars.x[t - tStart]);
    }
  } else {
    for (var t = tStart; t < tEnd; t++) {
      this.dataY[i++] = this.func.apply(null, [t, vars.x[t - tStart]]);
    }
  }

  this.meta.tStart = tStart;
  this.meta.tEnd = tEnd;
}
spimosimCore.modules.add('PlotComputer',{
  "name": "deduced function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "deduced function",
  "date": "2021-08-23",
  "depends": [],
  "files": [
    "lib/modules/PlotComputer/deduced-function.js"
  ]
}, DeducedFunctionPlotComputer);
}());
