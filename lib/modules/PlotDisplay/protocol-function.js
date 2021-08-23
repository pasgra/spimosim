'use strict';
(function () {

function ProtocolFunctionPlotDisplay(plotter, settings) {
  spimosimUi.TimePlotDisplay.call(this, plotter, settings);
}
ProtocolFunctionPlotDisplay.prototype = Object.create(spimosimUi.TimePlotDisplay.prototype);
      
ProtocolFunctionPlotDisplay.prototype.getPlotOptions = function () {
  return {
    title: 'Function',
    xlabel: 't',
    labels: [
      'X',
      'Y'
    ]
  };
};

ProtocolFunctionPlotDisplay.getSettingsConfig = function (plotter) {
  var allVarNames = Object.keys(plotter.dataSource.protocol.vars);
  var settingsConfig = {
    "fnString": {
      labelText: "function (t, ...)",
      type: "string",
      value: "1"
    }
  };
  for (var i = 0; i < allVarNames.length; i++) {
    settingsConfig["varName_" + i] = {
      type: "select",
      labelText: "Argument #" + (i+1),
      texts: ["-"].concat(allVarNames),
      values: ["-"].concat(allVarNames),
      value: "-"
    };
    
    if (i > 0) {
      settingsConfig["varName_" + i].parent = "varName_" + (i-1);
      settingsConfig["varName_" + i].parentValue = allVarNames;
    }
  }
  return settingsConfig;
};

ProtocolFunctionPlotDisplay.prototype.description = 'Plots a user defined function';
ProtocolFunctionPlotDisplay.optionText = 'Protocol function';
spimosimCore.modules.add('PlotDisplay',{
  "name": "protocol function",
  "author": "Pascal Grafe",
  "version": "1.0",
  "description": "Protocol function",
  "date": "2021-08-23",
  "depends": [],
  "files": [
    "lib/modules/PlotDisplay/protocol-function.js"
  ]
}, ProtocolFunctionPlotDisplay);
}());
