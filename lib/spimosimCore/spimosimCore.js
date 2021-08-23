/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';
/*
 *
 * A library for simulating models of physics and econophysics and analysing
 * the created data. It does not interact with a (html) document. Use the library
 * 'spimosimUi', if you want an graphical user interface.
 *
 * depends on:
 *   tools.js
 *   one backend module for the simulation, plots and fits each.
 *   (The file polyfill.js is needed to extend browser support.)
 *
 *
 * Parts:
 *
 * - Modules:
 *   Modules extend the functionality of spimosim but are also used to tell spimosim
 *   about your model. Modules are saved in the folder modules/[type]/[name].js.
 *   spimosimCore knows the following types of modules:
 *    * ProtocolVar
 *       Each module deals with storing a different data type in an efficient way.
 *    * DataAggregator
 *       Each module deals with a different type of plot
 *    * SimulationBackend &
 *    * PlotBackend &
 *    * FitBackend
 *       These are used to run expensive calculations independent from the main thread.
 * 
 * - Step storing:
 *    * Protocol:
 *       Saves the simulated data
 *    * ProtocolVar:
 *       Can be extended to save one variable for each step.
 *    * ObjectProtocolVar
 *       Actually Saves one variable for each step using a standard array
 *       (Most general but in general inefficient depending on the variable type)
 *
 * - Simulation:
 *   An abstract simulation that can be started, stopped, etc. It is split into
 *   a frontend and a backend. You can use different backends. Only the frontend
 *   is defined in this file.
 *    * SimulationFrontend:
 *       Used to control the backend.
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
 *   To organize the data aggregators and to communicate with the backend:
 *    * PlotterFrontend
 *       Stores plots and communicates with a backend that does expensive
 *       calculations for the plots in the background
 * 
 * - Fits
 *   Used to further analyse plots
 *    * HeadlessFit:
 *       Fits a function to plot data.
 *    * HeadlessFitter:
 *       Organizes fits (one fitter per plot) and communicates with its backend.
 *    
 */

'use strict';

var spimosimCore = (function () {
  //shortcuts
  var Register = tools.Register,
    EventAttacher = tools.EventAttacher,
    EventDispatcher = tools.EventDispatcher;

  /* ---------------------------------MODULES---------------------------------*/

  var modules = {
    registers: {},

    newRegister: function (name) {
      var register = new Register(name);
      this.registers[name] = register;
      return register;
    },

    add: function (registerName, info, Constructor, prototypeFns, fns) {
      if (registerName in this.registers) {
        if (typeof info === "object") {
          name = info.name;
        } else {
          name = info;
        }
        
        var FinalConstructor = this.registers[registerName].add(name, Constructor, prototypeFns, fns);
        
        if (typeof info === "object") {
          FinalConstructor.moduleInfo = info;
        }

        return FinalConstructor;
      }  else {
        throw 'Cannot add "' + type + '" to unknown register "' + registerName + '"!';
      }
    },

    get: function (registerName, type) {
      if (registerName in this.registers) {
        return this.registers[registerName].get(type);
      }  else {
        throw 'Cannot get "' + type + '" from unknown register "' + registerName + '"!';
      }
    },

    exists: function (registerName, type) {
      if (registerName in this.registers) {
        return this.registers[registerName].exists(type);
      }  else {
        throw 'Cannot check existence of "' + type + '" from unknown register "' + registerName + '"!';
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

  modules.newRegister('DataAggregator').add = function (type, Constructor, prototypeFns, fns) {
    var C = tools.Register.prototype.add.call(this, type, Constructor, prototypeFns, fns);
    C.prototype.plotType = type;
    return C;
  };

  /* -------------------------------EASY LOADING------------------------------*/
  function Initializer() {}

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


  /* -------------------------------STEP STORING------------------------------*/
  function ProtocolVar(tMin) {
    this.tMin = tMin;
    this.tMax = tMin - 1;
  };

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


  function Protocol(varsConfig, tMin) {
    this.vars = {};
    this.bytesPerStep = undefined;

    this.tMin = tMin;//The earliest time step saved. Negative time is not supported
    this.tMax = tMin - 1;//The latest time step saved
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
              console.log('Warning: ' + name + ' has unknown variable type (' + type + ')');
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
    this.tMax = Math.max(this.tMax, t);
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
   * Deletes everything older than tMin   
   */
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
   * Merges everything from 'protocol' into this protocol object.
   */
  Protocol.prototype.merge = function (protocol) {
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

  /* -------------------------------SIMULATION--------------------------------*/

  function SimulationFrontend(backendSettings) {
    EventDispatcher.call(this, [ 'first data', 'new data', 'adjacency lists', 'done', 'invalid parameter',
      'requested objects', 'backend event', 'model settings changed', 'error' ]);

    this.protocolSettings = backendSettings.protocol;
    this.backend = SimulationFrontend.getBackend(this, backendSettings);
    this.backendObjects = {};

    this.tMaxCalculated = undefined;
    this.modelSettings = undefined;
    this.protocol = undefined;
    this.isRunningBool = false;

    var frontend = this;
    this.error;
    this.errorLogger = function (e) {
      frontend.error = e;
      self.spimosimError = e;
      console.log(e);
    };
    this.addEventListener('error', this.errorLogger);
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

  SimulationFrontend.prototype.setError = function (e) {
    this.isRunningBool = false;
    this.dispatchEvent('error', e);
  };

  SimulationFrontend.prototype.setNewData = function (tMaxCalculated, protocol, isFirstData) {
    this.tMaxCalculated = tMaxCalculated;
    this.protocol.merge(protocol);
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

  SimulationFrontend.prototype.setBackendEvent = function (eventObject) {
    this.dispatchEvent('backend event', eventObject);
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

  
  /* ----------------------------------PLOTS---------------------------------*/

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
    EventDispatcher.call(this, [ 'new data', 'error' ]);
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

    var frontend = this;
    this.error;
    this.errorLogger = function (e) {
      frontend.error = e;
      self.spimosimError = e;
      console.log(e);
    };
    this.addEventListener('error', this.errorLogger);
  }
  DataAggregator.prototype = Object.create(EventDispatcher.prototype);
  tools.addToPrototype(DataAggregator, EventAttacher);

  DataAggregator.prototype.fittable = false;
  DataAggregator.prototype.isPdf = false;
  DataAggregator.prototype.isCdf = false;
  DataAggregator.prototype.isDiscrete = false;

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

  DataAggregator.prototype.setError = function (e) {
    this.dispatchEvent('error', e);
  };


  DataAggregator.prototype.isExpectingData = function () {
    return this.backend.isExpectingData();
  };

  DataAggregator.prototype.setInterval = function (interval) {
    this.backend.setInterval(interval);
  };

  DataAggregator.prototype.fit = function () {
    if (this.fitter) {
      this.fitter.fitAll(this.dataX, this.dataY, this.isPdf, this.isCdf, this.isDiscrete);
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

  /* -----------------------------------FITS--------------------------------- */


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

    EventDispatcher.call(this, [ 'settings changed', 'fitted', 'error' ]);

    var frontend = this;
    this.error;
    this.errorLogger = function (e) {
      frontend.error = e;
      self.spimosimError = e;
      console.log(e);
    };
    this.addEventListener('error', this.errorLogger);
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

  /*
   * 
   */
  function HeadlessFit(fitter, vars, guess, xMin, xMax, fnString, cdfString) {
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
  
  HeadlessFit.prototype.setError = function (e) {
    this.fitter.dispatchEvent('error', e);
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



  /* -----------------------COLLECT AND RETURN ---------------------------*/

  return {
    Initializer: Initializer,

    Protocol: Protocol,
    ProtocolVar: ProtocolVar,
    ObjectProtocolVar: ObjectProtocolVar,

    SimulationFrontend: SimulationFrontend,

    PlotterFrontend: PlotterFrontend,
    
    HeadlessFitter: HeadlessFitter,
    HeadlessFit: HeadlessFit,

    DataAggregator: DataAggregator,
    TimeDataAggregator: TimeDataAggregator,
    MultiSeriesTimeDataAggregator: MultiSeriesTimeDataAggregator,
    
    modules: modules
  };
})();

if (typeof module !== 'undefined') {
  module.exports = spimosimCore;
}
