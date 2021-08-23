'use strict';

(function () {
  function PlotWebWorkerBackend(plot, backendSettings, t) {
    backendSettings = tools.copyInto(backendSettings || {}, {
      workerUrl: PlotWebWorkerBackend.WORKER_URL
    });
    
    this.worker = new Worker(backendSettings.workerUrl);

    this.backendSettings = backendSettings;

    this.interval = backendSettings.interval || 100;//in ms

    this.isWorking = false;

    this.plot = plot;
    this.plotter = plot.plotter;

    this.msPerStep = this.interval;
    this.t = t || 0;

    this.worker.addEventListener('error', function (e) {
      plot.setError(e);
    });

    var backend = this;
    this.worker.addEventListener('message', function (msg) {
      switch (msg.data.type) {
        case 'initialized':
          backend.initialized = true;

          backend.calcSteps();
          break;
        case 'new data':
          backend.isWorking = false;

          backend.msPerStep = msg.data.msPerStep;
          backend.plot.upToDate = false;
          backend.plot.tMaxCalculated = msg.data.t;

          backend.plot.addData(msg.data.dataX, msg.data.dataY, msg.data.meta);

          backend.calcSteps();
      }
    });

    this.initWorker();
  };

  PlotWebWorkerBackend.prototype.setInterval = function (interval) {
    this.interval = interval
  }

  PlotWebWorkerBackend.WORKER_URL = 'webworker.worker.js';

  PlotWebWorkerBackend.prototype.isExpectingData = function () {
    return this.isWorking || (this.initWorkerTimeoutId !== undefined);
  }

  PlotWebWorkerBackend.prototype.setAutoUpdate = function (doAutoUpdate) {
    this.doAutoUpdate = doAutoUpdate;
    this.calcSteps();
  }

  PlotWebWorkerBackend.prototype.calcSteps = function (force) {
    if (!this.initialized || this.isWorking ||
        (force !== true && this.doAutoUpdate === false)) {
      return;
    }

    var tStart = this.t,
      tEnd = tStart + Math.ceil(this.interval / Math.max(1, this.msPerStep));

    tEnd = Math.min(tEnd, this.plotter.dataSource.getTMaxCalculated() + 1);

    if (tStart < tEnd) {
      var msg = {
        command: 'calc steps',
        vars: this.plot.getVars(tStart, tEnd),
        tStart: tStart,
        tEnd: tEnd
      };

      this.worker.postMessage(msg);
      this.isWorking = true;

      this.t = tEnd;
    }
  };

  PlotWebWorkerBackend.prototype.initWorker = function () {
    var plot = this.plot,
      msg;

    if (this.isWorking) {
      this.isWorking = false;
    }

    try {
      var consts = plot.getConsts();
      plot.consts = consts;

      msg= {
        command: 'init',
        plotType: plot.plotType,
        consts: consts,
        plotUrls: this.backendSettings.urls
      };

      this.worker.postMessage(msg);
    } catch (e) {
      console.error(e);
      if (e === 'Consts not ready') {
        var backend = this;
        this.initWorkerTimeoutId = setTimeout(function () {
          backend.initWorkerTimeoutId = undefined;
          backend.initWorker();
        }, 30);
      } else if (e !== 'Unsupported settings for plot') {
        throw e;
      }
    }
  };

  PlotWebWorkerBackend.prototype.destroy = function () {
    this.worker.terminate();
    if (this.initWorkerTimeoutId !== undefined) {
      clearTimeout(this.initWorkerTimeoutId);
    }
  };
  
  spimosimCore.modules.add('PlotBackend', {
    name: 'webworker',
    files: [ 'lib/modules/PlotBackend/webworker.js', 'lib/modules/PlotBackend/webworker.worker.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot backend that runs on a webworker thread.',
    date: '2020-03-26'
  }, PlotWebWorkerBackend);
})();
