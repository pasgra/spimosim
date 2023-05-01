spimosimCore.modules.add("creator-module-templates", "PlotBackend", {
  labelText: "PlotBackend",
  templates: {
    "PlotBackend": {
      object: 'MyPlotBackend',
      description: `<p>A PlotBackend calculated data for plots. Preferable this is done in the background to prevent the GUI
from freezing during heavy calculations. The javascript PlotBackends use a PlotComputer module for each plot type for the concrete calculation.</p>`,
      template: `function MyPlotBackend(plot, backendSettings, t) {
  this.plot = plot;
  this.t = t;
  this.updateInterval = 100; // in ms
  this.initialized = true;
}

MyPlotBackend.prototype.setInterval = function (interval) {
  // pass data to frontend every <interval> ms.
  this.updateInterval = interval; // in ms
};

MyPlotBackend.prototype.isExpectingData = function () {
  // Return true if the backend is still working on providing data.
  // If no data was produced so far, the frontend should wait and
  // not created an error
  return false;
};

MyPlotBackend.prototype.setAutoUpdate = function (doAutoUpdate) {
  this.doAutoUpdate = doAutoUpdate;
  this.calcSteps();
};

MyPlotBackend.prototype.calcSteps = function (force) {
  if (!this.initialized || (force !== true && this.doAutoUpdate === false)) {
    return;
  }
  let tMax = this.plot.plotter.dataSource.getTMaxCalculated() + 1;
  let tMaxThisCall = tMax; // TODO: Replace with something taking this.interval into account
  // calculate from this.t to tMax
  let dataX = [];
  let dataY = [];
  let meta = {};
  
  this.t = tMax;
  var done = (tMax == tMaxThisCall);

  this.plot.addData(dataX, dataY, meta);
  if (!done) {
    this.calcSteps();
  }
};

MyPlotBackend.prototype.destroy = function () {
  // free up resources
};`
    }
  }
});
