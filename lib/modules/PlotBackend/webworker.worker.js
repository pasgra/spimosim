/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';

if (!(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)) {
  window.importScripts = function (){};
}

importScripts('../../spimosimCore/tools.js', '../../spimosimCore/spimosimCore.js', '../../../ext_lib/lib/numeric/numeric-1.2.8-2.min.js');

spimosimCore.modules.newRegister('PlotComputer');

spimosimCore.PlotComputer = (function () {
  function PlotComputer(consts) {
    this.consts = consts;

    this.meta = {};
  }

  PlotComputer.prototype.getTransfers = function () {
    return [];
  };

  PlotComputer.prototype.concatData = false;

  return PlotComputer;
}());


spimosimCore.TimePlotComputer = (function () {
  function TimePlotComputer(consts) {
    spimosimCore.PlotComputer.call(this, consts);
  }

  TimePlotComputer.prototype.getTransfers = function () {
    var transferList = [
      this.dataY.buffer
    ];

    this.dataY = undefined;

    return transferList;
  };

  TimePlotComputer.prototype.calcDataInterval = function (vars, tStart, tEnd) {
    this.dataY = new Float64Array(tEnd - tStart);
    var i = 0;

    for (var t = tStart; t < tEnd; t++) {
      this.dataY[i++] = this.getYValue(t, vars);
    }

    this.meta.tStart = tStart;
    this.meta.tEnd = tEnd;
  };

  return TimePlotComputer;
}());

spimosimCore.MultiSeriesTimePlotComputer = (function () {
  function MultiSeriesTimePlotComputer(consts, n) {
    spimosimCore.PlotComputer.call(this, consts);
    this.n = n;
  }

  MultiSeriesTimePlotComputer.prototype.getTransfers = function () {
    var transferList = [];

    for (var i = 0; i < this.n; i++) {
      transferList.push(this.dataY[i].buffer);
    };

    this.dataY = undefined;

    return transferList;
  };

  MultiSeriesTimePlotComputer.prototype.calcDataInterval =
      function (vars, tStart, tEnd) {
    this.dataY = [];
    for (var i = 0; i < this.n; i++) {
      this.dataY[i] = new Float64Array(tEnd - tStart);
    }

    this.meta.tStart = tStart;
    this.meta.tEnd = tEnd;

    for (var t = tStart; t < tEnd; t++) {
      var yValues = this.getYValues(t, vars);
      for (var i = 0; i < this.n; i++) {
        this.dataY[i][t - tStart] = yValues[i];
      }
    }
  };

  return MultiSeriesTimePlotComputer;
}());


spimosimCore.PlotWorker = (function () {
  function PlotWorker() {
    this.totalTime = .1;
    this.totalSteps = 0;

    var worker = this;

    self.addEventListener('message', function (msg) {
      switch (msg.data.command) {
        case 'init':
          worker.init(msg.data.plotType, msg.data.consts, msg.data.plotUrls);
          break;
        case 'calc steps':
          worker.calcSteps(msg.data.vars, msg.data.tStart, msg.data.tEnd);
          break;
        default:
          throw 'Unknown command: ' + msg.data.command;
      }
    });
  }

  PlotWorker.prototype.concatData = false;

  PlotWorker.prototype.calcSteps = function (vars, tStart, tEnd) {
    var startTime = Date.now();

    this.plotComputer.calcDataInterval(vars, tStart, tEnd);

    this.totalTime += Date.now() - startTime;
    this.totalSteps += tEnd - tStart;

    this.sendData(tStart, tEnd);
  };

  PlotWorker.prototype.init = function (plotType, consts, plotUrls) {
    for (var i = 0, len = plotUrls.length; i < len; i++) {
      importScripts(plotUrls[i]);
    }

    this.plotComputer = new (spimosimCore.modules.get('PlotComputer', plotType))(consts);

    self.postMessage({
      type: 'initialized'
    });
  };

  PlotWorker.prototype.sendData = function (tStart, tEnd) {
    var plotComputer = this.plotComputer,
      msg = {
        type: 'new data',
        dataX: plotComputer.dataX,
        dataY: plotComputer.dataY,
        meta: plotComputer.meta,
        t: tEnd - 1,
        msPerStep: this.totalTime / this.totalSteps
      },
      transferList = plotComputer.getTransfers();

    self.postMessage(msg, transferList);
  };

  return PlotWorker;
})();

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  new spimosimCore.PlotWorker();
}
