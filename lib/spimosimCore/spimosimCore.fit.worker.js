/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

importScripts('tools.js', '../../ext_lib/lib/numeric/numeric-1.2.8-2.min.js');

function fit(data) {
  var cdf,
    fn = toFunction(data.fnString, data.vars),
    result = tools.fitLeastSquares(fn, data.dataX, data.dataY,
      data.guess, data.xMin, data.xMax);

  if (data.isDiscrete || data.cdfString) {
    if (!data.isDiscrete && data.cdfString && !data.isCdf) {
      console.log('loaded cdf');
      fn = toFunction(data.cdfString, data.vars);
    }

    result.distance = tools.getDistance(fn, result.solution, data.isDiscrete, data.xMin,
      data.xMax, data.dataX, data.dataY);
  }

  self.postMessage({
    result: result
  });
}

function toFunction(fnString, vars) {
  var args = [ null, 'x' ].concat(vars);

  args.push('"use strict";' + tools.LOAD_MATH_IN_SCOPE +
    'return ' + fnString + ';');

  return new (Function.prototype.bind.apply(Function, args));
};

self.timeoutId = 0;

self.addEventListener('message', function (msg) {
  var data = msg.data;

  clearTimeout(self.timeoutId);
  self.timeoutId = setTimeout(function () {
    fit(data);
  }, 1);
});
