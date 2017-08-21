/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

importScripts('polyfill.js', 'tools.js', 'spimosimCore.js', 'network-config.js', 'protocol-vars.js');


spimosimCore.SimulationWorker = (function () {
  var Protocol = spimosimCore.Protocol,
    spinArrayConverter = spimosimCore.spinArrayConverter;

  function SimulationWorker() {
    this.settings = {
      protocol: { //Which vars should be posted to the main thread
        varsConfig: [ ],
        saveInterval: 1,
      },
      sendInterval: 100, //in ms
      sendFirstAfter: 20, //in ms
      tMax: 0
    };

    this.t = 0;
    this.lastSendT = -1;
    this.timeoutId = false;
    this.nextSendTime = 0;
    this.messages = [];
    this.isFirstData = true;
  }

  SimulationWorker.prototype.createProtocol = function () {
    var histSettings = this.settings.protocol;
    this.protocol = new Protocol(histSettings.varsConfig, this.lastSendT + 1);
  };

  SimulationWorker.prototype.nextStep = function () {
    this.timeoutId = false;

    if (this.t < this.settings.tMax) {
      this.t++;

      var t = this.t,
        model = this.model,
        settings = this.settings;

      //Calculate next step
      model.step(this.settings.protocol.varsConfig, t);

      if (t % settings.protocol.saveInterval === 0) {
        this.protocol.set(t, model);
      }

      if (this.nextSendTime <= Date.now()) {
        this.sendProtocol();
      }

      //Process next step. The usage of setTimeout allows the page to react on
      //inputs. If a new simulation start, the old calculation ends here.
      var worker = this;
      this.timeoutId = setTimeout(function () {
        worker.nextStep();
      }, 0);
    } else {
      this.sendProtocol();

      //Send message to main tread that the task is done.
      var msg = {
        type: 'done',
        t: this.t
      };

      self.postMessage(msg);
    }
  };

  SimulationWorker.prototype.init = function () {
    this.initialized = true;

    var modelUrls = this.settings.urls;
    for (var i = 0, len = modelUrls.length; i < len; i++) {
      importScripts(modelUrls[i]);
    }
  };

  SimulationWorker.prototype.mergeBackendSettings = function (newSettings) {
    tools.copyInto(newSettings, this.settings);

    if (newSettings.protocol !== undefined && 
        newSettings.protocol.varsConfig !== undefined) {
      this.settings.protocol.varsConfig = newSettings.protocol.varsConfig;
    }

    if (this.protocol) {
      this.protocol.addVars(this.settings.protocol.varsConfig);
    }

    if (!this.initialized) {
      this.init();
    }
  };

  SimulationWorker.prototype.changeModelSettings = function (settings, restart) {
    try {
      if (this.model) {
        this.model.changeSettings(settings, restart);
      } else {
        this.model = new (spimosimCore.modules.get('Model', this.settings.name))(settings);
      }
      return true;
    } catch (e) {
      if (e.invalidParameter) {
        this.sendInvalidParameter(e.invalidParameter, e.invalidParameterMsg);
	    if (restart) { 
		  this.invalidParameter = e.invalidParameter;
	      this.invalidParameterMsg = e.invalidParameterMsg;
		}
	    return false;
      } else {
        throw e;
	  }
    }
  };

  SimulationWorker.prototype.restart = function (settings) {
    this.pause();

    this.invalidParameter = undefined;

    if (this.changeModelSettings(settings, true)) {
      this.t = 0;
      this.isFirstData = true;
      this.lastSendT = -1;

      this.createProtocol();
      this.protocol.set(this.t, this.model);

      this.resume();
	}
  };

  SimulationWorker.prototype.resume = function () {
    this.nextSendTime = Date.now() + this.settings.sendFirstAfter;
    this.nextStep();
  };

  SimulationWorker.prototype.pause = function() {
    self.clearTimeout(this.timeoutId);
    this.timeoutId = false;
  };

  SimulationWorker.prototype.sendProtocol = function() {
    var model = this.model,
      settings = this.settings,
      protocol = this.protocol;

    var msg = {
      type: 'new data',
      protocol: protocol,
      t: this.t,
      lastSendT: this.lastSendT,
      isFirstData: this.isFirstData
    };
    this.isFirstData = false;

    var toTransfer = this.protocol.makeTransferable();

    this.nextSendTime += settings.sendInterval;
    this.lastSendT = this.t;

    this.createProtocol();

    self.postMessage(msg, toTransfer);
  };

  SimulationWorker.prototype.sendInvalidParameter = function (invalidParameter, invalidParameterMsg) {
    self.postMessage({
      type: 'invalid parameter',
      invalidParameter: invalidParameter,
      invalidParameterMsg: invalidParameterMsg
    });
  };

  SimulationWorker.prototype.sendRequestedObjects = function (names) {
    var objects = {};
    for (var i = 0, len = names.length; i < len; i++) {
      var name = names[i];
      objects[name] = this.model[name];
    }

    self.postMessage({
      type: 'requested objects',
      objects: objects
    });
  };

  SimulationWorker.prototype.enqueueMessage = function (msg) {
    this.messages.push(msg);

    if (!this.processesMessages) {
      this.processesMessages = true;

      while (msg = this.messages.shift()) {
        switch (msg.data.command) {
          case 'change backend settings':
            worker.mergeBackendSettings(msg.data.settings);
		    if (msg.data.resume) {
              this.resume();
			}
            break;
          case 'change model settings':
            if (msg.data.restart) {
              worker.restart(msg.data.modelSettings);
            } else {
              worker.changeModelSettings(msg.data.modelSettings, false);
            }
            break;
          case 'request objects':
            worker.sendRequestedObjects(msg.data.names);
            break;
          case 'resume':
            worker.resume();
            break;
          case 'pause':
            worker.pause();
            break;
          default:
            throw 'Unknown command: ' + msg.data.command;
        }
      }

      this.processesMessages = false;
    }
  }

  return SimulationWorker;
})();

var worker = new spimosimCore.SimulationWorker();

self.addEventListener('message', function (msg) {
  if (msg.data.command !== 'change model settings' && worker.invalidParameter !== undefined) {
    worker.sendInvalidParameter(worker.invalidParameter, worker.invalidParameterMsg);
    return;
  }

  worker.enqueueMessage(msg);
});
