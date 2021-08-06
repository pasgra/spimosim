'use strict';

(function () {
  function cE(type) {
    return document.createElement(type);
  }

  function UpdateAlgorithms(config, controls) {
    spimosimUi.EventAttacher.call(this);
    spimosimUi.ControlsAddOn.call(this, config, controls, 'update-algorithms', 'Update Algorithm');
  }
  UpdateAlgorithms.prototype = Object.create(spimosimUi.ControlsAddOn.prototype);
  
  UpdateAlgorithms.prototype.hasGui = function () {
    return true;
  };

  UpdateAlgorithms.prototype.initGui = function () {
    var texts = [];
    var values = [];
    for (var name in this.config) {
      if (this.config.hasOwnProperty(name)) {
        texts.push(this.config[name]);
        values.push(name);
      }
    }

    var updateAlgorithmDiv = cE('div');
    
    this.domCache = {};
    this.domCache.input = graphicTools.createSettings({
      updateAlgorithm: {
        type: 'radio',
        texts: texts,
        values: values,
        syncURI: true,
        key: '*'
      }
    }, updateAlgorithmDiv, this.keyMap)["updateAlgorithm"];
    
    this.domCache["updateAlgorithmDiv"] = updateAlgorithmDiv;

    var controls = this.controls;
    this.attachEventListener({
      dispatcher: this.domCache.input,
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

  UpdateAlgorithms.prototype.getMainElement = function () {
    return this.domCache.updateAlgorithmDiv;
  }

  UpdateAlgorithms.prototype.getValue = function (settings, autoStart) {
    return this.domCache.input.getValue();
  }

  spimosimCore.modules.add('ControlsAddOn', {
    files: [ 'lib/modules/ControlsAddOn/update-algorithms.js' ],
    name: 'updateAlgorithms',
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Adds radio buttons to the controls section to select an algorithm.',
    date: '2020-03-26'
  }, UpdateAlgorithms);
}());

