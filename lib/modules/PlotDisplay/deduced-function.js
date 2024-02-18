'use strict';
(function () {

function DeducedFunctionPlotDisplay(plotter, settings) {
  spimosimUi.TimePlotDisplay.call(this, plotter, settings);
}
DeducedFunctionPlotDisplay.prototype = Object.create(spimosimUi.TimePlotDisplay.prototype);

DeducedFunctionPlotDisplay.prototype.getPlotOptions = function () {
  return {
    title: this.dataAggregator.settings.fnString,
    xlabel: 't',
    labels: [
      'X',
      'Y'
    ]
  };
};

DeducedFunctionPlotDisplay.getSettingsConfig = function (plotter) {
  var seriesLabels = plotter.dataSource.owner.getSeriesLabels().slice(1);
  var infoText = "";
  var varNames = [];
  if (seriesLabels.length === 1) {
    varNames.push("x");
  } else {
    infoText += "<div>";
    for (var i = 0; i < seriesLabels.length; i++) {
      varNames.push("x" + i);
      infoText += "<div>x" + i + ": " + seriesLabels[i] + "</div>";
    }
    infoText += "</div>";
  }
  var settingsConfig = {
    "fnString": {
      info: infoText,
      labelText: "function (t, " + varNames.join(", ") + ")",
      type: "string",
      value: "1"
    }
  };
  return settingsConfig;
};

DeducedFunctionPlotDisplay.prototype.description = 'Plots a user defined function';
DeducedFunctionPlotDisplay.optionText = 'Deduced function';
spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.add("deduced function", DeducedFunctionPlotDisplay);
spimosimUi.MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.add("deduced function", DeducedFunctionPlotDisplay);
spimosimCore.modules.add('PlotDisplay',{
  "name": "deduced function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "deduced function",
  "date": "2021-08-23",
  "depends": [],
  "files": [
    "lib/modules/PlotDisplay/deduced-function.js"
  ]
}, DeducedFunctionPlotDisplay);
}());
