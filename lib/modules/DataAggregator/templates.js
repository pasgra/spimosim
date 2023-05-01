spimosimCore.modules.add("creator-module-templates", "DataAggregator", {
  labelText: "DataAggregator",
  description: `<p>A DataAggregator aggregates data that can be plotted using a PlotDisplay.
Every time the PlotDisplay needs to redraw it asks its associated
DataAggregator for the data to show.</p>

<p>The idea behind a DataAggregator is that the data inside the protocol object
of the simulation needs further processing before plotting. If this is not
the case, the ProtocolDataAggregator template can be used or the stateVariable
can simplify be marked as plottable.</p>

<p>Otherwise the unprocessed data from the protocol is requested in the functions getConsts
and getVars of the DataAggregator. A PlotBackend will pass the return values
of these functions to a custom PlotComputer that processes the data. spimosim
will then save the processed data in the DataAggregator.</p>

<p>The plotter of the DataAggregator was a property called dataSource. This is either
the simulation object or another DataAggregator in case of deduced plots.</p>

<p>If the data is a single time series, use the TimeDataAggregator template. If
multiple time series should be shown in one plot use MultiSeriesTimeDataAggregator.</p>
`,
  templates: {
    "DataAggregator": {
      object: 'MyDataAggregator',
      template: `function MyDataAggregator(plotter, settings) {
  spimosimCore.DataAggregator.call(this, plotter, settings);
};
MyDataAggregator.prototype = Object.create(spimosimCore.DataAggregator.prototype);

/*
 * This function is called once before initializing to backend by default. It is
 * intended to return settings that will not change over the life of the
 * DataAggregator/Plot.
 */
MyDataAggregator.prototype.getConsts = function() {
  return {
    //someParameter: this.plotter.dataSource.modelSettings.parameters.someParameter
  };
}

/*
 * This function is called to process time steps. It will be called if the dataSource
 * has new data and pass it to the backend by default. spimosim will split the data
 * into intervals for better efficiency. <from> is inclusive while <to> is exclusive.
 */
MyDataAggregator.prototype.getVars = function(from, to) {
  return {
    //someStateVar: this.plotter.dataSource.protocol.getAllTransferable('someStateVar', from, to),
  };
}

// These values configure a fitter
MyDataAggregator.prototype.fittable = true;
MyDataAggregator.prototype.isPdf = false;
MyDataAggregator.prototype.isCdf = false;
MyDataAggregator.prototype.isDiscrete = false;

/*
 * This function is called by the PlotDisplay to get the data it wants to plot.
 * By default the data is stored in the properties this.dataX and this.dataY and
 * this function needs no modifications.
 */
//MyDataAggregator.prototype.getData = function (from, to) {};

/*
 * These functions are handling internal functions and do not need changes in most cases
 */
//MyDataAggregator.prototype.initBackend = function () {};
//MyDataAggregator.prototype.getCsv = function (from, to) {};
//MyDataAggregator.prototype.getTMin = function () {};
//MyDataAggregator.prototype.getTMaxCalculated = function () {};
//MyDataAggregator.prototype.setInterval = function (interval) {};
//MyDataAggregator.prototype.isExpectingData = function () {};
//MyDataAggregator.prototype.deleteOldData = function (tMin) {};
//MyDataAggregator.prototype.setAutoUpdate = function (doAutoUpdate) {};`
    },
    "TimeDataAggregator": {
      object: "MyTimeDataAggregator",
      template: `function MyTimeDataAggregator(plotter, settings) {
  spimosimCore.TimeDataAggregator.call(this, plotter, settings);
};
MyTimeDataAggregator.prototype = Object.create(spimosimCore.TimeDataAggregator.prototype);

/*
 * This function is called once before initializing to backend by default. It is
 * intended to return settings that will not change over the life of the
 * TimeDataAggregator/Plot.
 */
MyTimeDataAggregator.prototype.getConsts = function() {
  return {
    //someParameter: this.plotter.dataSource.modelSettings.parameters.someParameter
  };
}

/*
 * This function is called to process time steps. It will be called if the dataSource
 * has new data and pass it to the backend by default. spimosim will split the data
 * into intervals for better efficiency. <from> is inclusive while <to> is exclusive.
 */
MyTimeDataAggregator.prototype.getVars = function(from, to) {
  return {
    //someStateVar: this.plotter.dataSource.protocol.getAllTransferable('someStateVar', from, to),
  };
}

// These values configure a fitter
MyTimeDataAggregator.prototype.fittable = true;
MyTimeDataAggregator.prototype.isPdf = false;
MyTimeDataAggregator.prototype.isCdf = false;
MyTimeDataAggregator.prototype.isDiscrete = false;

/*
 * This function is called by the PlotDisplay to get the data it wants to plot.
 * By default the data is stored in the properties this.dataX and this.dataY and
 * this function needs no modifications.
 */
//MyTimeDataAggregator.prototype.getData = function (from, to) {};

/*
 * These functions are handling internal functions and do not need changes in most cases
 */
//MyTimeDataAggregator.prototype.initBackend = function () {};
//MyTimeDataAggregator.prototype.getCsv = function (from, to) {};
//MyTimeDataAggregator.prototype.getTMin = function () {};
//MyTimeDataAggregator.prototype.getTMaxCalculated = function () {};
//MyTimeDataAggregator.prototype.setInterval = function (interval) {};
//MyTimeDataAggregator.prototype.isExpectingData = function () {};
//MyTimeDataAggregator.prototype.deleteOldData = function (tMin) {};
//MyTimeDataAggregator.prototype.setAutoUpdate = function (doAutoUpdate) {};`
    },
    "MultiSeriesTimeDataAggregator": {
      object: "MyMultiSeriesTimeDataAggregator",
      template: `function MyMultiSeriesTimeDataAggregator(plotter, settings) {
  var number_of_time_series = 2;
  spimosimCore.MultiSeriesTimeDataAggregator.call(this, plotter, settings, number_of_time_series);
};
MyMultiSeriesTimeDataAggregator.prototype = Object.create(spimosimCore.MultiSeriesTimeDataAggregator.prototype);

MyMultiSeriesTimeDataAggregator.prototype.getConsts = function () {
};

MyMultiSeriesTimeDataAggregator.prototype.getVars = function (from, to) {
};

MyMultiSeriesTimeDataAggregator.prototype.getData = function (tStart, tEnd) {
};
`
    },
    "ProtocolDataAggregator": {
      object: "MyProtocolDataAggregator",
      template: `
function MyProtocolDataAggregator(plotter, settings) {
  spimosimCore.modules.get("DataAggregator", "protocol").call(this, plotter, settings);
};
MyProtocolDataAggregator.prototype = Object.create(spimosimCore.modules.get("DataAggregator", "protocol").prototype);`
    }
  }
});
