'use strict';

(function () {
  function FitWebWorkerBackend(fit, backendSettings) {
    backendSettings = tools.copyInto(backendSettings || {}, {
      workerUrl: FitWebWorkerBackend.WORKER_URL
    });
    this.worker = new Worker(backendSettings.workerUrl);

    this.worker.addEventListener('error', function (e) {
      fit.setError(e);
    });

    this.worker.addEventListener('message', function (msg) {
      fit.setResult(msg.data.result);
    });
  }

  FitWebWorkerBackend.prototype.fit = function (config) {
    this.worker.postMessage(config);
  };

  FitWebWorkerBackend.prototype.destroy = function () {
    this.worker.terminate();
  };

  FitWebWorkerBackend.WORKER_URL = '../lib/spimosimCore/spimosimCore.fit.worker.js';

  spimosimCore.modules.add('FitBackend', 'webworker', FitWebWorkerBackend);
})();
