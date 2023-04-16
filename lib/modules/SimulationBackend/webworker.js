'use strict';

(function () {
  function SimulationWebWorkerBackend(simulationFrontend, backendSettings) {
    backendSettings = tools.copyInto(backendSettings || {}, {
      workerUrl: SimulationWebWorkerBackend.WORKER_URL
    });

    this.worker = new Worker(backendSettings.workerUrl || SimulationWebWorkerBackend.WORKER_URL);
    this.modelName = backendSettings.name;
    if (this.modelName === undefined) {
      throw 'Error in config: simulation.backend.name is not defined.'
    }

    this.modelUrls = backendSettings.urls;
    if (this.modelUrls === undefined) {
      throw 'Error in config: simulation.backend.urls is not defined.'
    }

    this.worker.addEventListener('error', function (e) {
      simulationFrontend.setError(e);
    });

    this.worker.addEventListener('message', function (msg) {
      switch (msg.data.type) {
        case 'new data':
          simulationFrontend.setNewData(msg.data.t, msg.data.protocol, msg.data.isFirstData);
          break;
        case 'backend event':
          var data = JSON.parse(msg.data);
          simulationFrontend.setBackendEvent(data.objects);
          break;
        case 'requested objects':
          simulationFrontend.setBackendObjects(msg.data.objects);
          break;
        case 'done':
          simulationFrontend.setDone();
          break;
        case 'invalid parameter':
          simulationFrontend.setInvalidParameter(msg.data.invalidParameter, msg.data.invalidParameterMsg);
          break;
        case 'error':
          simulationFrontend.setError(msg.data.error);
          break;
        default:
          simulationFrontend.setError('Received unknown message from worker');
          throw 'Received unknown message from worker';
      }
    });
  }
  SimulationWebWorkerBackend.WORKER_URL = 'webworker.worker.js';

  SimulationWebWorkerBackend.prototype.resume = function () {
    this.worker.postMessage({
      command: 'resume'
    });
  };

  SimulationWebWorkerBackend.prototype.destroy = function () {
    this.worker.terminate();
  };

  SimulationWebWorkerBackend.prototype.requestObjects = function (names) {
    this.worker.postMessage({
      command: 'request objects',
      names: names
    });
  };

  SimulationWebWorkerBackend.prototype.pause = function () {
    this.worker.postMessage({
      command: 'pause'
    });
  };

  SimulationWebWorkerBackend.prototype.changeBackendSettings = function (backendSettings, resume) {
    this.worker.postMessage({
      command: 'change backend settings',
      settings: backendSettings,
      resume: resume
    });
  };

  SimulationWebWorkerBackend.prototype.changeModelSettings = function (modelSettings, restart) {
    this.worker.postMessage({
      command: 'change model settings',
      modelSettings: modelSettings,
      restart: restart
    });
  };

  spimosimCore.modules.add('SimulationBackend', {
    name: 'webworker',
    files: [ 'lib/modules/SimulationBackend/webworker.js', 'lib/modules/SimulationBackend/webworker.worker.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A simulation backend running on a webworker thread.',
    date: '2020-03-26'
  }, SimulationWebWorkerBackend);
})();
