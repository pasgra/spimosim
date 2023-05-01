spimosimCore.modules.add("creator-module-templates", "FitBackend", {
  labelText: "FitBackend",
  templates: {
    "FitBackend": {
      object: 'MyFitBackend',
      description: `<p>A FitBackend fits functions to plots in the background to prevent the GUI
from freezing during heavy calculations.</p>

<p>The backend to use is set in the model config under fitter.backend.type.
The argument 'frontend' is the Fit and 'backendSettings' is
fitter.backend from the model config.</p>`,
      template: `function MyFitBackend(frontend, backendSettings) {
  // initialize
  this.frontend = frontend
}

/*
 * The argument 'data' is like
 * data = {
 *   type: custom|exponential|powerLaw,
 *   var: [ var0Name, var1Name, ... ],
 *   dataX: [ x0, x1, ... ],
 *   dataY: [ y0, y1, ... ],
 *   xMin: 0.,
 *   xMax: 100.,
 *   guess: [ var0guess, var1guess, ... ],
 *   fnString: 'a*x+b', // only for type: custom|exponential
 *   isCdf: true|false, // only for type: powerLaw
 *   cdfX: [ cdfX0, cdfX1, ... ], // only for type: powerLaw
 *   cdfY: [ cdfY0, cdfY1, ... ], // only for type: powerLaw
 * }
 */
MyFitBackend.prototype.fit = function (data) {
  function callback(result) {
    // Tell the frontend about the result.
    this.frontend.setResult(result);
  }

  doSomethingInBackground(data, callback);
}

/*
 * Clean up
 */
MyFitBackend.prototype.destroy = function () {}`
    }
  }
});
