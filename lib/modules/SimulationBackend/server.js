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

    var textDecoder = new TextDecoder("utf-16");
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

        var str = textDecoder.decode(new Uint16Array(msg.data.slice(pos)));
        data = JSON.parse(str);
      }
      
      switch (data.type) {
        case 'new data':
          var tMax = data.t;
          var counter = 0;
          if (data.replace !== undefined) {
            var varNames = data.replace;
            var len = varNames.length;
            for (var t = data.lastSendT + 1; t <= tMax; t++) {
              for (var i = 0; i < len; i++) {
                var protocolVar = data.protocol.vars[varNames[i]];
                protocolVar.data[t - protocolVar.tMin] = buffers[counter++];
              }
            }
          }

          if (data.replaceTimeSeries !== undefined) {
            var varNames = data.replaceTimeSeries;
            var len = varNames.length;
            for (var i = 0; i < len; i++) {
              data.protocol.vars[varNames[i]].data = buffers[counter++];
            }
          }

          simulationFrontend.setNewData(tMax, data.protocol, data.isFirstData);
          break;
        case 'backend event':
          var data = JSON.parse(msg.data);
          simulationFrontend.setBackendEvent(data.objects);
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

  spimosimCore.modules.add('SimulationBackend', {
    name: 'server',
    files: [ 'lib/modules/SimulationBackend/server.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A simulation backend running on a seperate server communicating via a websocket.',
    date: '2020-03-26'
  }, SimulationServerBackend);
})();
