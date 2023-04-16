/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

function error2Object(e) {
  return JSON.parse(JSON.stringify(e, ["name", "message", "stack", "lineNumber", "columnNumber"]));
}

function errorHandler(e) {
  console.error(e);
  self.postMessage({
    type: 'error',
    error: error2Object(e)
  });
}

try {
  importScripts('../../spimosimCore/polyfill.js', '../../spimosimCore/tools.js', '../../spimosimCore/spimosimCore.js');
} catch (e) {
  errorHandler(e);
}


spimosimCore.SimulationWorker = (function () {
  var Protocol = spimosimCore.Protocol,
    spinArrayConverter = spimosimCore.spinArrayConverter;

  var modelRegister = spimosimCore.modules.newRegister('Model');
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
      try {
        // Calculate next steps
        if (this.model.steps) {
          this.t = this.model.steps(this.settings.protocol.varsConfig, this.t, this.settings.tMax, this.protocol, this.settings.protocol.saveInterval, this.nextSendTime);
          this.sendProtocol();
        } else {
          // Calculate next step
          this.t++;
          this.model.step(this.settings.protocol.varsConfig, this.t);

          if (this.t % this.settings.protocol.saveInterval === 0) {
            this.protocol.set(this.t, this.model);
          }

          if (this.nextSendTime <= Date.now()) {
            this.sendProtocol();
          }
        }

        //Process next step. The usage of setTimeout allows the page to react on
        //inputs. If a new simulation start, the old calculation ends here.
        var worker = this;
        this.timeoutId = setTimeout(function () {
          worker.nextStep();
        }, 0);
      } catch (e) {
        errorHandler(e);
      }
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

  SimulationWorker.prototype.shouldSendNow = function () {
    return ;
  }

  SimulationWorker.prototype.init = function () {
    this.initialized = true;

    var modelUrls = this.settings.urls;
    for (var i = 0, len = modelUrls.length; i < len; i++) {
      try {
        importScripts(modelUrls[i]);
      } catch (e) {
        errorHandler(e);
      }
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
      console.error("Error initializing model. Default to dummy model.");
      if (!this.model) {
        // initialize dummy model
        function logError() {
          console.log("Model not initialized.");
        }
        this.model = {
          step: logError,
          changeSettings: logError
        }
        this.createProtocol();
      }

      if (e.invalidParameter) {
        this.sendInvalidParameter(e.invalidParameter, e.invalidParameterMsg);
        if (restart) { 
          this.invalidParameter = e.invalidParameter;
          this.invalidParameterMsg = e.invalidParameterMsg;
        }
        return false;
      } else {
        self.errorHandler(e);
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
    var msg = {
      type: 'new data',
      protocol: this.protocol,
      t: this.t,
      lastSendT: this.lastSendT,
      isFirstData: this.isFirstData
    };
    this.isFirstData = false;

    var toTransfer = this.protocol.makeTransferable();

    this.nextSendTime += this.settings.sendInterval;
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
            self.postMessage({
              type: 'error',
              error: {
                message: 'Unknown command: ' + msg.data.command
              }
            });
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
