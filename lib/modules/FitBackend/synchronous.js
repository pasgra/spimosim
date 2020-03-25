'use strict';
if (typeof require !== 'undefined') {
  var tools = require('./tools.js');
  var spimosimCore = require('./spimosimCore.js');
}
;'use strict';

(function () {
  function SynchronousFitBackend(fit) {
    this.frontend = fit;
  }

  SynchronousFitBackend.prototype.fit = function (data) {
    var result,
      fn;
    
    switch (data.type) {
      case 'custom':
        fn = toFunction(data.fnString, data.vars);
        result = tools.fitLeastSquares(fn, data.dataX, data.dataY,
          data.guess, data.xMin, data.xMax);
        break;
      case 'exponential':
        fn = toFunction(data.fnString, data.vars);
        result = tools.fitLeastSquares.exponential(data.dataX, data.dataY,
          data.guess, data.xMin, data.xMax);
        break;
      case 'powerLaw':
        result = tools.fitMle.powerLaw(data.dataX, data.dataY, data.cdfX,
          data.cdfY, data.isCdf, data.isDiscrete, data.xMin);
        break;
    }
    
    this.frontend.setResult(result);
  }

  function toFunction(fnString, vars) {
    var args = [ null, 'x' ].concat(vars);
    
    args.push('"use strict";' + tools.LOAD_MATH_IN_SCOPE +
      'return ' + fnString + ';');

    return new (Function.prototype.bind.apply(Function, args));
  };

  spimosimCore.modules.add('FitBackend', 'synchronous', SynchronousFitBackend);
}());
