'use strict';

(function () {
  function cE(type) {
    return document.createElement(type);
  }

  function UpdateAlgorithms(config, controls) {
    spimosimUi.EventAttacher.call(this);
    spimosimUi.ControlsAddOn.call(this, config, controls, 'network-settings', 'Network');
  }
  UpdateAlgorithms.prototype = Object.create(spimosimUi.ControlsAddOn.prototype);

  UpdateAlgorithms.prototype.hasGui = function () {
    return true;
  };

  UpdateAlgorithms.prototype.initGui = function () {
    /* Update algorithm settings */
    var config = this.controls.modelConfig.controls.updateAlgorithms;

    var texts = [];
    var values = [];
    for (var name in config) {
      if (config.hasOwnProperty(name)) {
        texts.push(config[name]);
        values.push(name);
      }
    }

    var updateAlgorithmDiv = cE('div');

    var updateAlgorithmHeading = cE('h3');
    updateAlgorithmHeading.textContent = 'Update algorithm';
    updateAlgorithmDiv.appendChild(updateAlgorithmHeading);
    
    this.domCache = {};
    this.domCache.input = graphicTools.createSettings({
      updateAlgorithm: {
        type: 'radio',
        texts: texts,
        values: values,
        syncURI: true,
        key: '*'
      }
    }, updateAlgorithmsDiv, this.keyMap);

    var controls = this.controls;
    this.attachEventListener({
      dispatcher: allSettings.updateAlgorithm,
      type: 'change',
      callback: function () {
        controls.restartOrUpdateSettings('settings')
      }
    });

    return updateAlgorithmDiv;
  }
  
  UpdateAlgorithms.prototype.hasValue = function () {
    return true;
  }

  UpdateAlgorithms.prototype.getValue = function (settings, autoStart) {
    return this.domCache.input.getValue();
  }

  spimosimCore.modules.add('ControlsAddOn', 'updateAlgorithms', UpdateAlgorithms);
}());

