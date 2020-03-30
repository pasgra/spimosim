/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('VarInitializer', {
    name: 'copy',
    files: [ 'lib/modules/VarInitializer/copy.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Copies the state from the last simulation.',
    date: '2020-03-26'
  }, spimosimUi.VarInitializer,
  {
    customConstructor: function (config, controls, varName) {
      if (config.gui) {
        this.gui = true;
      } else {
        this.gui = false;
        this.value = (config.value !== false);
      }
      spimosimUi.VarInitializer.call(this, config, controls, varName);
      this.name  = 'reuse-' + varName;
    },

    hasGui: function () {
      return this.config.gui;
    },

    getValue: function (modelSettings) {
      if (modelSettings.varsCopied === undefined) {
        modelSettings.varsCopied = [];
      }
      modelSettings.varsCopied.push(this.varName);
      
      var initializer = this.controls.initializer;
      return initializer.simulation.protocol.get(this.varName, initializer.clock.getT());
    },
    
    hasValue: function (newSettings, automaticStart) {
      if (!automaticStart || (this.gui ? !this.domCache.setting.getValue() : !this.value) || !this.controls.initializer.simulation) {
        return false;
      }
      var oldSettings = this.controls.initializer.simulation.modelSettings;
      if (oldSettings === undefined || !newSettings.continuable) {
        return false;
      }

      try {
        var initializer = this.controls.initializer;
        initializer.simulation.protocol.get(this.varName, initializer.clock.getT());
      } catch (e) {
        if (e === 'Unknown frame') {
          return false;
        } else {
          throw e;
        }
      }

      return true;
    },

    initGui: function () {
      var config = this.config,
        name = this.name,
        varName = this.varName,
        controls = this.controls;


      var newConfig = {
        labelText: 'Reuse old state when changing settings',
        name: name,
        value: ('value' in config) ? config.value : false,
        type: 'checkbox',
        syncUri: true
      };

      var setting = graphicTools.createSetting(newConfig);
      this.domCache.setting = setting;

      if (config.key) {
        this.keyMap[config.key] = setting;
      }

      return setting.domElement;
    }
  });
