spimosimCore.modules.add("creator-module-templates", "PlotBackend", {
  labelText: "PlotBackend",
  templates: {
      object: 'MyPlotWebWorkerBackend',
      template: `
function MyPlotWebWorkerBackend(plot, backendSettings, t) {
}

MyPlotWebWorkerBackend.prototype.setInterval = function (interval) {
};

MyPlotWebWorkerBackend.prototype.isExpectingData = function () {
};

MyPlotWebWorkerBackend.prototype.setAutoUpdate = function (doAutoUpdate) {
};

MyPlotWebWorkerBackend.prototype.calcSteps = function (force) {
};

MyPlotWebWorkerBackend.prototype.initWorker = function () {
};

MyPlotWebWorkerBackend.prototype.destroy = function () {
};

      `
  }
});
