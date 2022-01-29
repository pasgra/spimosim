'use strict';

(function () {
  function ProtocolDataAggregator(plotter, settings) {
    spimosimCore.TimeDataAggregator.call(this, plotter, settings);

    if (settings === undefined) {
      settings = {};
    }

    this.plotter = plotter;
    this.settings = settings;

    var dataAggregator = this;
    this.protocolListener = {
      dispatcher: plotter.dataSource,
      type: 'new data',
      callback: function () {
        dataAggregator.fit();
        dataAggregator.dispatchEvent('new data');
      },
    };
  }
  ProtocolDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

  ProtocolDataAggregator.prototype.fittable = false;

  ProtocolDataAggregator.prototype.getTMin = function () {
    return this.plotter.dataSource.protocol.tMin;
  };

  ProtocolDataAggregator.prototype.getTMaxCalculated = function () {
    return this.plotter.dataSource.protocol.tMax;
  };

  ProtocolDataAggregator.prototype.setInterval = function (interval) {};
  
  ProtocolDataAggregator.prototype.isExpectingData = function () {
    return this.plotter.dataSource.isRunning();
  };

  ProtocolDataAggregator.prototype.deleteOldData = function (tMin) {};
  
  ProtocolDataAggregator.prototype.getData = function (from, to) {
    var protocol = this.plotter.dataSource.protocol,
      data = [];

    if (from === undefined) {
      from = protocol.tMin;
    } else {
      from = Math.max(protocol.tMin, from);
    }


    if (to === undefined) {
      to = protocol.tMax;
    } else {
      to = Math.min(protocol.tMax, to);
    }

    if (from < to) {
      if (this.fitter) {
        var xValues = [];
        for (var t = from; t <= to; t++) {
          xValues.push(t);
        }
        var fittedDataY = this.fitter.getAllFittedDataY(xValues),
          len = fittedDataY.length,
          point;

        for (var t = from; t <= to; t++) {
          point = [ t, protocol.get(this.settings.varName, t) ];
          for (var i = 0; i < len; i++) {
            point.push(fittedDataY[i][t - tStart]);
          }  
          data.push(point);
        }
      } else {
        for (var t = from; t <= to; t++) {
          data.push([ t, protocol.get(this.settings.varName, t) ]);
        }
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  ProtocolDataAggregator.prototype.getDataY = function (tStart, tEnd) {
    return this.plotter.dataSource.protocol.getAll(this.settings.varName, tStart, tEnd);
  };

  ProtocolDataAggregator.prototype.initBackend = function () {};

  ProtocolDataAggregator.prototype.getCsv = function (from, to) {
    var protocol = this.plotter.dataSource.protocol,
      data = [];

    if (from === undefined) {
      from = protocol.tMin;
    }

    if (to === undefined) {
      to = protocol.tMax;
    }

    var str = '';
    for (var t = from; t <= to; t++) {
      str += t + ' ' + protocol.get(this.settings.varName, t) + '\n';
    }

    return str;
  };

  ProtocolDataAggregator.prototype.setAutoUpdate = function (doAutoUpdate) {
    if (doAutoUpdate) {
      this.attachEventListener(this.protocolListener);
    } else {
      this.detachEventListener(this.protocolListener);
    }
  };

  spimosimCore.modules.add('DataAggregator', {
    name: 'protocol',
    files: [ 'lib/modules/DataAggregator/protocol.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A data aggreator for protocol.',
    date: '2020-03-26'
  }, ProtocolDataAggregator);
})();
