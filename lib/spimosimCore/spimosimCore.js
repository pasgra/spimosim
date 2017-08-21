/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';
/*
 *
 * A library for simulating spin models on lattices and other networks of
 * one or more spins and analising the created data. It does support any
 * GUI. Use the library 'spimosimUi', if you want an graphical user interface.
 *
 * Dependencies: tools.js
 * (The appended file polyfill.js is needed to extend browser support.)
 *
 *
 * Modules:
 * 
 * - Step storing:
 *    * ProtocolVar:
 *       Saves one type of variable
 *    * Protocol:
 *       Saves the simulated data
 *
 * - Simulation modules:
 *   An abstract simulation that can be started, stopped, etc. It is split into
 *   a frontend and a backend. In theory you could use different backends, but
 *   currently only one is available. It would be possible to write a backend
 *   to run the simulation on an external server.
 *    * SimulationFrontend:
 *       Used to control the backend.
 *    * SimulationWebWorkerBackend:
 *       An implementation of a simulation backend using a webworker.
 *       Dependency: SimulationWorker (external file)
 *
 * - "Plots"
 *   Since this is not a graphical library, the following modules actually do
 *   not plot anything. They only generate the neccesary data. Use 'spimosimUi'
 *   for graphics.
 *    * DataAggregator:
 *       Collects and processes data for plots with one y value per x value.
 *       The processing is done by a backend.
 *    * TimeDataAggregator:
 *       Like DataAggregator, but with implicit x-values [0, 1, 2, ...]. Used
 *       for values that change every time step.
 *    * MultiSeriesTimeDataAggregator:
 *       Like TimeDataAggregator, but supports multiple y-values for each
 *       time step.
 *   To further analize an existing plots:
 *    * AutoCorrelationDataAggregator:
 *       A TimeDataAggregator that calculates the autocorrelation function of
 *       another TimeDataAggregator.
 *    * MultiSeriesAutoCorrelationDataAggregator:
 *       A MultiSeriesTimeDataAggregator that calculates the autocorrelation
 *       function of another MultiSeriesTimeDataAggregator.
 *   To organize the data aggregators:
 *    * PlotterFrontend
 * 
 * - Fits
 *    * HeadlessFit:
 *       Fits different functions to plot data.
 *    * HeadlessFitter:
 *       Organizes fits.
 *    
 * There are two registers that save constructors:
 * - modelRegister:
 *    * Saves every known model. You must add your own model to this object.
 * - dataAggregatorsRegister:
 *    * Saves every known type of data aggregator. You need to add your own
 *      data aggregators to this object.
 * - networkRegister:
 *    * Saves every known type of network. You must add your own networks the
 *      this object.
 *
 */

'use strict';

var spimosimCore = (function () {
  //shortcuts
  var Register = tools.Register,
    EventAttacher = tools.EventAttacher,
    EventDispatcher = tools.EventDispatcher;


  /* -------------------------------STEP STORING------------------------------*/
  function Initializer() {
  }

  Initializer.prototype.initModel = function (modelConfig) {
    this.modelConfig = modelConfig;

    var backendConfig = this.modelConfig.plotter.backend;

    if (backendConfig === undefined) {
      throw 'Error in config: plotter.backend is undefined';
    }

    this.plotter = new PlotterFrontend(this.plotTypes, backendConfig);
  };

  Initializer.prototype.createPlotTypes = function () {
    this.plotTypes = {};

    var plotTypeNames = this.modelConfig.plotter.plotTypes;
    for (var i = 0, len = plotTypeNames.length; i < len; i++) {
      var name = plotTypeNames[i];
      this.plotTypes[name] = modules.get('DataAggregator', name);
    };
  };

  Initializer.prototype.start = function (modelSettings, backendSettings) {
    if (this.modelConfig.simulation.backend === undefined) {
      throw 'Error in config: simulation.backend is undefined';
    }

    backendSettings = tools.copyInto(backendSettings, {});
    tools.copyInto(this.modelConfig.simulation.backend, backendSettings);

    var simulation = this.simulation;
    //Create a simulation that calculates the frames
    if (!simulation) {
      simulation = new SimulationFrontend(backendSettings);
      this.simulation = simulation;
    }
    simulation.changeBackendSettings(backendSettings, false);
    simulation.changeModelSettings(modelSettings);

    simulation.resume();

    this.plotter.setDataSource(simulation);
  };

  Initializer.prototype.destroyModel = function () {
    if (this.simulation) {
      this.simulation.destroy();
      this.simulation = undefined;
    }

    if (this.plotter) {
      this.plotter.destroy();
      this.plotter = undefined;
    }
  };

  Initializer.prototype.changeModel = function (modelConfig) {
    this.destroyModel();

    this.initModel(modelConfig);
  };


  /*
   * Saves time step of one variable
   */
  function ProtocolVar(tMin) {
    this.tMin = tMin;
    this.tMax = tMin - 1;
  };
  ProtocolVar.types = {};

  ProtocolVar.prototype.get = function (t) {
    if (t < this.tMin) {
      return undefined;
    } else {
      return this.data[t - this.tMin];
    }
  };

  ProtocolVar.prototype.slice = function (tMin, tMax) {
    return this.data.slice(tMin - this.tMin, tMax - this.tMin);
  };

  ProtocolVar.prototype.deleteOldData = function (t) {
    var t = Math.max(this.tMin, t);
    this.data = this.data.slice(t - this.tMin);
    this.tMin = t;
  };

  ProtocolVar.prototype.makeTransferable = function () {
    return [];
  };

  ProtocolVar.prototype.getAsJsonString = function (t) {
    return JSON.stringify(this.data[t]);
  };

  ProtocolVar.prototype.parsedJson2Value = function (obj) {
    return obj;
  };

  /*
   * Saves time step of one variable in a standard js array
   */
  function ObjectProtocolVar(tMin) {
    ProtocolVar.call(this, tMin);
    this.data = [];
  }
  ObjectProtocolVar.prototype = Object.create(ProtocolVar.prototype);

  ObjectProtocolVar.prototype.set = function(t, val) {
    this.data[t - this.tMin] = val;
    this.tMax = Math.max(t, this.tMax);
  };

  ObjectProtocolVar.prototype.getAsJsonString = function (t) {
    return JSON.stringify(this.data[t - this.tMin]);
  };

  ObjectProtocolVar.prototype.setAll = function(t, vals) {
    Array.prototype.splice.apply(this.data, [ t - this.tMin, vals.length ].concat(vals));
    this.tMax = Math.max(t + vals.length - 1, this.tMax);
  };

  ObjectProtocolVar.prototype.join = function(protocolVar) {
    ObjectProtocolVar.prototype.setAll.call(this, protocolVar.tMin, protocolVar.data);
  };

  function OtherObjectProtocolVar(tMin, bytesPerStep) {
    ObjectProtocolVar.call(this, tMin);
    this.bytesPerStep = bytesPerStep;
  }
  OtherObjectProtocolVar.prototype = Object.create(ObjectProtocolVar.prototype);

  OtherObjectProtocolVar.prototype.getBytesPerStep = function () {
    return this.bytesPerStep;
  };


  /*
   * Saves the simulated data.
   *
   * arguments:
   *  - names: An array of variable names to be saved from the model object at
   *     every time step.
   *     For TypedArrays only the buffer is stored.
   *  - type: An array of variable types (eg. BoolArray, Int8Array, String, ...)
   */
  function Protocol(varsConfig, tMin) {
    this.vars = {};
    this.bytesPerStep = undefined;

    this.tMax = tMin - 1;//The lastest time step saved
    this.tMin = tMin;//The earliest time step saved. Negative time are not supported
    this.lastBytesPerStepUpdate = -1;

    this.maxBytes = 50<<20;//50 MiB - the max (guessed) memory all saved data in this object must not exceed

    //create arrays for every variable
    this.addVars(varsConfig);
  }

  Protocol.prototype.updateBytesPerStep = function (skipIfUnnecessary) {
    if (this.bytesPerStep === undefined || skipIfUnnecessary !== true || this.lastBytesPerStepUpdate < this.tMax / (1 + this.bytesPerStepUpdateTimeGrowth)) {
      this.bytesPerStep = 0;
      for (var name in this.vars) {
        if (this.vars.hasOwnProperty(name)) {
          this.bytesPerStep += this.vars[name].getBytesPerStep();
        }
      }

      this.lastBytesPerStepUpdate = this.tMax;
    }
  };

  /*
   * Creates an array in the protocol object called <name> for every name
   * in the array names.
   */
  Protocol.prototype.addVars = function (varsConfig) {
    for (var name in varsConfig) {
      if (varsConfig.hasOwnProperty(name)) {
        if (this.vars[name] === undefined) {
          var type = varsConfig[name].type;
          try {
            var ProtocolVarConstructor = modules.get('ProtocolVar', type);
            this.vars[name] = new ProtocolVarConstructor(this.tMin);
          } catch (e) {
            if (e === 'ProtocolVar "' + type + '" is not registered.') {
              console.log('Warning: ' + name + ' has unknown variable type (' +
                type + ')');
              var bytesPerStep = varsConfig[name].bytesPerStep;
              if (bytesPerStep === undefined) {
                throw 'Error: ' + name + ' has unknown variable type and has not set bytesPerStep.';
              }
              this.vars[name] = new OtherObjectProtocolVar(this.tMin, bytesPerStep);
            } else {
              throw e;
            }
          }
        }
      }
    }

    this.bytesPerStep = undefined;
  };

  /* 
   * Saves the properties of model for time step t.
   */
  Protocol.prototype.set = function (t, model) {
    for (var name in this.vars) {
      if (this.vars.hasOwnProperty(name)) {
        this.vars[name].set(t, model[name]);
      }
    }
  };

  Protocol.prototype.bytesPerStepUpdateTimeGrowth = .33;//Increase time between bytes per step updates by 33%
  Protocol.prototype.memoryTolerance = .15;//Delete old data automatically if 15% over limit


  Protocol.prototype.getMaxSteps = function () {
    if (this.bytesPerStep === undefined) {
      this.updateBytesPerStep();
    }
    return Math.floor(this.maxBytes / this.bytesPerStep);
  };

  /*
   * Deletes everything older than tMin   */
  Protocol.prototype.deleteOldData = function (tMin) {
    this.updateBytesPerStep(true);

    if (tMin === undefined) {
      //Guess tMin to limit the used memory to this.maxBytes.
      tMin = Math.max(this.tMin, Math.max(0, this.tMax - this.getMaxSteps()));
    }

    for (var name in this.vars) {
      if (this.vars.hasOwnProperty(name)) {
        this.vars[name].deleteOldData(tMin);
      }
    }

    this.tMin = tMin;
  };

  /*
   * Joins everything from 'protocol' into this protocol object.
   */
  Protocol.prototype.join = function (protocol) {
    var vars = protocol.vars;

    this.tMax = Math.max(this.tMax, protocol.tMax);

    for (var name in vars) {
      if (vars.hasOwnProperty(name)) {
        if (this.vars[name] === undefined) {
          var type = vars[name].type;
          if (type !== undefined) {
            this.addVars({ name: {
                type: type
              }
            });
          } else {
            this.addVars({ name: {
                type: 'other',
                bytesPerStep: vars[name].bytesPerStep
              }
            });
          }
        }

        this.vars[name].join(vars[name]);
      }
    }

    this.updateBytesPerStep(true);
    if ((this.tMax - this.tMin) / this.getMaxSteps() >= (1 + this.memoryTolerance)) {
      this.deleteOldData();
    }
  };

  /*
   * Return variables that can be moved throw an webworker message without
   * copying.
   */
  Protocol.prototype.makeTransferable = function () {
    var transferables = [];
    for (var name in this.vars) {
      if (this.vars.hasOwnProperty(name)) {
        transferables = transferables.concat(this.vars[name].makeTransferable());
      }
    }

    return transferables;
  };

  Protocol.prototype.afterTransfer = function () {
    for (var name in this.vars) {
      if (this.vars.hasOwnProperty(name)) {
        this.vars[name].afterTransfer();
      }
    }
  };

  /*
   *
   */
  Protocol.prototype.getAsJson = function (t) {
    var parts = [];
    for (var name in this.vars) {
      if (this.vars.hasOwnProperty(name)) {
        parts.push('"' + name + '":' + this.vars[name].getAsJsonString(t));
      }
    }

    return '{' + parts.join(',') + '}';
  };

  Protocol.parsedJson2Values = function (obj, varsConfig) {
    var ProtocolVarConstructor,
      values = {};
    for (var name in varsConfig) {
      if (varsConfig.hasOwnProperty(name)) {
        try {
          ProtocolVarConstructor = modules.get('ProtocolVar', varsConfig[name].type);
        } catch (e) {
          ProtocolVarConstructor = OtherObjectProtocolVar;
        }

        if (obj[name] !== undefined) {
          values[name] = ProtocolVarConstructor.prototype.parsedJson2Value(obj[name]);
        }
      }
    }

    return values;
  };

  /*
   * Return the object 'name' for the time step 't'.
   */
  Protocol.prototype.get = function (name, t) {
    if (this.vars[name] === undefined) {
      throw 'Unknown variable';
    } else {
      var value = this.vars[name].get(t);
      if (value === undefined) {
        throw 'Unknown frame';
      }

      return value;
    }
  };

  /*
   * Return the object 'name' for the time step 't'.
   */
  Protocol.prototype.getAll = function (name, tMin, tMax) {
    var values = [];

    if (this.vars[name] === undefined) {
      throw 'Unknown variable';
    } else {
      for (var t = tMin; t < tMax; t++) {
        values.push(this.vars[name].get(t));
      }

      return values;
    }
  };

  /*
   * Return the object 'name' for the time step 't'.
   */
  Protocol.prototype.getAllTransferable = function (name, tMin, tMax) {
    var values = [];

    if (this.vars[name] === undefined) {
      throw 'Unknown variable';
    } else {
      var protocolVar = this.vars[name];

      if (protocolVar.getTransferable) {
        for (var t = tMin; t < tMax; t++) {
          values.push(protocolVar.getTransferable(t));
        }
      } else {
        for (var t = tMin; t < tMax; t++) {
          values.push(protocolVar.get(t));
        }
      }

      return values;
    }
  };

  /*
   * Calculates indirect neighbors of different orders. Returns an array
   * of arrays of arrays. The index in the first array is the node number.
   * The index in the second array is the order of neighborhood. The third array
   * lists all neighbors of that order,
   */
  function getDistanceLists(adjacencyLists, rMax) {
    var distanceLists = [],
      n = adjacencyLists.length,
      nearestNeighbors,
      distanceMap,
      neighborsForLevel,
      neighborsForLastLevel,
      foundNeighbors = new Int8Array(n),
      j, k;

    if (rMax === undefined) {
      rMax = Infinity;
    }

    for (var i = 0; i < n; i++) {//Calculate distanceMap for every spin
      for (var j = 0; j < n; j++) {
        foundNeighbors[j] = 0;
      }
      foundNeighbors[i] = 1;//You are not your own neighbor

      distanceMap = [];
      distanceLists[i] = distanceMap;

      neighborsForLastLevel = [ i ];

      for (var r = 0; r < rMax; r++) {//Calculate neighbors for every distance
        neighborsForLevel = [];
        for (var indexJ = 0, lenJ = neighborsForLastLevel.length;
            indexJ < lenJ; indexJ++) {//Get neighbors of every spin of last distance
          j = neighborsForLastLevel[indexJ];

          nearestNeighbors = adjacencyLists[j];

          for (var indexK = 0, lenK = nearestNeighbors.length; indexK < lenK;
              indexK++) {
            k = nearestNeighbors[indexK];

            if (!foundNeighbors[k]) {
              neighborsForLevel.push(k);
              foundNeighbors[k] = 1;
            }
          }

        }

        if (neighborsForLevel.length > 0) {
          distanceMap.push(neighborsForLevel);

          neighborsForLastLevel = neighborsForLevel;
        } else {
          //No neighbors of this order means no neighbors of heigher orders.
          break;
        }
      }
    }

    return distanceLists;
  }



  /* -------------------------------SIMULATION--------------------------------*/

  function SimulationFrontend(backendSettings) {
    EventDispatcher.call(this, [ 'first data', 'new data', 'adjacency lists', 'done', 'invalid parameter',
      'requested objects', 'model settings changed' ]);

    this.protocolSettings = backendSettings.protocol;
    this.backend = SimulationFrontend.getBackend(this, backendSettings);
    this.backendObjects = {};

    this.tMaxCalculated = undefined;
    this.modelSettings = undefined;
    this.protocol = undefined;
    this.isRunningBool = false;
  };

  SimulationFrontend.prototype = Object.create(EventDispatcher.prototype);

  SimulationFrontend.prototype.changeModelSettings = function (modelSettings, restart) {
    if (restart) {
      this.tMaxCalculated = -1;
      this.backendObjects = {};
      this.protocol = new Protocol(this.protocolSettings.varsConfig, 0);
    }
    this.modelSettings = modelSettings;

    this.backend.changeModelSettings(modelSettings, restart);
    this.dispatchEvent('model settings changed', modelSettings);
  };

  SimulationFrontend.prototype.changeBackendSettings = function (backendSettings, resume) {
    this.backend.changeBackendSettings(backendSettings, resume);
  };

  SimulationFrontend.prototype.requestBackendObjects = function (names) {
    this.backend.requestObjects(names);
  };

  SimulationFrontend.prototype.resume = function () {
    this.backend.resume();

    this.isRunningBool = true;
  };

  SimulationFrontend.prototype.destroy = function () {
    this.backend.destroy();

    this.isRunningBool = false;
  };

  SimulationFrontend.prototype.pause = function () {
    this.backend.pause();

    this.isRunningBool = false;
  };

  SimulationFrontend.prototype.isRunning = function () {
    return this.isRunningBool;
  };

  SimulationFrontend.prototype.setDone = function () {
    this.isRunningBool = false;
    this.dispatchEvent('done');
  };

  SimulationFrontend.prototype.setNewData = function (tMaxCalculated, protocol, isFirstData) {
    this.tMaxCalculated = tMaxCalculated;
    this.protocol.join(protocol);
    if (isFirstData) {
      this.dispatchEvent('first data', {
        t: tMaxCalculated,
        protocol: protocol
      });
    }
    this.dispatchEvent('new data', {
      t: tMaxCalculated,
      protocol: protocol
    });
  };

  SimulationFrontend.prototype.setBackendObjects = function (objects) {
    tools.copyInto(objects, this.backendObjects);
    this.dispatchEvent('requested objects', objects);
  };

  SimulationFrontend.prototype.getTMin = function () {
    return this.protocol.tMin;
  };

  SimulationFrontend.prototype.getTMaxCalculated = function () {
    return this.tMaxCalculated;
  };

  SimulationFrontend.prototype.setInvalidParameter = function (parameter, msg) {
    this.dispatchEvent('invalid parameter', {
      parameter: parameter,
      msg: msg
    });
  };

  SimulationFrontend.getBackend = function (simulationFrontend, backendSettings) {
    var type = backendSettings.type || 'webworker',
      Backend = modules.get('SimulationBackend', type);

    return new Backend(simulationFrontend, backendSettings);
  };


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

    this.worker.addEventListener('message', function (msg) {
      switch (msg.data.type) {
        case 'new data':
          simulationFrontend.setNewData(msg.data.t, msg.data.protocol, msg.data.isFirstData);
          break;
        case 'requested objects':
          simulationFrontend.setBackendObjects(msg.data.objects);
          break;
        case 'done':
          simulationFrontend.setDone();
          break;
        case 'invalid parameter':
          simulationFrontend.setInvalidParameter(
            msg.data.invalidParameter, msg.data.invalidParameterMsg);
          break;
        default:
          throw 'Received unknown message from worker';
      }
    });
  }
  SimulationWebWorkerBackend.WORKER_URL = '../lib/spimosimCore/spimosimCore.simulation.worker.js';

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



  function PlotterFrontend(plotTypes, backendConfig) {
    this.plots = [];//All plots
    this.plotTypes = plotTypes;
    this.backendConfig = backendConfig;
  }

  PlotterFrontend.prototype.plotCustom = function (plot) {
    plot.initBackend(this.backendConfig);
    this.plots.push(plot);

    return plot;
  };

  PlotterFrontend.prototype.plot = function (type, settings) {
    var plot = new (this.plotTypes[type])(this, settings);

    return this.plotCustom(plot);
  };

  PlotterFrontend.prototype.setDataSource = function (dataSource) {
    this.dataSource = dataSource;
  };

  PlotterFrontend.prototype.removePlot = function (plot) {
    this.plots.splice(this.plots.indexOf(plot), 1);

    plot.destroy();
  };

  PlotterFrontend.prototype.removePlots = function () {
    while (this.plots.length > 0) {
      this.removePlot(this.plots[this.plots.length - 1]);
    }
  };

  PlotterFrontend.prototype.destroy = function () {
    this.removePlots();
  };


  function DataAggregator(plotter, settings) {
    EventDispatcher.call(this, [ 'new data' ]);
    EventAttacher.call(this);

    if (settings === undefined) {
      settings = {};
    }

    this.tMaxCalculated = -1;
    this.plotter = plotter;
    this.settings = settings;

    this.dataX = [];
    this.dataY = [];

    var dataAggregator = this;
    this.protocolListener = {
      dispatcher: plotter.dataSource,
      type: 'new data',
      callback: function () {
        dataAggregator.backend.calcSteps();
      },
    };
  }
  DataAggregator.prototype = Object.create(EventDispatcher.prototype);
  tools.addToPrototype(DataAggregator, EventAttacher);

  DataAggregator.prototype.fittable = false;

  DataAggregator.prototype.getTMin = function () {
    return this.tMin;
  };

  DataAggregator.prototype.getTMaxCalculated = function () {
    return this.tMaxCalculated;
  };

  DataAggregator.prototype.addData = function (dataX, dataY) {
    this.dataX = dataX;
    this.dataY = dataY;
    this.fit();
    this.dispatchEvent('new data');
  };

  DataAggregator.prototype.isExpectingData = function () {
    return this.backend.isExpectingData();
  };

  DataAggregator.prototype.setInterval = function (interval) {
    this.backend.setInterval(interval);
  };

  DataAggregator.prototype.fit = function () {
    if (this.fitter) {
      var isPdf, isCdf, isDiscrete;

      if (this.isPdf) {
        isPdf = true;
      } else {
        isPdf = false;
      }

      if (this.isCdf) {
        isCdf = true;
      } else {
        isCdf = false;
      }

      if (this.isDiscrete) {
        isDiscrete = true;
      } else {
        isDiscrete = false;
      }

      this.fitter.fitAll(this.dataX, this.dataY, isPdf, isCdf, isDiscrete);
    }
  };

  DataAggregator.prototype.setFitter = function (fitter) {
    this.fitter = fitter;

    var dataAggregator = this;
    fitter.addEventListener('settings changed',
      function () {
        dataAggregator.updateFitSettings();
      });
  };

  DataAggregator.prototype.updateFitSettings = function () {
    this.settings.fit = this.fitter.getSettings();
    this.fit();
  };

  DataAggregator.prototype.initBackend = function (settings) {
    this.tMin = this.plotter.dataSource.getTMin();
    this.backend = DataAggregator.getBackend(this, settings, this.tMin);
    this.setAutoUpdate(true);
  };

  DataAggregator.prototype.destroy = function () {
    EventAttacher.prototype.destroy.call(this);

    if (this.backend) {
      this.backend.destroy();
    }
    if (this.fitter) {
      this.fitter.destroy();
    }
  };

  DataAggregator.prototype.getData = function () {
    var dataX = this.dataX,
      dataY = this.dataY,
      len = dataY.length,
      data = [];

    if (len > 0) {
      if (this.fitter) {
        var fittedDataY = this.fitter.getAllFittedDataY(dataX),
          len2 = fittedDataY.length,
          point;

        for (var i = 0; i < len; i++) {
          point = [ dataX[i], dataY[i] ];
          for (var j = 0; j < len2; j++) {
            point.push(fittedDataY[j][i]);
          }  
          data.push(point);
        }

      } else {
        for (var i = 0; i < len; i++) {
          data.push([ dataX[i], dataY[i] ]);
        }
      }

      return data;
    } else {
      throw 'Empty data';
    }
  };

  DataAggregator.prototype.setAutoUpdate = function (doAutoUpdate) {
    if (doAutoUpdate) {
      this.attachEventListener(this.protocolListener);
    } else {
      this.detachEventListener(this.protocolListener);
    }

    this.backend.setAutoUpdate(doAutoUpdate);
  };


  DataAggregator.getBackend = function (dataAggregator, backendSettings, tMin) {
    var type = backendSettings.type || 'webworker',
      Backend = modules.get('PlotBackend', type);

    return new Backend(dataAggregator, backendSettings, tMin);
  };

  DataAggregator.prototype.getCsv = function (from, to) {
    var dataX = this.dataX,
      dataY = this.dataY;

    var str = '';
    for (var i = 0, len = dataX.length; i < len; i++) {
      str += dataX[i] + ' ' + dataY[i] + '\n';
    }

    return str;
  };

  /*
   * An abstract plot whos x-values are time values of the simulated steps
   */
  function TimeDataAggregator(plotter, settings) {
    DataAggregator.call(this, plotter, settings);

    this.tMin = 0;
    this.dataY = new Float64Array(0);
  };
  TimeDataAggregator.prototype = Object.create(DataAggregator.prototype);

  TimeDataAggregator.prototype.getCsv = function (from, to) {
    if (from === undefined) {
      from = this.tMin;
    }

    var dataY = this.dataY;
    if (to === undefined) {
      to = dataY.length - 1;
    }

    var str = '';
    for (var t = from; t <= to; t++) {
      str += t + ' ' + dataY[t - this.tMin] + '\n';
    }

    return str;
  };

  TimeDataAggregator.prototype.deleteOldData = function (tMin) {
    tMin = Math.max(tMin, this.tMin);
    this.dataY = this.dataY.slice(tMin - this.tMin);
    this.tMin = tMin;
  };

  TimeDataAggregator.prototype.getData = function (tStart, tEnd) {
    var dataX = this.dataX,
      dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY.length + this.tMin;
    } else {
      tEnd = Math.min(this.tMin + dataY.length, tEnd);
    }

    if (tStart < tEnd) {
      if (this.fitter) {
        var fittedDataY = this.fitter.getAllFittedDataY(
            dataX.slice(tStart - this.tMin, tEnd - this.tMin)),
          len = fittedDataY.length,
          point;

        for (var t = tStart; t < tEnd; t++) {
          point = [ t, dataY[t - this.tMin] ];
          for (var i = 0; i < len; i++) {
            point.push(fittedDataY[i][t - tStart]);
          }  
          data.push(point);
        }

      } else {
        for (var t = tStart; t < tEnd; t++) {
          data.push([ t, dataY[t - this.tMin] ]);
        }
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };
  
  TimeDataAggregator.prototype.getDataY = function (tStart, tEnd) {
    return this.dataY.slice(tStart - this.tMin, tEnd - this.tMin);
  };

  TimeDataAggregator.prototype.addData = function (dataX, dataY, meta) {
    var tStart = meta.tStart,
      tEnd = meta.tEnd;

    this.dataY = tools.enlargeFloat64(this.dataY, tEnd - this.tMin);
    this.dataY.set(dataY, tStart - this.tMin);

    this.dispatchEvent('new data');
  };


  
  function ProtocolDataAggregator(plotter, settings) {
    EventDispatcher.call(this, [ 'new data' ]);
    EventAttacher.call(this);

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
  ProtocolDataAggregator.prototype = Object.create(TimeDataAggregator.prototype);

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
    console.log(this.settings.varName);

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


  function MultiSeriesTimeDataAggregator(plotter, settings, n) {
    DataAggregator.call(this, plotter, settings);
    this.n = n;

    this.dataY = [];
    for (var i = 0; i < n; i++) {
      this.dataY[i] = new Float64Array(0);
    }

    this.tMin = 0;
  };
  MultiSeriesTimeDataAggregator.prototype =
    Object.create(TimeDataAggregator.prototype);

  MultiSeriesTimeDataAggregator.prototype.getData = function (tStart, tEnd) {
    var dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY[0].length + this.tMin;
    } else {
      tEnd = Math.min(dataY[0].length + this.tMin, tEnd);
    }

    if (tStart < tEnd) {
      if (this.fitter) {
        var fittedDataY = this.fitter.getAllFittedDataY(dataX.slice(tStart - this.tMin, tEnd - this.tMin)),
          len = fittedDataY.length,
          point;

        for (var t = tStart; t < tEnd; t++) {
          point = [ t ];

          for (var i = 0; i < this.n; i++) {
            point.push(dataY[i][t - this.tMin]);
          }

          for (var i = 0; i < len; i++) {
            point.push(fittedDataY[i][t - tStart]);
          }  
          data.push(point);
        }

      } else {
        for (var t = tStart; t < tEnd; t++) {
          var point = [ t ];
          for (var i = 0; i < this.n; i++) {
            point.push(dataY[i][t - this.tStart]);
          }
          data.push(point);
        }
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  MultiSeriesTimeDataAggregator.prototype.deleteOldData = function (tMin) {
    tMin = Math.max(tMin, this.tMin);
    for (var i = 0, len = this.dataY.length; i < len; i++) {
      this.dataY[i] = this.dataY[i].slice(tMin - this.tMin);  
    }

    this.tMin = tMin;
  };

  MultiSeriesTimeDataAggregator.prototype.getCsv = function (from, to) {
    var dataY = this.dataY,
      data = [],
      n = this.n;

    if (from === undefined) {
      from = this.tMin;
    }

    if (to === undefined) {
      to = this.tMin + dataY[0].length - 1;
    }

    var str = '';
    for (var t = from; t <= to; t++) {
      str += t;

      for (var i = 0; i < n; i++) {
        str += ' ' + dataY[i][t - this.tMin];
      }

      str += '\n';
    }

    return str;
  };

  MultiSeriesTimeDataAggregator.prototype.addData = function (dataX, dataY, meta) {
    var tStart = meta.tStart,
      tEnd = meta.tEnd;

    for (var i = 0; i < this.n; i++) {
      this.dataY[i] = tools.enlargeFloat64(this.dataY[i], tEnd - this.tMin);
      this.dataY[i].set(dataY[i], tStart - this.tMin);
    }

    this.dispatchEvent('new data');
  };


  function MeanValueDataAggregator(plotter, settings) {
    MultiSeriesTimeDataAggregator.call(this, plotter, settings, 2);
  };
  MeanValueDataAggregator.prototype = 
    Object.create(MultiSeriesTimeDataAggregator.prototype);

  MeanValueDataAggregator.prototype.getConsts = function () {
    return {
      perStepMode: this.settings.perStepMode,
      intervalLength: this.settings.intervalLength
    };
  };

  MeanValueDataAggregator.prototype.getVars = function (from, to) {
    if (this.settings.perStepMode) {
      from = Math.max(0, from - this.settings.intervalLength + 1);
    }
    var dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.getDataY(from, to),
      offset: from
    };
  };

  MeanValueDataAggregator.prototype.getData = function (tStart, tEnd) {
    var dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY[0].length + this.tMin;
    } else {
      tEnd = Math.min(dataY[0].length + this.tMin, tEnd);
    }

    if (tStart < tEnd) {
      if (this.fitter) {
        var fittedDataY = this.fitter.getAllFittedDataY(dataX.slice(tStart - this.tMin, tEnd - this.tMin)),
          len = fittedDataY.length,
          point;

        for (var t = tStart; t < tEnd; t++) {
          point = [ t, [ dataY[0][t - this.tMin], dataY[1][t - this.tMin] ] ];

          for (var i = 0; i < len; i++) {
            point.push(fittedDataY[i][t - tStart]);
          }  
          data.push(point);
        }

      } else {
        for (var t = tStart; t < tEnd; t++) {
          data.push([ t, [ dataY[0][t - this.tMin], dataY[1][t - this.tMin] ] ]);
        }
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };


  function MultiSeriesMeanValueDataAggregator(plotter, settings) {
    MeanValueDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesMeanValueDataAggregator.prototype = 
    Object.create(MeanValueDataAggregator.prototype);

  MultiSeriesMeanValueDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;
    from = Math.max(dataSource.tMin, from);

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
      offset: from
    };
  };


  MultiSeriesMeanValueDataAggregator.prototype.getConsts = function () {
    var consts = MeanValueDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };


  function DistributionDataAggregator(plotter, settings) {
    DataAggregator.call(this, plotter, settings);
  };
  DistributionDataAggregator.prototype = Object.create(DataAggregator.prototype);

  DistributionDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues
    };
  };

  DistributionDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;
    return {
      dataY: dataSource.getDataY(from, to)
    };
  };

  DistributionDataAggregator.prototype.isPdf = true;

  function MultiSeriesDistributionDataAggregator(plotter, settings) {
    DistributionDataAggregator.call(this, plotter, settings);
  };

  MultiSeriesDistributionDataAggregator.prototype = 
    Object.create(DistributionDataAggregator.prototype);

  MultiSeriesDistributionDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
    };
  };


  MultiSeriesDistributionDataAggregator.prototype.getConsts = function () {
    var consts = DistributionDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };


  function CumulatedDataAggregator(plotter, settings) {
    DataAggregator.call(this, plotter, settings);
  };
  CumulatedDataAggregator.prototype = Object.create(DataAggregator.prototype);

  CumulatedDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues
    };
  };

  CumulatedDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.getDataY(from, to)
    };
  };

  CumulatedDataAggregator.prototype.isCdf = true;

  function MultiSeriesCumulatedDataAggregator(plotter, settings) {
    CumulatedDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesCumulatedDataAggregator.prototype = 
    Object.create(CumulatedDataAggregator.prototype);

  MultiSeriesCumulatedDataAggregator.prototype.getVars = function (from, to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
    };
  };


  MultiSeriesCumulatedDataAggregator.prototype.getConsts = function () {
    var consts = CumulatedDataAggregator.prototype.getConsts.call(this);
    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };


  function AutoCorrelationDataAggregator(plotter, settings) {
    MultiSeriesTimeDataAggregator.call(this, plotter, settings,
      settings.maxTimeStep + 1);
  };
  AutoCorrelationDataAggregator.prototype = 
    Object.create(MultiSeriesTimeDataAggregator.prototype);

  AutoCorrelationDataAggregator.prototype.getConsts = function () {
    return {
      absValues: this.settings.absValues,
      maxTimeStep: this.settings.maxTimeStep,
      perStepMode: this.settings.perStepMode,
      intervalLength: this.settings.intervalLength
    };
  };

  AutoCorrelationDataAggregator.prototype.getVars = function (from, to) {
    var dataSource = this.plotter.dataSource;
    if (this.settings.perStepMode) {
      from = Math.max(dataSource.tMin,
        from - this.settings.maxTimeStep - this.settings.intervalLength + 1);
    } else {
      from = Math.max(dataSource.tMin, from - this.settings.maxTimeStep);
    }

    return {
      dataY: dataSource.getDataY(from, to),
      offset: from
    };
  };

  AutoCorrelationDataAggregator.prototype.getData = function (tStart, tEnd) {
    var dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY[0].length + this.tMin;
    } else {
      tEnd = Math.min(dataY[0].length + this.tMin, tEnd);
    }

    if (tStart < tEnd) {
      for (var t = tStart; t < tEnd; t++) {
        var point = [ t ];
        for (var i = 1; i < this.n; i++) {
          point.push(dataY[i][t - this.tMin]);
        }
        data.push(point);
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  AutoCorrelationDataAggregator.prototype.getDataFit = function (tStart, tEnd) {
    var dataY = this.dataY,
      data = [];

    if (tStart === undefined) {
      tStart = this.tMin;
    } else {
      tStart = Math.max(this.tMin, tStart);
    }

    if (tEnd === undefined) {
      tEnd = dataY[0].length + this.tMin;
    } else {
      tEnd = Math.min(dataY[0].length + this.tMin, tEnd);
    }

    if (tStart < tEnd) {
      for (var t = tStart; t < tEnd; t++) {
        data.push([ t, dataY[0][t - this.tMin] ]);
      }

      return data;
    } else {
      throw 'Unknown frame';
    }
  };

  AutoCorrelationDataAggregator.prototype.getSingleStepData = function (t) {
    var dataY = this.dataY,
      n = this.n,
      data = [];

    if (dataY[0][t - this.tMin] === undefined) {
      throw 'Unknown frame';
    }

    for (var i = 1; i < n; i++) {
      data.push([
        i,
        dataY[i][t - this.tMin]
      ]);
    }

    return data;
  };

  AutoCorrelationDataAggregator.prototype.getStepCsv = function (t) {
    var dataY = this.dataY,
      str = '';

    for (var i = 1; i < this.n; i++) {
      str += i + ' ' + dataY[i][t - this.tMin] + '\n';
    }

    return str;
  };

  function MultiSeriesAutoCorrelationDataAggregator(plotter, settings) {
    AutoCorrelationDataAggregator.call(this, plotter, settings);
  };
  MultiSeriesAutoCorrelationDataAggregator.prototype = 
    Object.create(AutoCorrelationDataAggregator.prototype);

  MultiSeriesAutoCorrelationDataAggregator.prototype.getVars = function (from,
      to) {
    var seriesNo = this.consts.seriesNo,
      dataSource = this.plotter.dataSource;
    if (this.settings.perStepMode) {
      from = Math.max(this.tMin,
        from - this.settings.maxTimeStep - this.settings.intervalLength + 1);
    } else {
      from = Math.max(dataSource.tMin, from - this.settings.maxTimeStep);
    }

    return {
      dataY: dataSource.dataY[seriesNo].slice(from - dataSource.tMin, to - dataSource.tMin),
      offset: from
    };
  };


  MultiSeriesAutoCorrelationDataAggregator.prototype.getConsts = function () {
    var consts = AutoCorrelationDataAggregator.prototype.getConsts.call(this);

    consts.seriesNo = parseInt(this.settings.seriesNo, 10);

    return consts;
  };

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

  PlotWebWorkerBackend.WORKER_URL = '../lib/spimosimCore/spimosimCore.plot.worker.js';

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
      tEnd = tStart + Math.ceil(this.interval / this.msPerStep);

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

  function HeadlessFitter(settings, backendSettings) {
    this.fits = [];
    this.backendSettings = backendSettings;
    this.isPdf = settings.isPdf;
    this.isCdf = settings.isCdf;
    this.isDiscrete = settings.isDiscrete;

    if (settings !== undefined) {
      for (var i = 0, len = settings.length; i < len; i++) {
        this.addFit(
          new HeadlessFit(this, settings[i].vars,
            settings[i].guess, settings[i].xMin, settings[i].xMax,
            settings[i].fnString, settings[i].cdfString));
      }
    }

    EventDispatcher.call(this, [ 'settings changed', 'fitted' ]);
  };
  HeadlessFitter.prototype = Object.create(EventDispatcher.prototype);

  HeadlessFitter.prototype.addFit = function (fit) {
    this.fits.push(fit);
    this.triggerSettingsChanged();
  };

  HeadlessFitter.prototype.fitAll = function (dataX, dataY, isPdf, isCdf,
      isDiscrete) {
    this.fits.forEach(function (fit) {
      fit.fit(dataX, dataY, isPdf, isCdf, isDiscrete);
    });
  };

  HeadlessFitter.prototype.getAllFittedDataY = function (dataX) {
    return this.fits.map(function (fit) {
      return fit.getFittedDataY(dataX);
    });
  };

  HeadlessFitter.prototype.getSettings = function () {
    return this.fits.map(function (fit) {
      return fit.getSettings();
    });
  };

  HeadlessFitter.prototype.triggerSettingsChanged = function () {
    this.dispatchEvent('settings changed');
  };

  HeadlessFitter.prototype.removeFit = function (fit) {
    var index = this.fits.indexOf(fit);

    if (index === -1) {
      throw 'Unknown fit';
    }

    this.fits.splice(index, 1);
    fit.destroy();

    this.triggerSettingsChanged();
  }

  HeadlessFitter.prototype.removeFits = function () {
    this.fits.forEach(function (fit) {
      fit.destroy();
    });
    this.fits = [];
  };

  HeadlessFitter.prototype.destroy = function () {
    this.removeFits();
  };

  function HeadlessFit(fitter, vars, guess, xMin, xMax, fnString,
      cdfString) {
    this.fitter = fitter;

    this.vars = vars;
    this.guess = guess;
    this.xMin = xMin;
    this.xMax = xMax;

    if (fnString === undefined) {
      fnString = 'a';
    }
    this.setFnString(fnString);

    if (cdfString === undefined) {
      cdfString = 'a * x';
    }
    this.setCdfString(cdfString);

    this.result = {
      message: 'Calculating...',
      solution: vars.map(function () {
        return NaN;
      }),
      distance: {
        distance: NaN,
        prob: 0
      }
    };

    this.backend = HeadlessFit.getBackend(this, fitter.backendSettings);
  };

  HeadlessFit.prototype.setResult = function (result) {
    this.result = result;
    this.fitter.dispatchEvent('fitted', {
      fit: this,
      result: result
    });
  };

  HeadlessFit.prototype.getSettings = function () {
    return {
      xMin: this.xMin,
      xMax: this.xMax,
      vars: this.vars,
      guess: this.guess,
      fnString: this.fnString,
      cdfString: this.cdfString
    };
  };

  HeadlessFit.prototype.setFnString = function (fnString) {
    this.fn = HeadlessFit.toFunction(fnString, this.vars, this.guess);
    this.fnString = fnString;
  };

  HeadlessFit.prototype.setCdfString = function (cdfString) {
    this.cdf = HeadlessFit.toFunction(cdfString, this.vars, this.guess);
    this.cdfString = cdfString;
  };

  HeadlessFit.toFunction = function (fnString, vars, guess) {
    var args = [ null, 'x' ].concat(vars);

    args.push('"use strict";' + tools.LOAD_MATH_IN_SCOPE +
      'return ' + fnString + ';');

    var fn = new (Function.prototype.bind.apply(Function, args));
    fn.apply(null, [ 1 ].concat(guess));

    return fn;
  };

  HeadlessFit.prototype.fit = function (dataX, dataY, isPdf, isCdf, isDiscrete) {
    this.backend.fit({
      dataX: dataX,
      dataY: dataY,
      isPdf: isPdf,
      isCdf: isCdf,
      isDiscrete: isDiscrete,
      fnString: this.fnString,
      cdfString: this.cdfString,
      vars: this.vars,
      guess: this.guess,
      xMin: this.xMin,
      xMax: this.xMax
    });
  };

  HeadlessFit.prototype.getFittedDataY = function (dataX) {
    var len = dataX.length,
      fn = this.fn,
      args = [ undefined ].concat(this.result.solution),
      dataY = new Float64Array(len),
      x,
      xMin = this.xMin,
      xMax = this.xMax;

    if (xMin === undefined) {
      xMin = -Infinity;
    }

    if (xMax === undefined) {
      xMax = Infinity;
    }

    for (var i = 0; i < len; i++) {
      x = dataX[i];
      if (xMin <= x && x <= xMax) {
        args[0] = x;
        dataY[i] = fn.apply(null, args);
      } else {
        dataY[i] = NaN;
      }
    }

    return dataY;
  };

  HeadlessFit.prototype.destroy = function () {
    this.backend.destroy();
  };

  HeadlessFit.getBackend = function (fit, backendSettings) {
    if (backendSettings === undefined) {
      backendSettings = {
        type: 'webworker'
      };
    }

    var type = backendSettings.type,
      Backend = modules.get('FitBackend', type);

    return new Backend(fit, backendSettings);
  };


  function FitWebWorkerBackend(fit, backendSettings) {
    backendSettings = tools.copyInto(backendSettings || {}, {
      workerUrl: FitWebWorkerBackend.WORKER_URL
    });
    this.worker = new Worker(backendSettings.workerUrl);

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



  /* ---------------------------------MODULES---------------------------------*/

  var modules = {
    registers: {},

    newRegister: function (name) {
      var register = new Register(name);
      this.registers[name] = register;
      return register;
    },

    add: function (registerName, type, Constructor, prototypeFns, fns) {
      if (registerName in this.registers) {
        return this.registers[registerName].add(type, Constructor, prototypeFns, fns);
      }  else {
        throw 'Cannot add ' + type + ' from unknown register ' + registerName;
      }
    },

    get: function (registerName, type) {
      if (registerName in this.registers) {
        return this.registers[registerName].get(type);
      }  else {
        throw 'Cannot get ' + type + ' from unknown register ' + registerName;
      }
    },

    list: function (registerName) {
      if (registerName === undefined) {
        var names = [];
        for (var name in this.registers) {
          if (this.registers.hasOwnProperty(name)) {
            names.push(name);
          }
        }
        return names;
      } else {
        return this.registers[registerName].list();
      }
    },

    tree: function () {
      var allIds = {};
      for (var name in this.registers) {
        if (this.registers.hasOwnProperty(name)) {
          allIds[name] = this.list(name);
        }
      }

      return allIds;
    }
  };

  modules.newRegister('SimulationBackend');
  modules.newRegister('PlotBackend');
  modules.newRegister('FitBackend');
  modules.newRegister('ProtocolVar');
  modules.newRegister('SettingsPreprocessor');
  var modelRegister = modules.newRegister('Model');
  var dataAggregatorRegister = modules.newRegister('DataAggregator');
  var networkRegister = modules.newRegister('Network');

  modules.add('SimulationBackend', 'webworker', SimulationWebWorkerBackend);
  modules.add('PlotBackend', 'webworker', PlotWebWorkerBackend);
  modules.add('FitBackend', 'webworker', FitWebWorkerBackend);

  dataAggregatorRegister.add = function (type, Constructor, prototypeFns, fns) {
    var C = tools.Register.prototype.add.call(this, type, Constructor, prototypeFns, fns);
    C.prototype.plotType = type;
    return C;
  };

  modelRegister.add = function (type, Constructor, prototypeFns, fns) {
    this.lastType = type;
    return tools.Register.prototype.add.call(this, type, Constructor, prototypeFns, fns);
  };

  modelRegister.get = function (type) {
    if (!(type in this.registeredConstructors)) {
      if (this.lastType) {
        console.log('Warning: Requested Model "' + type + '" not found! Assuming "' + this.lastType + '" was meant.');
        type = this.lastType;
      }
    }
    return tools.Register.prototype.get.call(this, type);
  };

  //This creates a new constructor of an plot of the energy of the model and
  //registers it directly.
  modules.add('DataAggregator',
    'energy',//id in the register
    TimeDataAggregator,//Inherit from TimeDataAggregator
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size//the network size
        };
      },

      getVars: function (from, to) {
        return {
          energy: this.plotter.dataSource.protocol.getAllTransferable('energy', from, to),//to use this plot your simulation must save an variable called energy
          offset: from//offset of the array called 'energy'
        };
      }
    }
  );

  //Add all known plots to the register
  modules.add('DataAggregator', 'protocol', ProtocolDataAggregator);
  modules.add('DataAggregator', 'mean value', MeanValueDataAggregator);
  modules.add('DataAggregator', 'multi series mean value',
    MultiSeriesMeanValueDataAggregator);
  modules.add('DataAggregator', 'distribution', DistributionDataAggregator);
  modules.add('DataAggregator', 'multi series distribution',
    MultiSeriesDistributionDataAggregator);
  modules.add('DataAggregator', 'cumulated', CumulatedDataAggregator);
  modules.add('DataAggregator', 'multi series cumulated',
    MultiSeriesCumulatedDataAggregator);
  modules.add('DataAggregator', 'auto correlation', AutoCorrelationDataAggregator);
  modules.add('DataAggregator', 'multi series auto correlation',
    MultiSeriesAutoCorrelationDataAggregator);

  networkRegister.generateAdjacencyLists = function (settings) {
    return this.get(settings.type || settings.networkType).generateAdjacencyLists(settings);
  }

  networkRegister.extractSettings = function (settings) {
    var networkType = settings.networkType,
      networkSettings = {
        networkType: networkType
      },
      parameters = this.get(networkType).parameters;

    for (var i = 0, len = parameters.length; i < len; i++) {
      var name = parameters[i];
      networkSettings[name] = settings[name];
    }

    return networkSettings;
  };

  networkRegister.sameSettings = function (settings1, settings2) {
    if (settings1.networkType !== settings2.networkType) {
      return false;
    }

    var networkType = settings1.networkType;

    var parameters = modules.get('Network', networkType).parameters;
    for (var i = 0, len = parameters.length; i < len; i++) {
      var name = parameters[i];
      if (settings1[name] !== settings2[name]) {
        return false;
      }
    }

    return true;
  };

  networkRegister.calculateNetworkSize = function (modelSettings) {
    return this.get(modelSettings.networkType || modelSettings.type).calculateNetworkSize(modelSettings);
  };

  modules.add('SettingsPreprocessor', 'Network', function (oldModelSettings, newModelSettings) {
    var settingsUnchanged = true;
    if (oldModelSettings !== undefined && oldModelSettings.network.type === newModelSettings.network.type) {
      for (var name in newModelSettings.network) {
        if (newModelSettings.network.hasOwnProperty(name)) {
          if (oldModelSettings.network[name] !== newModelSettings.network[name]) {
            settingsUnchanged = false;
            break;
          }
        }
      }
    } else {
      settingsUnchanged = false;
    }
    
    newModelSettings.network.size = modules.get('Network', newModelSettings.network.type).calculateNetworkSize(newModelSettings);
    newModelSettings.network.settingsUnchanged = settingsUnchanged;
    newModelSettings.continuable = (newModelSettings.continuable !== false) && settingsUnchanged;
  });

  /* -----------------------COLLECT AND RETURN ---------------------------*/

  return {
    Initializer: Initializer,

    Protocol: Protocol,
    getDistanceLists: getDistanceLists,

    ProtocolVar: ProtocolVar,
    ObjectProtocolVar: ObjectProtocolVar,

    SimulationFrontend: SimulationFrontend,
    SimulationWebWorkerBackend: SimulationWebWorkerBackend,

    PlotterFrontend: PlotterFrontend,

    DataAggregator: DataAggregator,
    TimeDataAggregator: TimeDataAggregator,
    MultiSeriesTimeDataAggregator: MultiSeriesTimeDataAggregator,

    MeanValueDataAggregator: MeanValueDataAggregator,
    MultiSeriesMeanValueDataAggregator:
      MultiSeriesMeanValueDataAggregator,
    DistributionDataAggregator: DistributionDataAggregator,
    MultiSeriesDistributionDataAggregator:
      MultiSeriesDistributionDataAggregator,
    CumulatedDataAggregator: CumulatedDataAggregator,
    MultiSeriesCumulatedDataAggregator:
      MultiSeriesCumulatedDataAggregator,
    AutoCorrelationDataAggregator: AutoCorrelationDataAggregator,
    MultiSeriesAutoCorrelationDataAggregator:
      MultiSeriesAutoCorrelationDataAggregator,

    PlotWebWorkerBackend: PlotWebWorkerBackend,
    FitWebWorkerBackend: FitWebWorkerBackend,

    HeadlessFitter: HeadlessFitter,
    HeadlessFit: HeadlessFit,

    networkRegister: networkRegister,
    modules: modules
  };
})();

if (typeof module !== 'undefined') {
  module.exports = spimosimCore;
}
