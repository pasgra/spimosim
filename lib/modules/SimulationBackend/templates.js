spimosimCore.modules.add("creator-module-templates", "SimulationBackend", {
  labelText: "SimulationBackend",
  templates: {
    "SimulationBackend": {
      object: 'MySimulationBackend',
      template: `function MySimulationBackend(simulationFrontend, backendSettings) {
}

MySimulationBackend.prototype.changeBackendSettings = function (backendSettings) {
}

MySimulationBackend.prototype.changeModelSettings = function (modelSettings) {
}

MySimulationBackend.prototype.resume = function () {
}

MySimulationBackend.prototype.pause = function() {
}

MySimulationBackend.prototype.requestObjects = function (names) {
}

MySimulationBackend.prototype.destroy = function () {
}
`
    }
  }
});
