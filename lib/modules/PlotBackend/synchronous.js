'use strict';
if (typeof require !== 'undefined') {
  var tools = require('./tools.js');
  var spimosimCore = require('./spimosimCore.js');
}
;'use strict';

(function () {
  function SynchronousPlotBackend(plot, settings) {
    this.settings = settings;
    this.interval = settings.interval || 200;//in ms

    this.plot = plot;
    this.plotter = plot.plotter;

    this.msPerStep = this.interval;
    this.t = 0;

    this.totalTime = .1;
    this.totalSteps = 0;
    this.initConsts();
  };

  SynchronousPlotBackend.prototype.setInterval = function (interval) {
    this.interval = interval
  }

  SynchronousPlotBackend.prototype.isExpectingData = function () {
    return this.initTimeoutId !== undefined;
  }

  SynchronousPlotBackend.prototype.setAutoUpdate = function (doAutoUpdate) {
    this.doAutoUpdate = doAutoUpdate;
    this.calcSteps();
  }

  SynchronousPlotBackend.prototype.calcSteps = function (force) {
    if (!this.initialized || (force !== true && this.doAutoUpdate === false)) {
      return;
    }

    var tStart = this.t,
      tEnd = tStart + Math.ceil(this.interval / this.msPerStep);

    tEnd = Math.min(tEnd, this.plotter.dataSource.getTMaxCalculated() + 1);

    if (tStart < tEnd) {
      var startTime = Date.now();
      this.plotComputer.calcDataInterval(this.plot.getVars(tStart, tEnd),
        tStart, tEnd);

      this.totalTime += Date.now() - startTime;
      this.totalSteps += tEnd - tStart;
      
      this.msPerStep = this.totalTime / this.totalSteps;
      this.plot.upToDate = false;
      this.plot.tMaxCalculated = tEnd - 1;

      this.plot.addData(this.plotComputer.dataX, this.plotComputer.dataY,
        this.plotComputer.meta);
      
      this.t = tEnd;

      this.calcSteps();
    }
  };

  SynchronousPlotBackend.prototype.initConsts = function () {
    var plot = this.plot;
    
    try {
      var consts = plot.getConsts();
      plot.consts = consts;
      this.plotComputer =
        new (spimosimCore.modules.get('PlotComputer', plot.plotType))(consts);
      this.initialized = true;
      this.calcSteps();
    } catch (e) {
      if (e === 'Consts not ready') {
        var backend = this;
        this.initTimeoutId = setTimeout(function () {
          backend.initTimeoutId = undefined;
          backend.initConsts();
        }, 30);
      } else if (e !== 'Unsupported settings for plot') {
        throw e;
      }
    }
  };

  SynchronousPlotBackend.prototype.destroy = function () {
    if (this.initTimeoutId !== undefined) {
      clearTimeout(this.initTimeoutId);
    }
  };
  
  SynchronousPlotBackend.prototype.concatData = false;
  
  spimosimCore.modules.add('PlotBackend', {
    name: 'synchronous',
    files: [ 'lib/modules/PlotBackend/synchronous.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot backend that runs on the main thread.',
    date: '2020-03-26'
  }, SynchronousPlotBackend);
}());


