'use strict';
if (typeof require !== 'undefined') {
  var tools = require('./tools.js');
  var spimosimCore = require('./spimosimCore.js');
}
;'use strict';

(function () {
  var Protocol = spimosimCore.Protocol,
    spinArrayConverter = spimosimCore.spinArrayConverter;

  function SynchronousSimulationBackend(simulationFrontend, backendSettings) {
    this.modelName = backendSettings.name;
    if (this.modelName === undefined) {
      throw 'Error in config: simulation.backend.name is not defined.'
    }
    
    this.modelUrls = backendSettings.urls;
    if (this.modelUrls === undefined) {
      throw 'Error in config: simulation.backend.urls is not defined.'
    }
    
    this.simulationFrontend = simulationFrontend;
    this.settings = {
      protocol: { //Which vars should be posted to the main thread
        varsConfig: [ ],
        saveInterval: 1,
      },
      sendInterval: 100, //in ms
      sendFirstAfter: 20, //in ms
      tMax: 0
    };

    this.backendObjects = {};

    this.t = 0;
    this.timeoutId = false;
  }

  SynchronousSimulationBackend.prototype.destroy = function () {
    clearTimeout(this.timeoutId);
  };

  SynchronousSimulationBackend.prototype.requestObjects = function (names) {
    var objects = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      objects[name] = this.model[name];
    }

    this.simulationFrontend.setBackendObjects(objects);
  };

  SynchronousSimulationBackend.prototype.createProtocol = function () {
    var histSettings = this.settings.protocol;
    this.protocol = new Protocol(histSettings.varsConfig, this.lastSendT + 1);
  };

  SynchronousSimulationBackend.prototype.nextStep = function () {
    this.timeoutId = false;

    if (this.t < this.settings.tMax) {
      this.t++;

      var t = this.t,
        model = this.model,
        settings = this.settings;

      //Calculate next step
      model.step(this.settings.protocol.varsConfig);

      if (t % settings.protocol.saveInterval === 0) {
        this.protocol.set(t, model);
      }

      if (this.nextSendTime <= Date.now()) {
        this.sendProtocol();
      }

      //Process next step. The usage of setTimeout allows the page to react on
      //inputs. If a new simulation start, the old calculation ends here.
      var backend = this;
      this.timeoutId = setTimeout(function () {
        backend.nextStep();
      }, 0);
    } else {
      this.sendProtocol();

      //Send message to main tread that the task is done.
      var msg = {
        type: 'done',
        t: this.t
      };

      this.simulationFrontend.setDone();
    }
  };

  SynchronousSimulationBackend.prototype.changeBackendSettings = function (newSettings) {
    tools.copyInto(newSettings, this.settings);
    
    if (newSettings.protocol !== undefined && 
        newSettings.protocol.varsConfig !== undefined) {
      this.settings.protocol.varsConfig = newSettings.protocol.varsConfig;
    }
    
    if (this.protocol) {
      this.protocol.addVars(this.settings.protocol.varsConfig);
    }

    this.simulationFrontend.setBackendSettingsChanged(this.settings);
  };

  SynchronousSimulationBackend.prototype.changeModelSettings = function (settings) {
    this.pause();

    this.invalidParameter = undefined;

    try {
      if (this.model) {
        this.model.changeSettings(settings);
      } else {
        this.model =
          new (spimosimCore.get('Model', this.settings.name))(settings);
      }
    } catch (e) {
      if (e.invalidParameter) {
        this.invalidParameter = e.invalidParameter;
        this.invalidParameterMsg = e.invalidParameterMsg;
        
        this.simulationFrontend.setInvalidParameter(this.invalidParameter,
          this.invalidParameterMsg);
        return;
      } else {
        throw e;
      }
    }

    this.t = 0;
    this.lastSendT = -1;
    
    this.createProtocol();
    this.protocol.set(this.t, this.model);

    this.resume();
  };

  SynchronousSimulationBackend.prototype.resume = function () {
    this.nextSendTime = Date.now() + this.settings.sendFirstAfter;
    this.nextStep();
  };

  SynchronousSimulationBackend.prototype.pause = function() {
    clearTimeout(this.timeoutId);
    this.timeoutId = false;
  };

  SynchronousSimulationBackend.prototype.sendProtocol = function() {
    var model = this.model,
      settings = this.settings,
      protocol = this.protocol;

    this.protocol.makeTransferable();
    
    this.nextSendTime += settings.sendInterval;
    this.lastSendT = this.t;
    
    this.createProtocol();

    this.simulationFrontend.setNewData(this.t, protocol);
  };

  spimosimCore.modules.add('SimulationBackend', {
    name: 'synchronous',
    files: [ 'lib/modules/SimulationBackend/synchronous.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A simulation backend running on the main thread.',
    date: '2020-03-26'
  }, SynchronousSimulationBackend);
})();
