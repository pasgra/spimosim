'use strict';

(function () {
  var Protocol = spimosimCore.Protocol,
    spinArrayConverter = spimosimCore.spinArrayConverter;

  function SimulationServerBackend(simulationFrontend, backendSettings) {
    this.backendSettings = backendSettings;
    backendSettings.ENDIAN = tools.ENDIAN;

    this.connection = new WebSocket(backendSettings.url, []);
    this.connection.binaryType = 'arraybuffer';
    this.pendingMessages = [];
    
    this.connection.addEventListener('error', function (e) {
      simulationFrontend.setError(e);
    });

    var backend = this;
    this.connection.addEventListener('message', function (msg) {
      var data;
      if (typeof msg.data === 'string') {
        data = JSON.parse(msg.data);
      } else {
        var binData32 = new Uint32Array(msg.data, 0, msg.data.byteLength >> 2);
        var n = binData32[0];
        var buffers = [];
        var pos = 4 * n + 4;
        for (var i = 0; i < n; i++) {
          var len = binData32[i + 1];
          buffers.push(msg.data.slice(pos, pos + len));
          pos += len;
        }

        var str = String.fromCharCode.apply(null, new Uint16Array(msg.data.slice(pos)));
        data = JSON.parse(str);
      }
      
      switch (data.type) {
        case 'new data':
          var protocol = new Protocol(backend.backendSettings.protocol.varsConfig, data.lastSendT + 1);
          var tMax = data.t;
          if (data.replace !== undefined) {
            var varNames = data.replace;
            var len = varNames.length;
            var counter = 0;
            for (var t = data.lastSendT + 1; t <= tMax; t++) {
              for (var i = 0; i < len; i++) {
                data.protocol[t][varNames[i]] = buffers[counter++];
              }
            }
          }

          for (var t = data.lastSendT + 1; t <= tMax; t++) {
            if (data.protocol[t]) {
              protocol.set(t, data.protocol[t]);
            }
          }
          simulationFrontend.setNewData(tMax, protocol, data.isFirstData);
          break;
        case 'request backend objects':
          var data = JSON.parse(msg.data.slice(3));
          simulationFrontend.setBackendObjects(data.objects);
          break;
        case 'done':
          simulationFrontend.setDone();
          break;
        case 'invalid parameter':
          var data = JSON.parse(msg.data.slice(3));
          simulationFrontend.setInvalidParameter(data.invalidParameter, data.invalidParameterMsg);
          break;
        default:
          throw 'Received unknown message from server.';
      }
    });
    
    this.closeListener = function (msg) {
      simulationFrontend.setError('Connection lost.');
    }
    this.connection.addEventListener('close', this.closeListener);
  }

  SimulationServerBackend.prototype.send = function (msg) {
    this.pendingMessages.push(msg);
    this.sendNext();
  }
  SimulationServerBackend.prototype.sendNext = function () {
    if (this.connection.readyState === 1 && this.pendingMessages.length > 0) {
      this.connection.send(this.pendingMessages.shift());
    }
    
    if (this.pendingMessages.length > 0) {
      var backend = this;
      setTimeout(function () {
        backend.sendNext();
      });
    }
  };

  SimulationServerBackend.prototype.resume = function () {
    this.send('{"command": "resume"}');
  };

  SimulationServerBackend.prototype.destroy = function () {
    this.connection.removeEventListener('close', this.closeListener);
    this.connection.close();
  };

  SimulationServerBackend.prototype.requestObjects = function (names) {
    this.send(JSON.stringify({command:'request objects', names: names}));
  };

  SimulationServerBackend.prototype.pause = function () {
    this.send('{"command": "pause"}');
  };

  SimulationServerBackend.prototype.changeBackendSettings = function (backendSettings, resume) {
    this.backendSettings = backendSettings;
    backendSettings.ENDIAN = tools.ENDIAN;
    this.send(JSON.stringify({
      command: 'change backend settings',
      settings: backendSettings,
      resume: resume
    }));
  };

  SimulationServerBackend.prototype.changeModelSettings = function (modelSettings, restart) {
    this.modelSettings = modelSettings;
    this.send(JSON.stringify({
      command: 'change model settings',
      modelSettings: modelSettings,
      restart: restart
    }));
  };

  spimosimCore.modules.add('SimulationBackend', 'server', SimulationServerBackend);
})();
