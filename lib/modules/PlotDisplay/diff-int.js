'use strict';

(function () {
  function DiffIntPlotDisplay(plotter, settings) {
    spimosimUi.TimePlotDisplay.call(this, plotter, settings);
  }
  DiffIntPlotDisplay.prototype = Object.create(spimosimUi.TimePlotDisplay.prototype);

  DiffIntPlotDisplay.prototype.description = 'Differentiates or integrates n times';
  DiffIntPlotDisplay.optionText = 'Differentiate or integrate';

  DiffIntPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      operation: {
        type: "select",
        values: [ "diff", "int"],
        texts: [ "differentiate", "integrate"],
        value: "int",
        name: 'operation',
        labelText: 'operation'
      },
      repeat: {
        min: 1,
        max: 10,
        value: 1,
        step: 1,
        name: 'diff-int-n-times',
        labelText: 'integrate/differentiate n times'
      },
      timeStep: {
        min: 1e-10,
        max: 1e10,
        value: 1,
        logScale: true,
        name: 'time-step',
        labelText: 'Time step (scales result)'
      }
    };
  };

  DiffIntPlotDisplay.prototype.getPlotOptions = function () {
    let operationName;
    let repeatName;
    if (this.dataAggregator.settings.operation === "int") {
      operationName = "Integrate";
    } else if (this.dataAggregator.settings.operation === "diff") {
      operationName = "Differentiate";
    }
    if (this.dataAggregator.settings.repeat === 1) {
      repeatName = "";
    } else {
      repeatName = " " + this.dataAggregator.settings.repeat + " times";
    }

    return {
      title: operationName + repeatName,
      xlabel: 't',
      labels: this.getSeriesLabels(true),
    };
  };

  spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.add("diff-int", DiffIntPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'diff-int',
    files: [ 'lib/modules/PlotDisplay/diff-int.js' ],
    depends: [ 'module:DataAggregator/diff-int' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, DiffIntPlotDisplay);
})();
