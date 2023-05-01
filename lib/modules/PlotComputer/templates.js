spimosimCore.modules.add("creator-module-templates", "PlotComputer", {
  labelText: "PlotComputer",
  templates: {
    "PlotComputer": {
      object: 'MyPlotComputer',
      template: `function MyPlotComputer(consts) {
}

MyPlotComputer.prototype.getTransfers = function () {

}`
    },
    "TimePlotComputer": {
      object: 'MyTimePlotComputer',
      template: `function MyTimePlotComputer(consts) {
}

MyTimePlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd) {
}

MyTimePlotComputer.prototype.getYValue = function (t, vars) {
}`
    },
    "PlotComputer": {
      object: 'MyMultiSeriesTimePlotComputer',
      template: `function MyMultiSeriesTimePlotComputer(consts, n) {
}

MyMultiSeriesTimePlotComputer.prototype.getYValues = function (t, vars) {
}`
    }
  }
});
