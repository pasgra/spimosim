'use strict';

(function () {
  function cE(type) {
    return document.createElement(type);
  }

  function NetworkUi(config, controls) {
    spimosimUi.EventAttacher.call(this);
    spimosimUi.ControlsAddOn.call(this, config, controls, 'network-settings', 'Network');
  }
  NetworkUi.prototype = Object.create(spimosimUi.ControlsAddOn.prototype);

  NetworkUi.prototype.preprocessorConfig = {
    'Network': {},
    'NetworkUi': {}
  };

  NetworkUi.prototype.hasGui = function () {
    return true;
  };

  NetworkUi.prototype.initGui = function () {
    var networkSettings = cE('div');

    var networkTypeSetting;
    var networkTypes = this.controls.modelConfig.controls.network.types;
    this.networkParameterConfig = {};
    
    var texts = [];
    var values = [];

    for (var i = 0, len = networkTypes.length; i < len; i++) {
      var name, config;
      
      if (networkTypes[i].name === undefined) {
        name = networkTypes[i];
      } else {
        name = networkTypes[i].name;
      }

      config = spimosimCore.modules.get('NetworkUi', name);

      config = {
        parameters: tools.copyInto(config.parameters, {}),
        labelText: config.labelText,
        getVideoSettings: config.getVideoSettings
      };

      if (networkTypes[i].parameters !== undefined) {
        config.parameters = tools.copyInto(networkTypes[i].parameters, config.parameters);
      }
      
      if (networkTypes[i].labelText !== undefined) {
        config.labelText = networkTypes[i].labelText;
      }

      values.push(name);
      texts.push(config.labelText);
      
      this.networkParameterConfig[name] = config;
    }


    if (values.length === 1) {
      this.networkType = values[0];
      networkTypeSetting = cE('div');
      var pNetworkType = cE('div');
      pNetworkType.textContent = this.networkParameterConfig[this.networkType].labelText;
      pNetworkType.className = 'fix-network-type';
      
      networkTypeSetting.appendChild(pNetworkType);
      networkSettings.appendChild(networkTypeSetting);
    } else {
      networkTypeSetting = graphicTools.createSetting({
        type: 'radio',
        name: 'network-type',
        values: values,
        texts: texts,
        syncURI: true
      });

      this.keyMap['#'] = networkTypeSetting;

      networkSettings.appendChild(networkTypeSetting.domElement);

      this.networkType = networkTypeSetting.getValue();
      
      var networkUi = this;
      var controls = this.controls;
      this.attachEventListener({
        dispatcher: networkTypeSetting,
        type: 'change',
        callback: function (e) {
          networkUi.networkType = networkTypeSetting.getValue();
          graphicTools.removeAllChildNodes(divNetworkParameters);
          networkUi.updateNetworkType();
          controls.restartOrUpdateSettings('settings');
        }
      });
    }

    var divNetworkParameters = cE('div');
    networkSettings.appendChild(divNetworkParameters);

    this.domCache.divNetworkParameters = divNetworkParameters;

    this.updateNetworkType();

    return networkSettings;
  }
  
  NetworkUi.prototype.updateNetworkType = function () {
    var parameters = this.networkParameterConfig[this.networkType].parameters;
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name)) {
        graphicTools.removeUriFragmentQuery(name);
      }
    }

    var inputsNetworkParameters = graphicTools.createSettings(this.networkParameterConfig[this.networkType].parameters, this.domCache.divNetworkParameters, this.keyMap);

    if (Object.keys(inputsNetworkParameters).length === 0) {
      this.domCache.divNetworkParameters.style.display= 'none';
    } else {
      this.domCache.divNetworkParameters.style.display = '';
    }

    this.domCache.inputsNetworkParameters = inputsNetworkParameters;
    
    var addEventListeners = this.networkParameterConfig[this.networkType].addEventListeners;

    if (addEventListeners) {
      addEventListeners(this);
    }

    var controls = this.controls;
    for (var name in inputsNetworkParameters) {
      if (inputsNetworkParameters.hasOwnProperty(name)) {
        inputsNetworkParameters[name].addEventListener('change', function (e) {
          controls.restartOrUpdateSettings('settings');
        });
      }
    }
  }
  
  NetworkUi.prototype.hasValue = function () {
    return true;
  }

  NetworkUi.prototype.getValue = function (settings, autoStart) {
    var settings = {
      type: this.networkType
    };

    for (var name in this.domCache.inputsNetworkParameters) {
      if (this.domCache.inputsNetworkParameters.hasOwnProperty(name)) {
        var value = this.domCache.inputsNetworkParameters[name].getValue();
        settings[name] = value;
      }
    }
    
    return settings;
  }

  spimosimCore.modules.add('ControlsAddOn', {
    name: 'network',
    files: [],
    depends: [ 'lib:spimosimNetworkUi' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Controls for the network config.',
    date: '2020-03-26'
  }, NetworkUi);
  
  spimosimCore.modules.newRegister('NetworkUi');

  spimosimCore.modules.add('SettingsPreprocessor', {
    name: 'NetworkUi',
    files: [],
    depends: [ 'lib:spimosimNetwork' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A settings preprocessor for the network config UI lib.',
    date: '2020-03-26'
  }, function (oldModelSettings, newModelSettings) {
    var videoSettings = spimosimCore.modules.get('NetworkUi', newModelSettings.network.type).getVideoSettings(newModelSettings);
    if (newModelSettings.video !== undefined) {
      tools.copyInto(videoSettings, newModelSettings.video);
    } else {
      newModelSettings.video = videoSettings;
    }
  });
}());
