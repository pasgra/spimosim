'use strict';

window.spimosimCreator = (function() {
  spimosimCore.modules.newRegister("creator-lib-info");
  spimosimCore.modules.newRegister("creator-module-templates");
  
  var javascriptDataUrl = "data:text/javascript,";

  function getLibInfo(name) {
    return spimosimCore.modules.get("creator-lib-info", name);
  }

  function getModuleTemplates(name) {
    return spimosimCore.modules.get("creator-module-templates", name);
  }

  function cE(name) {
    return document.createElement(name);
  }

  function Creator(divConfig, divPreview) {
    spimosimUi.EventAttacher.call(this);
    this.noCounter = {
      plotter: 1,
      video: 1
    };

    this.initializer = {
      sections: {
        plotter: [],
        video: []
      }
    };

    graphicTools.SearchURL.pauseStateReplacing = true;
    this.initGui(divConfig, divPreview);
    graphicTools.SearchURL.pauseStateReplacing = false;
    graphicTools.SearchURL.location.replaceState();
    
    this.initializer = new spimosimUi.Initializer(this.initializer.sections);

    this.previewConfig = this.parseConfig();
    this.domCache.spanHeadingModelName.textContent = this.previewConfig.info.title;
  }

  Creator.prototype = Object.create(spimosimUi.EventAttacher.prototype);

  Creator.prototype.initGui = function (divConfig, divPreview) {
    var divPreviewTools = cE('div');
    divPreviewTools.className = 'preview-tools';
    var divPreviewModel = cE('div');

    divPreview.appendChild(divPreviewTools);
    divPreview.appendChild(divPreviewModel);
    
    var creator = this;
    
    this.domCache = {
      divConfig: divConfig,
      divPreview: divPreview,
      divPreviewTools: divPreviewTools,
      divPreviewModel: divPreviewModel
    };
    
    var headingModel = cE('h1');
    headingModel.id = 'headingModel0';
    headingModel.classList.add('model-heading');
    headingModel.classList.add('preview-heading');

    var iPreview = cE('i');
    iPreview.textContent = 'Preview:\u00A0';
    headingModel.appendChild(iPreview);
    this.domCache.headingModel = headingModel;

    var spanHeadingModelName = cE('span');
    headingModel.appendChild(spanHeadingModelName);
    this.domCache.spanHeadingModelName = spanHeadingModelName;
    
    var main = cE('div');
    main.className = 'main';
    this.domCache.main = main;
    
    this.createSections();
   
    var divPreviewError = cE('div');
    divPreviewError.className = 'preview-error';
    divPreviewError.style.display = 'none';
    divPreviewTools.appendChild(divPreviewError);

    var aPreviewErrorLine = cE('a');
    aPreviewErrorLine.href = "#";
    divPreviewError.appendChild(aPreviewErrorLine);
    
    var divPreviewErrorMessage = cE('div');
    divPreviewError.appendChild(divPreviewErrorMessage);
    
    this.domCache.previewError = {
      container: divPreviewError,
      line: aPreviewErrorLine,
      message: divPreviewErrorMessage
    };
    
    var divNewSection = cE('div');
    divNewSection.classList.add('settings');
    divNewSection.classList.add('new-section');

    var sectionTypeConfig = graphicTools.createSetting({
      type: 'select',
      labelText: 'New section',
      texts: [ 'Info', 'Help', 'Controls', 'Video', 'Plotter', 'Downloads' ],
      values: [ 'info', 'help', 'controls', 'video', 'plotter', 'downloads' ],
      syncURI: true
    });

    divNewSection.appendChild(sectionTypeConfig.domElement);
    this.domCache.sectionTypeConfig = sectionTypeConfig;
    this.updateSectionTypeConfig();

    var buttonAddSection = cE('button');
    buttonAddSection.textContent = 'OK';
    sectionTypeConfig.domElement.appendChild(buttonAddSection);

    var creator = this;
    this.attachEventListeners([
      {
        dispatcher: buttonAddSection,
        type: 'click',
        callback: function () {
          creator.createSection(sectionTypeConfig.getValue());
          creator.updateSectionTypeConfig();
          creator.updatePreview();
        },
      },
      {
        dispatcher: aPreviewErrorLine,
        type: 'click',
        callback: function () {
          creator.jumpToError();
        }
      }
    ]);
    
    var divButtonsPreview = cE('div');
    divButtonsPreview.className = 'preview-buttons';
    divPreviewTools.appendChild(divButtonsPreview);
    
    var buttonUpdatePreview = cE('button');
    buttonUpdatePreview.textContent = 'Update preview';
    buttonUpdatePreview.className = 'update-preview';
    divButtonsPreview.appendChild(buttonUpdatePreview);

    this.attachEventListener({
      dispatcher: buttonUpdatePreview,
      type: 'click',
      callback: function () {
        creator.updatePreview();
      }
    });
    
    var buttonModelMenu= cE('button');
    buttonModelMenu.textContent = 'Menu';
    buttonModelMenu.className = 'model-menu-button';
    divButtonsPreview.appendChild(buttonModelMenu);
    
    this.attachEventListener({
      dispatcher: buttonModelMenu,
      type: 'click',
      callback: function () {
        creator.toggleShowModelMenu();
      }
    });

    var divImportExport = cE('div');
    this.domCache.divImportExport = divImportExport;
    divImportExport.className = "import-export corner-menu corner-menu-expanded";
    divImportExport.style.display = "none";
    divPreviewTools.appendChild(divImportExport);
    
    var headingExport = cE('h3');
    headingExport.textContent = "Save or Export";
    divImportExport.appendChild(headingExport);
    
    var divExport = cE('div');
    divImportExport.appendChild(divExport);
    
    var buttonDownloadCode = cE('button');
    buttonDownloadCode.textContent = 'Download code';
    buttonDownloadCode.className = 'download';
    divExport.appendChild(buttonDownloadCode);
    
    var buttonDownloadProject = cE('button');
    buttonDownloadProject.textContent = 'Download project';
    divExport.appendChild(buttonDownloadProject);
 
    var buttonSaveInBrowser = cE('button');
    buttonSaveInBrowser.textContent = 'Save in browser';
    divExport.appendChild(buttonSaveInBrowser);

    var headingImport = cE('h3');
    headingImport.textContent = "Import or load";
    divImportExport.appendChild(headingImport);
    
    var divImport = cE('div');
    this.domCache.divImport = divImport;
    divImport.className = "settings";
    divImportExport.appendChild(divImport);
    
    var buttonLoadFromBrowser = cE('button');
    buttonLoadFromBrowser.textContent = 'Load';
    divImport.appendChild(buttonLoadFromBrowser);

    var buttonDeleteFromBrowser = cE('button');
    buttonDeleteFromBrowser.textContent = 'Delete';
    divImport.appendChild(buttonDeleteFromBrowser);

    var divImportFile = cE('div');
    this.domCache.divImportFile = divImportFile;
    divImportFile.className = "settings";
    divImportExport.appendChild(divImportFile);

    var fileImportProject = graphicTools.createSetting({
      name: "file-import-project",
      labelText: "Open project file",
      type: "file"
    });
    this.domCache.fileImportProject = fileImportProject;
    divImportFile.appendChild(fileImportProject.domElement)

    this.attachEventListeners([
      {
        dispatcher: buttonDeleteFromBrowser,
        type: 'click',
        callback: function () {
          creator.deleteSelectedProjectFromBrowser();
        }
      },
      {
        dispatcher: buttonDownloadCode,
        type: 'click',
        callback: function () {
          creator.toggleShowModelMenu();
          creator.download();
        }
      },
      {
        dispatcher: buttonDownloadProject,
        type: 'click',
        callback: function () {
          creator.toggleShowModelMenu();
          creator.downloadProject();
        }
      },
      {
        dispatcher: buttonSaveInBrowser,
        type: 'click',
        callback: function () {
          creator.toggleShowModelMenu();
          creator.saveInBrowser();
        }
      },
      {
        dispatcher: buttonLoadFromBrowser,
        type: 'click',
        callback: function () {
          creator.toggleShowModelMenu();
          creator.loadSelectedProjectFromBrowser();
        }
      },
      {
        dispatcher: fileImportProject,
        type: 'change',
        callback: function (e) {
          creator.toggleShowModelMenu();
          creator.loadSelectedProjectFromFile();
        }
      }
    ]);

    this.updateSavedProjectsInBrowser();
    
    divPreviewTools.appendChild(divNewSection);
    
    divPreviewModel.appendChild(headingModel);
    divPreviewModel.appendChild(main);
    
    var divFooter = cE('div');
    this.domCache.divFooter = divFooter;
    divPreviewModel.appendChild(divFooter);
    
    this.initTabGui();

    var mainConfigTab = cE('div');
    mainConfigTab.className = 'creator-tab';
    this.domCache.mainConfigTab = mainConfigTab;
    divConfig.appendChild(mainConfigTab);
    this.newTab("Model", mainConfigTab);

    var headingConfig = cE('h1');
    headingConfig.className = 'config-heading';
    headingConfig.textContent = 'Configuration'
    this.domCache.headingConfig = headingConfig;
    mainConfigTab.appendChild(headingConfig);
    
    var headingGeneralConfig = cE('h2');
    headingGeneralConfig.textContent = 'General configuration';
    mainConfigTab.appendChild(headingGeneralConfig);
    
    this.domCache.headingGeneralConfig = headingGeneralConfig;

    var divGeneralConfig = cE('div');
    divGeneralConfig.className = 'settings';
    mainConfigTab.appendChild(divGeneralConfig);
    
    this.domCache.configGeneral = graphicTools.createSettings({
      title: {
        type: 'string',
        labelText: 'Model name',
        value: 'Dummy',
        syncURI: true
      },
      description: {
        type: 'text',
        labelText: 'Description',
        value: 'My dummy model',
        syncURI: true
      },
      enableNetworkLib: {
        type: 'checkbox',
        labelText: 'Enable network library',
        value: false,
        syncURI: true
      },
      generalAdvanced: {
        type: 'checkbox',
        labelText: 'Enable advanced mode',
        value: false,
        syncURI: true
      },
      url: {
        type: 'string',
        labelText: 'URL for model info text',
        value: 'model-info.html',
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      iconUrl: {
        type: 'string',
        labelText: 'URL to directory containing all icons',
        value: '../lib/spimosimUi/icon/',
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      helpTextId: {
        type: 'select',
        labelText: 'Help text ID',
        values: [ undefined ].concat(spimosimCore.modules.list('HelpTextGenerator')),
        texts: [ 'default' ].concat(spimosimCore.modules.list('HelpTextGenerator')),
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      movableSections: {
        type: 'checkbox',
        labelText: 'Sections can be moved via drag and drop',
        value: true,
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      configureClock: {
        type: 'checkbox',
        labelText: 'Configure clock',
        value: false,
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      continuableWithNewSettings: {
        type: 'checkbox',
        labelText: 'Simulation is continuable with new settings',
        value: false,
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      colorSet: {
        labelText: 'Color set',
        rows: 3,
        value: '{}',
        type: 'text',
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      simulationBackendType: {
        type: 'select',
        labelText: 'Simulation backend type',
        value: 'webworker',
        values: [ 'webworker', 'synchronous', 'server' ],
        texts: [ 'Webworker', 'Synchronous', 'Server' ],
        parent: 'generalAdvanced',
        parentValue: true,
        syncURI: true
      },
      simulationBackendWorkerUrl: {
        type: 'string',
        labelText: 'Simulation backend webworker URL',
        value: '../lib/modules/SimulationBackend/webworker.worker.js',
        parent: 'simulationBackendType',
        parentValue: 'webworker',
        syncURI: true
      },
      simulationBackendModuleUrls: {
        type: 'text',
        labelText: 'Simulation backend module URLs',
        rows: 4,
        disabled: true,
        value: '',
        parent: 'simulationBackendType',
        parentValue: 'webworker'
      },
      simulationBackendAdditionalUrls: {
        type: 'text',
        labelText: 'Simulation backend additional URLs',
        rows: 4,
        value: '',
        parent: 'simulationBackendType',
        parentValue: 'webworker',
        syncURI: true
      },
      simulationBackendServerUrl: {
        type: 'string',
        labelText: 'Server backend URL',
        value: 'ws://127.0.0.1:8090',
        parent: 'simulationBackendType',
        parentValue: 'server',
        syncURI: true
      },
    }, divGeneralConfig);
    

    var advancedConfigs = [ "url", "iconUrl", "helpTextId", "movableSections", "configureClock", "continuableWithNewSettings", "colorSet", "simulationBackendType", "simulationBackendWorkerUrl", "simulationBackendWorkerUrl", "simulationBackendServerUrl", "simulationBackendModuleUrls", "simulationBackendAdditionalUrls" ];
    for (var i = 0; i < advancedConfigs.length; i++) {
      this.domCache.configGeneral[advancedConfigs[i]].domElement.classList.add("creator-advanced");
    }
    
    this.attachEventListeners([
      {
        dispatcher: this.domCache.configGeneral.generalAdvanced,
        type: "change",
        callback: function (value) {
          creator.updateAdvancedMode(true);
          creator.updateCodeSettings();
        }
      },
      {
        dispatcher: this.domCache.configGeneral.title,
        type: 'change',
        callback: function () {
          creator.updateSnippetElements();
        }
      },
      {
        dispatcher: this.domCache.configGeneral.enableNetworkLib,
        type: 'change',
        callback: function () {
          creator.updateEnableNetworkLib();
          creator.updateModuleLibs();
        }
      },
      {
        dispatcher: this.domCache.configGeneral.configureClock,
        type: 'change',
        callback: function () {
          creator.updateConfigureClock();
        },
      },
      {
        dispatcher: this.domCache.configGeneral.simulationBackendType,
        type: 'change',
        callback: function () {
          creator.updateEditCode();
        }
      }
    ]);

    this.domCache.configGeneral.simulationBackendType.dispatchEvent('visibility');


    var headingParametersConfig = cE('h2');
    headingParametersConfig.textContent = 'Parameter configuration';
    mainConfigTab.appendChild(headingParametersConfig);
    this.domCache.headingParametersConfig = headingParametersConfig;

    var divParametersConfig = cE('div');
    divParametersConfig.className = 'settings';
    mainConfigTab.appendChild(divParametersConfig);
    
    this.domCache.configParameters = graphicTools.createSettings({
      numberOfParameters: {
        labelText: '#Parameters',
        type: 'number',
        min: 0,
        value: 0,
        syncURI: true
      },
    }, divParametersConfig);
    
    this.attachEventListener({
      dispatcher: this.domCache.configParameters.numberOfParameters,
      type: 'change',
      callback: function () {
        creator.updateParameterCount();
      }
    });


    this.domCache.configParameter = [];
    this.domCache.divParametersConfig = divParametersConfig;


    var headingStateVarConfig = cE('h2');
    headingStateVarConfig.textContent = 'State variable configuration';
    mainConfigTab.appendChild(headingStateVarConfig);
    this.domCache.headingStateVarConfig = headingStateVarConfig;

    var divStateVarConfig = cE('div');
    divStateVarConfig.className = 'settings';
    mainConfigTab.appendChild(divStateVarConfig);
    
    this.domCache.configStateVars = graphicTools.createSettings({
      numberOfStateVars: {
        labelText: '#State variables',
        type: 'number',
        min: 0,
        value: 0,
        syncURI: true
      },
    }, divStateVarConfig);
    
    this.attachEventListener({
      dispatcher: this.domCache.configStateVars.numberOfStateVars,
      type: 'change',
      callback: function () {
        creator.updateStateVarCount();
      }
    });

    this.domCache.configStateVar = [];
    
    this.domCache.divStateVarConfig = divStateVarConfig;
   
    this.updateStateVarCount();
    
    
    
    var headingVideoConfig = cE('h2');
    headingVideoConfig.textContent = 'Video configuration';
    mainConfigTab.appendChild(headingVideoConfig);
    this.domCache.headingVideoConfig = headingVideoConfig;

    var divVideoConfig = cE('div');
    divVideoConfig.className = 'settings';
    mainConfigTab.appendChild(divVideoConfig);
    
    var configVideo = graphicTools.createSettings({
      createDrawModes: {
        labelText: 'Draw modes',
        type: 'select',
        values: [ 'custom canvas', 'spins and flips', 'int map', 'grey scale spins', 'weighted spins', 'custom' ],
        texts: [ 'Custom canvas draw mode', 'Network nodes: 1 bit spins', 'Network nodes: Integer values', 'Network nodes: Float values (grey scale)', 'Network nodes: Float values (sign destinction with color)', 'Other/Manual config' ],
        value: 'custom canvas',
        syncURI: true
      },
      customCanvasModeNames: {
        labelText: 'Draw mode names (1 per line)',
        type: 'text',
        rows: 2,
        value: 'default draw mode',
        parent: 'createDrawModes',
        parentValue: [ 'spins and flips', 'int map', 'grey scale spins', 'weighted spins' ],
        syncURI: true
      },
      customCanvasCode: {
        labelText: 'Code of a function fn(colorSet) to create draw modes. Fn returns an array of functions [ function drawMode(context, protocol, time), ... ]',
        type: 'text',
        rows: 10,
        value: 'var mainColor = colorSet.strColorSet.THEME_MAIN;\nfunction draw(ctx, protocol, t) {\n  ctx.fillStyle = mainColor;\n}\nreturn [ draw ];',
        parent: 'createDrawModes',
        parentValue: 'custom canvas',
        syncURI: true
      },
      varNames: {
        labelText: 'Variable names of the shown array (1 per line)',
        rows: 2,
        value: 'var0',
        type: 'text',
        parent: 'createDrawModes',
        parentValue: [ 'custom canvas', 'spins and flips', 'int map', 'grey scale spins', 'weighted spins' ],
        syncURI: true
      },
      minValues: {
        labelText: 'Minimal possible values for the variables listed above (1 per line)',
        rows: 2,
        value: '-1',
        type: 'text',
        parent: 'createDrawModes',
        parentValue: [ 'int map', 'grey scale spins', 'weighted spins' ],
        syncURI: true
      },
      maxValues: {
        labelText: 'Maximal possible values for the variables listed above (1 per line)',
        rows: 2,
        value: '1',
        type: 'text',
        parent: 'createDrawModes',
        parentValue: [ 'grey scale spins', 'weighted spins' ],
        syncURI: true
      },
      customJSONConfig: {
        labelText: 'JSON config for draw mode',
        rows: 5,
        value: '{\n\n}',
        type: 'text',
        parent: 'createDrawModes',
        parentValue: 'custom',
        syncURI: true
      },
      customDrawMode: {
        labelText: 'drawMode',
        texts: spimosimCore.modules.list("createDrawModes"),
        values: spimosimCore.modules.list("createDrawModes"),
        type: 'select',
        parent: 'createDrawModes',
        parentValue: 'custom',
        syncURI: true
      }
    }, divVideoConfig);

    this.domCache.configVideo = configVideo;
    var headingCodeConfig = cE('h2');
    headingCodeConfig.textContent = 'Model code';
    mainConfigTab.appendChild(headingCodeConfig);
    this.domCache.headingCodeConfig = headingCodeConfig;

    var divCode = cE('div');
    divCode.classList.add('settings');
    divCode.classList.add('code-settings');
    mainConfigTab.appendChild(divCode);
    
    var divCodeConfig = cE('div');
    divCodeConfig.className = 'settings';
    mainConfigTab.appendChild(divCodeConfig);
    
    var configCode = graphicTools.createSettings({
      changeSettingsFunction: {
        labelText: 'ChangeSettings function',
        type: 'jscode',
        value: '//your changeSettings function',
        rows: 8,
        syncURI: true
      },
      stepFunction: {
        labelText: 'Step function',
        type: 'jscode',
        value: '//your step function',
        rows: 8,
        syncURI: true,
      },
      modelObjectName: {
        labelText: 'Model object name',
        type: 'string',
        value: 'Model',
        syncURI: true
      },
      editCompleteModelCode: {
        labelText: 'Edit complete code',
        type: 'checkbox',
        value: false,
        syncURI: true
      },
      modelCode: {
        labelText: 'Complete model code',
        type: 'jscode',
        value: '',
        rows: 20,
        syncURI: true
      }
    }, divCodeConfig, {}, this.domCache.configGeneral);
    
    this.domCache.configCode = configCode;

    var advancedConfigs = [ "editCompleteModelCode", "modelObjectName", "modelCode" ];
    for (var i = 0; i < advancedConfigs.length; i++) {
      configCode[advancedConfigs[i]].domElement.classList.add("creator-advanced");
    }

    var snippetElements = [ cE('pre'), cE('pre'), cE('pre') ];
    this.domCache.snippetElements = snippetElements;
    this.updateCodeSettings();

    divCode.appendChild(snippetElements[0]);
    divCode.appendChild(configCode.changeSettingsFunction.domElement);
    divCode.appendChild(snippetElements[1]);
    divCode.appendChild(configCode.stepFunction.domElement);
    divCode.appendChild(snippetElements[2]);
    
    this.attachEventListeners([
      {
        dispatcher: configCode.editCompleteModelCode,
        type: 'change',
        callback: function () {
          creator.updateCodeSettings();
        }
      },
      {
        dispatcher: configCode.modelObjectName,
        type: 'change',
        callback: function () {
          creator.updateSnippetElements();
        }
      }
    ]);
        
    
    configCode.stepFunction.domElement.classList.add('no-label');
    configCode.changeSettingsFunction.domElement.classList.add('no-label');
    configCode.modelCode.domElement.classList.add('no-label');

    this.domCache.divCode = divCode;

    this.updateEditCode();
    
    
    
    var divPlotter = cE('div');
    
    var headingPlotterConfig = cE('h2');
    headingPlotterConfig.textContent = 'Plotter configuration';
    divPlotter.appendChild(headingPlotterConfig);
    this.domCache.headingPlotterConfig = headingPlotterConfig;

    var divPlotterConfig = cE('div');
    divPlotterConfig.className = 'settings';
    divPlotter.appendChild(divPlotterConfig);
    
    var plotterConfigConfig = {
      plotTypes: {
        type: 'text',
        info: 'Additional plots show other data than the state variables. List all plots that should be available.',
        labelText: 'Plot types (1 per line)',
        rows: 6,
        value: '',
        syncURI: true
      },
      plotterBackendUrls: {
        type: 'text',
        labelText: 'Script URLs to load in backend webworker (1 per line)',
        rows: 2,
        value: '',
        syncURI: true
      }
    };
    var configPlotter = graphicTools.createSettings(plotterConfigConfig, divPlotterConfig);

    this.domCache.configPlotter = configPlotter;
    this.domCache.divPlotter = divPlotter;
    
    mainConfigTab.appendChild(divPlotter);

    
    
    var divNetwork = cE('div');
    
    var headingNetworkConfig = cE('h2');
    headingNetworkConfig.textContent = 'Network configuration';
    divNetwork.appendChild(headingNetworkConfig);
    this.domCache.headingNetworkConfig = headingNetworkConfig;

    var heading = cE('h3');
    heading.textContent = 'Active types';
    divNetwork.appendChild(heading);

    var divNetworkConfig = cE('div');
    divNetworkConfig.className = 'settings checkbox-line';
    divNetwork.appendChild(divNetworkConfig);
    
    this.domCache.divNetwork = divNetwork;
    this.domCache.divNetworkConfig = divNetworkConfig;
    this.domCache.configNetwork = {};
    
    this.initNetworkGui();
    this.updateEnableNetworkLib();
    
    
    var divClock = cE('div');
    
    var headingClockConfig = cE('h2');
    headingClockConfig.textContent = 'Clock configuration';
    divClock.appendChild(headingClockConfig);

    var divClockConfig = cE('div');
    divClockConfig.className = 'settings';
    divClock.appendChild(divClockConfig);
    
    var divBufferConfig = cE('div');
    divBufferConfig.className = 'settings buffer-config';
    divClock.appendChild(divBufferConfig);
    
    var headingBufferConfig = cE('h3');
    headingBufferConfig.textContent = 'Buffer';
    divBufferConfig.appendChild(headingBufferConfig);
    
    var clockConfigConfig = {
      endlessMode: {
        type: 'checkbox',
        labelText: 'Enable endless mode',
        value: true,
        syncURI: true
      },
      onSlowSimulation: {
        type: 'select',
        label: 'Action if the simulation is too slow',
        values: [ 'retard', 'ignore', 'slow down' ],
        texts: [ 'Retard: Wait a little', 'Ignore: Just show message "frame not simulated, yet"', 'Slow down: Wait and decrease FPS' ],
        value: 'retard',
        syncURI: true
      },
      defaultFps: {
        type: 'number',
        min: 1,
        max: 4000,
        step: 1,
        value: 30,
        name: 'defaultFps',
        labelText: 'default fps',
        logScale: true,
        syncURI: true
      }
    };
    
    var bufferConfigConfig = {
      clockTriggerValue: {
        type: 'number',
        min: 0,
        step: 'any',
        info: 'Continue simulation when the buffer gets smaller than',
        labelText: 'Value',
        value: '',
        syncURI: true
      },
      clockTriggerUnit: {
        type: 'select',
        labelText: 'Unit',
        value: 'seconds',
        values: [ 'seconds', 'steps' ],
        texts: [ 'seconds', 'steps' ],
        syncURI: true
      },
      clockInternalValue: {
        type: 'number',
        min: 0,
        step: 'any',
        info: 'How much to buffer at once',
        labelText: 'Value',
        value: '',
        syncURI: true
      },
      clockInternalUnit: {
        type: 'select',
        labelText: 'Unit',
        value: 'seconds',
        values: [ 'seconds', 'steps' ],
        texts: [ 'seconds', 'steps' ],
        syncURI: true
      },
      clockShownFutureValue: {
        type: 'number',
        min: 0,
        step: 'any',
        info: 'How much future is shown',
        labelText: 'Value',
        value: '',
        syncURI: true
      },
      clockShownFutureUnit: {
        type: 'select',
        labelText: 'Unit',
        value: 'seconds',
        values: [ 'seconds', 'steps' ],
        texts: [ 'seconds', 'steps' ],
        syncURI: true
      },
      clockShownHistoryValue: {
        type: 'number',
        min: 0,
        step: 'any',
        info: 'How much history is shown',
        labelText: 'Value',
        value: '',
        syncURI: true
      },
      clockShownHistoryUnit: {
        type: 'select',
        labelText: 'Unit',
        value: 'seconds',
        values: [ 'seconds', 'steps' ],
        texts: [ 'seconds', 'steps' ],
        syncURI: true
      }
    };
    
    var configClock = graphicTools.createSettings(clockConfigConfig, divClockConfig);
    graphicTools.createSettings(bufferConfigConfig, divBufferConfig, undefined, configClock);

    this.domCache.configClock = configClock;
    this.domCache.divClock = divClock;
    
    this.updateAdvancedMode();
    this.updateConfigureClock();
    this.updateModuleLibs(); 
    this.updateParameterCount();
    this.recreateModuleTabs();
  };

  Creator.prototype.updateAdvancedMode = function (withAnimation) {
    if (this.domCache.configGeneral.generalAdvanced.getValue()) {
      document.body.classList.add("advanced-mode");
      if (withAnimation) {
        document.body.classList.add("advanced-mode-new");
        setTimeout(function () {
          document.body.classList.remove("advanced-mode-new");
        }, 5000);
      }
    } else {
      document.body.classList.remove("advanced-mode");
    }
  }
  
  Creator.prototype.initTabGui = function () {
    var tabBar = cE('div');
    tabBar.className = 'creator-tab-bar';
    tabBar.classList.add('creator-advanced');
    this.domCache.tabBar = tabBar;
    this.domCache.divConfig.appendChild(tabBar);

    var newModuleButton = cE('button');
    newModuleButton.className = 'creator-tab-new-module';
    newModuleButton.classList.add('main-button');
    newModuleButton.textContent = 'New module';
    this.attachEventListener({
      dispatcher: newModuleButton,
      type: 'click',
      callback: function () {
        creator.newModule();
      }
    });
    tabBar.appendChild(newModuleButton);

    this.domCache.tabs = [];
    this.tabModuleUrls = [];
    this.tabErrorLinks = [];
    this.tabIndex = 0;

    this.attachEventListener({
      dispatcher: document.body,
      type: 'keypress',
      callback: function (event) {
        if (graphicTools.wasFiredOnInput(event))
          return;
        var len = creator.domCache.tabs.length;
        if (event.key === "<") {
          creator.tabIndex = (creator.tabIndex + len - 1) % len;
          creator.updateTabs()
        } else if (event.key === ">") {
          creator.tabIndex = (creator.tabIndex + 1) % len;
          creator.updateTabs()
        }
      }
    });
  }

  Creator.prototype.toggleShowModelMenu = function () {
    if (this.domCache.divImportExport.style.display === "none") {
      this.domCache.divImportExport.style.display = null;
    } else {
      this.domCache.divImportExport.style.display = "none";
    }
  }

  Creator.prototype.extractStateFromSearchURL = function () {
    var location = graphicTools.SearchURL.location;
    var fragmentNames = Object.getOwnPropertyNames(location.fragmentOptions).sort();
    var state = {};
    for (var i = 0, len = fragmentNames.length; i < len; i++) {
      var name = fragmentNames[i];
      var value = location.fragmentOptions[name];

      if (value !== undefined) {
        state[name] = value;
      }
    }

    return state;
  }

  Creator.prototype.saveInBrowser = function () {
    var savedProjects = this.getProjectsFromBrowser();
    savedProjects.push({
      state: this.extractStateFromSearchURL(),
      time: Date.now()
    });
    localStorage.setItem("spimosim-creator-projects", JSON.stringify(savedProjects));
    this.updateSavedProjectsInBrowser();
  }

  Creator.prototype.getProjectsFromBrowser = function () {
    return JSON.parse(localStorage.getItem("spimosim-creator-projects") || "[]");
  }

  Creator.prototype.updateSavedProjectsInBrowser = function () {
    var projects = this.getProjectsFromBrowser();
    var values = [];
    var texts = [];
    
    for (var i = 0; i < projects.length; i++) {
      values.push(i);
      var date = new Date(projects[i].time).toLocaleString();
      texts.push(date + ": " + projects[i].state.title);
    }

    if (this.domCache.projectToLoad) {
      this.domCache.projectToLoad.domElement.remove();
      this.domCache.projectToLoad.destroy();
    }

    this.domCache.projectToLoad = graphicTools.createSetting({
      name: "project-to-load",
      labelText: "Project saved in browser",
      type: "select",
      values: values,
      texts: texts
    });

    this.domCache.divImport.insertBefore(this.domCache.projectToLoad.domElement, this.domCache.divImport.firstChild);
  }

  Creator.prototype.loadSelectedProjectFromBrowser = function () {
    var index = this.domCache.projectToLoad.getValue();
    var project = creator.getProjectsFromBrowser()[index];
    graphicTools.SearchURL.location.fragmentOptions = project.state;
    this.reinit();
  }

  Creator.prototype.loadSelectedProjectFromFile = function () {
    var reader = new FileReader();
    var creator = this;
    reader.onload = function (e) {
      var str = e.target.result;
      var obj = JSON.parse(str);
      graphicTools.SearchURL.location.fragmentOptions = obj;
      creator.reinit();
    }
    reader.readAsText(this.domCache.fileImportProject.getValue()[0]);
  }
  
  Creator.prototype.deleteSelectedProjectFromBrowser = function () {
    var savedProjects = this.getProjectsFromBrowser();
    var index = this.domCache.projectToLoad.getValue();
    savedProjects = savedProjects.filter(function (value, i) {
      return index != i;
    });
    localStorage.setItem("spimosim-creator-projects", JSON.stringify(savedProjects));
    this.updateSavedProjectsInBrowser();
  }
  
  Creator.prototype.destroy = function () {
    spimosimUi.EventAttacher.prototype.destroy.call(this);
    graphicTools.removeAllChildNodes(this.domCache.divPreview);
    graphicTools.removeAllChildNodes(this.domCache.divConfig);
  };

  Creator.prototype.reinit = function () {
    this.destroy();
    spimosimCreator.call(this, this.domCache.divConfig, this.domCache.divPreview);
    this.loadModel();
  }

  Creator.prototype.downloadProject = function () {
    var json = JSON.stringify(this.extractStateFromSearchURL(), null, 2);
    graphicTools.startDownload("data:text/json," + encodeURIComponent(json), "spimosim-creator-project.json");
  }

  Creator.prototype.initNetworkGui = function () {
    for (var name in this.domCache.configNetwork) {
      if (this.domCache.configNetwork.hasOwnProperty(name)) {
        this.domCache.configNetwork[name].destroy();
        this.domCache.configNetwork[name].domElement.remove();
      }
    }

    var networkConfigConfig = {};
    var networkNames = spimosimCore.modules.list('Network');
    for (var i = 0, len = networkNames.length; i < len; i++) {
      var name = networkNames[i];
      networkConfigConfig[name] = {
        labelText: name,
        name: 'enableNetworkType' + name,
        type: 'checkbox',
        value: name === 'spimosim',
        syncURI: true
      }
    }
    this.domCache.configNetwork = graphicTools.createSettings(networkConfigConfig, this.domCache.divNetworkConfig);

    for (var name in this.domCache.configNetwork) {
      if (this.domCache.configNetwork.hasOwnProperty(name)) {
        this.attachEventListener({
          dispatcher: this.domCache.configNetwork[name],
          type: 'change',
          callback: function () {
            creator.updateModuleLibs();
          }
        });
      }
    }
  }

  Creator.prototype.setTabState = function(index, state) {
    var buttonClassList = this.domCache.tabs[index].button.classList;
    var tabClassList = this.domCache.tabs[index].contentElement.classList;
    switch (state) {
      case "error":
        buttonClassList.remove("creator-tab-button-changed");
        buttonClassList.add("creator-tab-button-error");
        tabClassList.remove("creator-tab-changed");
        tabClassList.add("creator-tab-error");
        break;
      case "changed":
        buttonClassList.remove("creator-tab-button-error");
        buttonClassList.add("creator-tab-button-changed");
        tabClassList.add("creator-tab-changed");
        break;
      default:
        buttonClassList.remove("creator-tab-button-error");
        buttonClassList.remove("creator-tab-button-changed");
        tabClassList.remove("creator-tab-error");
        tabClassList.remove("creator-tab-changed");
        break;
    }
  };
  
  Creator.prototype.newModule = function () {
    var divTab = cE('div');
    divTab.className = 'creator-tab';
    divTab.classList.add('settings');
    var newTabIndex = this.domCache.tabs.length;
    this.tabIndex = newTabIndex;
    var prefix = "tab" + newTabIndex + "_";

    this.newTab("New module", divTab);

    var heading = cE('h1');
    heading.className = "config-divHeading";
    heading.classList.add('module-tab-heading');
    divTab.appendChild(heading);
    
    var divHeading = cE('div');
    divHeading.textContent = "New Module";
    heading.appendChild(divHeading);

    var verifyButton = cE("button")
    verifyButton.textContent = "Verify"
    heading.appendChild(verifyButton);

    var divError = cE('div');
    divError.className = "error-message";
    divTab.appendChild(divError);

    var aErrorLine = cE('a');
    aErrorLine.className = "error-line";
    aErrorLine.href = "#";
    divError.appendChild(aErrorLine);

    var divErrorText = cE('div');
    divErrorText.className = "error-text";
    divError.appendChild(divErrorText);
    
    this.domCache.tabs[newTabIndex].error = {
      container: divError,
      line: aErrorLine,
      message: divErrorText
    };

    var generalHeading = cE('h2');
    generalHeading.textContent = "General module config";
    divTab.appendChild(generalHeading);


    var settingsConfig = {};
    
    settingsConfig[prefix + "name"] = {
      labelText: 'name',
      type: 'string',
      value: 'mymodule',
      syncURI: true
    };
    
    settingsConfig[prefix + "version"] = {
      labelText: 'Version',
      type: 'string',
      value: '1.0',
      syncURI: true
    };
    
    settingsConfig[prefix + "author"] = {
      labelText: 'Author',
      type: 'string',
      value: '',
      syncURI: true
    };
    
    settingsConfig[prefix + "description"] = {
      labelText: 'Description',
      type: 'text',
      rows: 2,
      value: 'My module',
      syncURI: true
    };
    
    var moduleType = {
      labelText: 'moduleType',
      type: 'select',
      values: [],
      texts: [],
      syncURI: true
    };
    settingsConfig[prefix + "moduleType"] = moduleType;
    
    settingsConfig[prefix + "object"] = {
      labelText: 'Module object name',
      type: 'string',
      value: '',
      syncURI: true
    };

    settingsConfig[prefix + "code"] = {
      labelText: '',
      type: 'jscode',
      value: '',
      rows: 20,
      syncURI: true
    };
    
    var moduleTypeList = spimosimCore.modules.list('creator-module-templates')
    for (var i = 0; i < moduleTypeList.length; i++) {
      var moduleName = moduleTypeList[i];
      moduleType.values.push(moduleName);
      var templatesInfo = getModuleTemplates(moduleName)
      moduleType.texts.push(templatesInfo.labelText);
      
      var templates = templatesInfo.templates;
      var templateSelectConfig = {
        labelText: 'Template',
        type: 'select',
        values: [],
        texts: [],
        parent: prefix + "moduleType",
        parentValue: moduleName
      };
      settingsConfig[prefix + moduleName + "_superclass"] = templateSelectConfig;

      for (var templateName in templates) {
        if (templates.hasOwnProperty(templateName)) {
          templateSelectConfig.values.push(templateName);
          templateSelectConfig.texts.push(templateName);
        }
      };
    }
    
    settingsConfig[prefix + "template"] = {
      labelText: '',
      type: 'jscode',
      value: '',
      rows: 20,
      disabled: true,
    };

    var moduleSettings = graphicTools.createSettings(settingsConfig, divTab);
    
    var nameSetting = moduleSettings[prefix + "name"];
    var moduleTypeSetting = moduleSettings[prefix + "moduleType"];
    var templateSetting = moduleSettings[prefix + "template"];
    var versionSetting = moduleSettings[prefix + "version"];
    var authorSetting = moduleSettings[prefix + "author"];
    var descriptionSetting = moduleSettings[prefix + "description"];
    var codeSetting = moduleSettings[prefix + "code"];
    var objectSetting = moduleSettings[prefix + "object"];
    
    templateSetting.domElement.classList.add("no-label");
    codeSetting.domElement.classList.add("no-label");


    var divModuleDescription = cE('div');
    divTab.insertBefore(divModuleDescription, objectSetting.domElement);

    var codeHeading = cE('h2');
    codeHeading.textContent = "Module code";
    divTab.insertBefore(codeHeading, objectSetting.domElement);

    this.domCache.tabs[this.tabIndex].settings = moduleSettings;
    var tabButton = this.domCache.tabs[this.tabIndex].button;
    
    var templateHeading = cE('h2');
    templateHeading.textContent = "Template";
    divTab.insertBefore(templateHeading, codeSetting.domElement.nextSibling);

    var copyButton = cE("button")
    copyButton.textContent = "Copy from template"
    divTab.insertBefore(copyButton, templateHeading.nextSibling);


    function update() {
      var moduleName = moduleTypeSetting.getValue();
      var prototypeName = moduleSettings[prefix + moduleName + "_superclass"].getValue();
      var templates = getModuleTemplates(moduleTypeSetting.getValue());
      var templateCode = templates.templates[prototypeName].template;
      
      divModuleDescription.innerHTML = templates.description || "";
      divModuleDescription.className = "module-description";
      templateSetting.setValue(templateCode);
      tabButton.textContent = moduleName + ": " + nameSetting.getValue();

      markTabAsChanged();
    }

    function copyCode() {
      if (codeSetting.getValue().length > 0) {
        if (!confirm("Do you want to overwrite the existing module code?")) {
          return;
        }
      }
      
      var moduleName = moduleTypeSetting.getValue();
      var prototypeName = moduleSettings[prefix + moduleName + "_superclass"].getValue();
      var templates = getModuleTemplates(moduleTypeSetting.getValue());
      var template = templates.templates[prototypeName];
      
      codeSetting.setValue(template.template);
      objectSetting.setValue(template.object);
    }

    var creator = this;
    function verifyCode() {
      creator.loadModuleFromTab(newTabIndex);
    }

    function markTabAsChanged() {
      creator.setTabState(newTabIndex, "changed");
    }

    function jumpToError() {
      creator.jumpToTabErrorPosition(newTabIndex);
    }

    for (var i = 0; i < moduleTypeList.length; i++) {
      this.attachEventListeners([
        {
          dispatcher: moduleSettings[prefix + moduleTypeList[i] + "_superclass"],
          type: 'change',
          callback: update
        }
      ]);
    }

    this.attachEventListeners([
      {
        dispatcher: aErrorLine,
        type: 'click',
        callback: jumpToError
      },
      {
        dispatcher: nameSetting,
        type: 'change',
        callback: update
      },
      {
        dispatcher: moduleTypeSetting,
        type: 'change',
        callback: update
      },
      {
        dispatcher: copyButton,
        type: 'click',
        callback: copyCode
      },
      {
        dispatcher: verifyButton,
        type: 'click',
        callback: verifyCode
      },
      {
        dispatcher: codeSetting,
        type: 'change',
        callback: markTabAsChanged
      },
      {
        dispatcher: versionSetting,
        type: 'change',
        callback: markTabAsChanged
      },
      {
        dispatcher: authorSetting,
        type: 'change',
        callback: markTabAsChanged
      },
      {
        dispatcher: descriptionSetting,
        type: 'change',
        callback: markTabAsChanged
      },
      {
        dispatcher: objectSetting,
        type: 'change',
        callback: markTabAsChanged
      }
    ]);

    this.updateTabs();
    moduleTypeSetting.dispatchEvent('change');
  }
  
  Creator.prototype.parseModuleProperty = function (index, property) {
    var prefix = "tab" + index + "_";
    var settings = this.domCache.tabs[index].settings;
    
    return settings[prefix + property].getValue();
  };
  
  Creator.prototype.parseModuleInfo = function (index) {
    return {
      "name": this.parseModuleProperty(index, "name"),
      "author": this.parseModuleProperty(index, "author"),
      "version": this.parseModuleProperty(index, "version"),
      "description": this.parseModuleProperty(index, "description"),
      "date": new Date().toISOString().substr(0,10),
      "depends": []
    };
  };

  Creator.prototype.loadModuleFromTab = function (index) {
    var error = this.evalModuleCode(index);

    if (error) {
      this.setTabError(index, error);
      return error;
    }

    switch (this.parseModuleProperty(index, "moduleType")) {
      case "Network":
      case "NetworkUi":
        this.initNetworkGui();
        this.updateModuleLibs();
        break;
      case "VarInitializer":
        this.initStateVariableInitializerGuis();
        break;
    }
  }

  function showErrorInGui(error, errorDomCache) {
    if (error.lineNumber) {
      var message = "Uncaught " + error.name + " in line " + error.lineNumber + ", column " + error.columnNumber + ": " + error.message;
      errorDomCache.line.textContent = message;
      errorDomCache.message.textContent = reformatStack(error.stack);
      return {
        type: "code",
        lineNumber: error.lineNumber,
        columnNumber: error.columnNumber
      };
    } else if (error.message) {
      errorDomCache.line.textContent = error.message;
      errorDomCache.message.textContent = "";
      return {
        type: error.type
      };
    } else {
      errorDomCache.line.textContent = error;
      errorDomCache.message.textContent = "";
      return {
        type: error
      };
    }
  };

  Creator.prototype.setTabError = function (index, error) {
    this.tabErrorLinks[index] = showErrorInGui(error, this.domCache.tabs[index].error);
  };

  Creator.prototype.jumpToTabErrorPosition = function (index) {
    var link = this.tabErrorLinks[index];
    if (link.lineNumber) {
      this.jumpToTabCodePosition(index, link.lineNumber, link.columnNumber);
    } else {
      var setting = this.domCache.tabs[index].settings["tab" + index + "_" + link.type];
      setting.focus();
    }
  };
  
  function splitStackLine(line) {
    return line.match(/^([0-9a-zA-Z_*.]*)@(.*):([0-9]+):([0-9]+)$/)
  }

  function reformatStack(stack) {
    var parts = stack.split("\n");
    for (var i = 0; i < parts.length; i++) {
      try {
        var lineParts = splitStackLine(parts[i]);
        var pathname = new URL(lineParts[2] + "#asjdksljd").pathname;
        parts[i] = lineParts[1] + "@" + pathname + ":" + lineParts[3] + ":" + lineParts[4];
      } catch (e) {
        // Keep parts not matching the regex unchanged
      }
    }
    return parts.join("\n");
  }

  Creator.prototype.jumpToTabCodePosition = function (index, lineNumber, columnNumber) {
    jumpToCodeMirrorPosition(this.domCache.tabs[index].settings["tab" + index + "_code"].codeMirror, lineNumber, columnNumber);
  };

  function jumpToCodeMirrorPosition(codeMirror, lineNumber, columnNumber) {
    codeMirror.setCursor({
      line: lineNumber - 1,
      ch: columnNumber
    });
    codeMirror.focus();
  };

  Creator.prototype.evalModuleCode = function (index) {
    if (this.parseModuleProperty(index, "code").length == 0) {
      this.setTabState(index, "error");
      return {
        message: "Incomplete module definition: No code provided.",
        type: "code"
      };
    }

    if (this.parseModuleProperty(index, "object").length == 0) {
      this.setTabState(index, "error");
      return {
        message: "Incomplete module definition: No module object name provided.",
        type: "object"
      };
    }
    
    if (this.parseModuleProperty(index, "name").length == 0) {
      this.setTabState(index, "error");
      return {
        message: "Incomplete module definition: No name provided.",
        type: "name"
      };
    }


    var code = this.parseModuleCode(index, true);

    var registeredModules = spimosimCore.modules.registers[this.parseModuleProperty(index, "moduleType")].registeredConstructors;
    try {
      delete registeredModules[this.parseModuleProperty(index, "name")];
    } catch (e) {
      // fails if the module was never created before
    };

    try {
      eval(code);
      this.setTabState(index);
      return;
    } catch (e) {
      e.lineNumber -= 2;
      this.setTabState(index, "error");
      return e;
    }
  };

  Creator.prototype.suggestModuleScriptName = function (index) {
    return this.parseModuleProperty(index, "name").replaceAll(/[^a-zA-Z0-9_-]/g, "");
  };

  Creator.prototype.parseModuleCode = function (index, useDataUrl) {
    var moduleType = this.parseModuleProperty(index, "moduleType");
    var info = this.parseModuleInfo(index);
    var scriptName = this.suggestModuleScriptName(index);
    
    info["files"] = [ "lib/modules/" + moduleType + "/" + scriptName + ".js" ];
    if (useDataUrl) {
      info["filesFinalName"] = info["files"];
      info["files"] = [ javascriptDataUrl + encodeURIComponent(this.parseModuleCode(index, false)) ];
      this.tabModuleUrls[index] = info["files"][0];//Save to link tab to stack of errors
    }

    return "'use strict';\n" +
      "(function () {\n" +
      this.parseModuleProperty(index, "code") + "\n" +
      "spimosimCore.modules.add('" + moduleType + "'," +
      JSON.stringify(info, null, 2) +
      ", " + this.parseModuleProperty(index, "object") + ");\n" +
      "}());\n";
  };
  
  Creator.prototype.skipTabIndex = function () {
    this.domCache.tabs.push(undefined);
  }

  Creator.prototype.newTab = function (name, contentElement) {
    var tabButton = cE('button');
    tabButton.className = 'creator-tab-button';
    tabButton.textContent = name;
    this.domCache.tabs.push({
      button: tabButton,
      contentElement: contentElement
    });
    this.domCache.tabBar.insertBefore(tabButton, this.domCache.tabBar.lastChild);
    
    var tabIndex = this.domCache.tabs.length - 1;
    var creator = this;
    this.attachEventListener({
      dispatcher: tabButton,
      type: 'click',
      callback: function() {
        creator.tabIndex = tabIndex;
        creator.updateTabs();
      }
    });
  }

  Creator.prototype.recreateModuleTabs = function () {
    // Read existing tab keys from URL
    var tabIndexes = Object.keys(graphicTools.SearchURL.location.fragmentOptions).filter((name)=>name.match(/tab[0-9]+_code/)).map((name)=>parseInt(name.slice(3,-5))); // TODO: clean up line
    var maxTabIndex = Math.max.apply(0, tabIndexes);

    for (var i = 1; i <= maxTabIndex; i++) {
      if (tabIndexes.indexOf(i) != -1) {
        this.newModule();
        this.loadModuleFromTab(i);
      } else {
        this.skipTabIndex();
      }
    }
    
    this.tabIndex = 0;
    this.updateTabs();
  }

  Creator.prototype.updateTabs = function () {
    for (var i = 0, len = this.domCache.tabs.length; i < len; i++) {
      if (this.domCache.tabs[i] !== undefined) {
        if (this.tabIndex == i) {
          this.domCache.tabs[i].button.classList.add("creator-tab-button-active");
        } else {
          this.domCache.tabs[i].button.classList.remove("creator-tab-button-active");
        }
      }
    }
    this.domCache.divConfig.removeChild(this.domCache.divConfig.lastChild);
    this.domCache.divConfig.appendChild(this.domCache.tabs[this.tabIndex].contentElement);
    if (this.tabIndex > 0) {
      var settings = this.domCache.tabs[this.tabIndex].settings;
      for (var name in settings) {
        if (settings.hasOwnProperty(name)) {
          if (settings[name].codeMirror) {
            settings[name].codeMirror.setSize();
            settings[name].codeMirror.refresh();
          }
        }
      }
    }
  }

  Creator.prototype.updateEnableNetworkLib = function () {
    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
      this.domCache.mainConfigTab.appendChild(this.domCache.divNetwork);
    } else {
      this.domCache.divNetwork.remove();
    }
  }

  Creator.prototype.updateConfigureClock = function () {
    if (this.domCache.configGeneral.configureClock.getValue()) {
      this.domCache.mainConfigTab.appendChild(this.domCache.divClock);
    } else {
      this.domCache.divClock.remove();
    }
  }

  Creator.prototype.updateEditCode = function () {
    if (this.domCache.configGeneral.simulationBackendType.getValue() === 'webworker') {
      this.domCache.mainConfigTab.appendChild(this.domCache.divCode);
    } else {
      this.domCache.divCode.remove();
    }
  }

  Creator.prototype.updatePreview = function () {
    var stateVars = this.previewConfig.controls.stateVariables;
    var names = Object.keys(stateVars);
    var config = this.parseConfig();


    for (var i = 0, len = names.length; i < len; i++) {
      if (stateVars[names[i]].hasOwnProperty('plot')) {
        delete spimosimCore.modules.registers.PlotDisplay.registeredConstructors[names[i]];
      }
    }
    
    this.previewConfig = config;
    this.domCache.spanHeadingModelName.textContent = config.info.title;
    this.loadModel();
  };

  Creator.prototype.getUsedLibs = function (config) {
    var usedLibs = [ 'spimosim', 'modernizr' ];
    
    if (this.initializer.sections.plotter.length > 0) {
      usedLibs = ['dygraph'].concat(usedLibs); // add at beginning of list to load first
    }

    if (this.initializer.sections.video.length > 0) {
      usedLibs.push('gifjs');
      usedLibs.push('numericjs');
      if (config.controls.network) {
        usedLibs.push('visjs');
      }
    }
    
    return usedLibs;
  };

  var EMPTY_MODULE_INFO = {
    depends: [],
    files: []
  };
  
  Creator.prototype.getNeededFiles = function(withUi, withFinalFileName) {
    var dependencies = {}
    
    if (withUi) {
      dependencies["module:DataAggregator/mean value"] = true;
      dependencies["module:DataAggregator/auto correlation"] = true;
      dependencies["module:DataAggregator/distribution"] = true;
      dependencies["module:DataAggregator/cumulated"] = true;
      dependencies["module:DataAggregator/protocol"] = true;
      dependencies["module:PlotDisplay/mean value"] = true;
      dependencies["module:PlotDisplay/auto correlation"] = true;
      dependencies["module:PlotDisplay/distribution"] = true;
      dependencies["module:PlotDisplay/cumulated"] = true;
      dependencies["module:SimulationBackend/webworker"] = true;
      dependencies["module:createDrawModes/" + this.domCache.configVideo.createDrawModes.getValue()] = true;
    }
    
    for (var i = 0, len = this.domCache.configStateVars.numberOfStateVars.getValue(); i < len; i++) {
      var type = this.domCache.configStateVar[i].config['typeSV' + i].getValue();
      dependencies["module:ProtocolVar/" + type] = true;
    }
    
    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
      dependencies['lib:spimosimNetworkCore'] = true;
      if (withUi) {
        dependencies['lib:spimosimNetworkUi'] = true;
      }
      for (var name in this.domCache.configNetwork) {
        if (this.domCache.configNetwork.hasOwnProperty(name)) {
          if (this.domCache.configNetwork[name].getValue()) {
            dependencies["module:Network/" + name] = true;
            if (withUi) {
              dependencies["module:NetworkUi/" + name] = true;
            }
          }
        }
      }
    }

    return getNeededFiles(dependencies, withFinalFileName);
  }

  Creator.prototype.getNeededFilesInWebworkerPlotBackend = function() {
    var dependencies = {}
    
    var list =
      spimosimUi.PlotDisplay.deducedPlotTypeRegister.list().concat(
      spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.list()).concat(
      spimosimUi.MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.list());

    for (var i = 0, len=list.length; i < len; i++) {
      dependencies["module:PlotComputer/" + list[i]] = true;
    }

    return getNeededFiles(dependencies);
  }

  function getNeededFiles(dependencies, withFinalFileName) {
    var dependencyCount = Object.keys(dependencies).length;
    do {
      for (var name in dependencies) {
        if (dependencies.hasOwnProperty(name)) {
          if (name.startsWith("module:")) {
            var parts = name.substring(7).split("/");
            var info = spimosimCore.modules.get(parts[0], parts[1]).moduleInfo || EMPTY_MODULE_INFO;
            var dependsList = info.depends;
            for (var i = 0, len = dependsList.length; i < len; i++) {
              dependencies[dependsList[i]] = true;
            }
          }
        }
      }
    } while (dependencyCount != (dependencyCount = Object.keys(dependencies).length));
    
    function sortFn(name1, name2) {
      if (name1.startsWith("lib:") && name2.startsWith("lib:")) {
        return 0;
      } else if (name1.startsWith("lib:")) {
        return -1;
      } else if (name2.startsWith("lib:")) {
        return 1;
      } else if (name1.startsWith("module:") && name2.startsWith("module:")) {
        var parts1 = name1.substring(7).split("/");
        var info1 = spimosimCore.modules.get(parts1[0], parts1[1]).moduleInfo || EMPTY_MODULE_INFO;
        var dependsList1 = info1.depends;
        
        var parts2 = name2.substring(7).split("/");
        var info2 = spimosimCore.modules.get(parts2[0], parts2[1]).moduleInfo || EMPTY_MODULE_INFO;
        var dependsList2 = info2.depends;
        
        if ((dependsList2.indexOf(name1) == -1) == (dependsList1.indexOf(name2) == -1)) {
          return 0;
        } else if (dependsList2.indexOf(name1) == -1) {
          return 1;
        } else {
          return -1;
        }
      } else {
        return 0;
      }
    };
    var dependencyList = Object.keys(dependencies).sort(sortFn);
    
    var i, j, len = dependencyList.length;
    var maxComparisions = len * len * len;
    do {
      for (i = 0; i < len - 1; i++) {
        for (j = i + 1; j < len; j++) {
          if (maxComparisions-- <= 0) {
            console.error("Warning Terminating sorting.");
            i = Infinity;
            j = Infinity;
            break;
          }
          var comparision = sortFn(dependencyList[i], dependencyList[j]);
          if (comparision > 0) {
            var tmp = dependencyList[i];
            dependencyList[i] = dependencyList[j]
            dependencyList[j] = tmp;
            i--;
            j = Infinity;
          }
        }
      }
    } while (j < len || i < len - 1);

    var filesList = [];
    for (var i = 0, len = dependencyList.length; i < len; i++) {
      var name = dependencyList[i];
      if (name.startsWith("module:")) {
        var parts = name.substring(7).split("/");
        var info = spimosimCore.modules.get(parts[0], parts[1]).moduleInfo || EMPTY_MODULE_INFO;
        var moduleFilesList;
        if (withFinalFileName) {
          var filesFinalName = info.filesFinalName || info.files;
          moduleFilesList = [];
          for (var j = 0; j < info.files.length; j++) {
            moduleFilesList.push({
              url: info.files[j],
              finalUrl: filesFinalName[j]
            });
          }
        } else {
          moduleFilesList = info.files;
        }

        for (var j = 0, len2 = moduleFilesList.length; j < len2; j++) {
          var fileName = moduleFilesList[j];
          if (filesList.indexOf(fileName) == -1) {
            filesList.push(fileName);
          }
        }
      } else if (name.startsWith("lib:")) {
        var libInfo = getLibInfo(name.substring(4));
        var libFilesList = (libInfo.scripts || []).concat(libInfo.styles || []).concat(libInfo.otherFiles || []);
        for (var j = 0, len2 = libFilesList.length; j < len2; j++) {
          var fileName = libFilesList[j];
          if (filesList.indexOf(fileName) == -1) {
            filesList.push(fileName);
          }
        }
      }
    }

    return filesList;
  };

  Creator.prototype.updateModuleLibs = function() {
    var filesList = this.getNeededFiles(false);
    for (var i = 0, len = filesList.length; i < len; i++) {
      if (!filesList[i].startsWith("data:")) {
        filesList[i] = "../../../" + filesList[i];
      }
    }
    this.domCache.configGeneral.simulationBackendModuleUrls.setValue(filesList.join('\n'));
  };
  
  Creator.prototype.makeFooter = function(usedLibs) {
    var footer = cE('footer');
    var divFooter = cE('div');
    footer.appendChild(divFooter);

    var divUsedLibs = cE('div');
    divUsedLibs.className = 'used-libs';
    divUsedLibs.appendChild(document.createTextNode('Used libraries: '));
    divFooter.appendChild(divUsedLibs);

    var libList = cE('ul');
    divUsedLibs.appendChild(libList);

    for (var i = 0, len = usedLibs.length; i < len; i++) {
      var libName = usedLibs[i];
      var usedLib = cE('li');
      usedLib.className = 'used-lib';
      
      var libLink = cE('a');
      libLink.href = getLibInfo(libName).link;
      libLink.textContent = getLibInfo(libName).name;
      usedLib.appendChild(libLink);

      var licenseLink = cE('a');
      licenseLink.className = 'lib-license';
      licenseLink.href = getLibInfo(libName).license;
      licenseLink.textContent = '(License)';
      usedLib.appendChild(licenseLink);
      if (i + 1 !== len) {
        usedLib.appendChild(document.createTextNode(', '));
      }
      
      libList.appendChild(usedLib);
    }

    var divAuthor = cE('div');
    divAuthor.className = 'author';
    divAuthor.appendChild(document.createTextNode('Powered by '));
    var linkSpiMoSim = cE('a');
    linkSpiMoSim.href = 'http://spimosim.pascalgrafe.net';
    linkSpiMoSim.textContent = 'SpiMoSim';
    divAuthor.appendChild(linkSpiMoSim);
    divAuthor.appendChild(document.createTextNode(' by Pascal Grafe'));
    divFooter.appendChild(divAuthor);

    return footer;
  };

  Creator.prototype.loadModel = function () {
    this.setErrorMessage();
    try {
      var usedLibs = this.getUsedLibs(this.previewConfig);
      graphicTools.removeAllChildNodes(this.domCache.divFooter);
      this.domCache.divFooter.appendChild(this.makeFooter(usedLibs));
    
      this.initializer.changeModel(this.previewConfig);
      if (this.initializer.simulation.error !== undefined) {
        this.setErrorMessage(this.initializer.simulation.error);
      }
      var creator = this;
      this.attachEventListener({
        dispatcher: this.initializer.simulation,
        type: 'error',
        callback: function (e) {
          creator.setErrorMessage(e);
        }
      });
//      this.initializer.simulation.removeEventListener('error', this.initializer.simulation.errorLogger);
    } catch (e) {
      this.setErrorMessage(e);
    }
  };

  Creator.prototype.setErrorMessage = function (e) {
    if (e !== undefined) {
      this.errorLink = showErrorInGui(e, this.domCache.previewError);
      
      if (e.stack) {
        var firstStackLine = splitStackLine(e.stack.split("\n")[0]);
        var url = firstStackLine[2];
        var errorTabIndex = -1;
        for (var i = 0; i < this.domCache.tabs.length; i++) {
          if (this.tabModuleUrls[i] && this.tabModuleUrls[i] === url) {
            var errorTabIndex = i;
            break;
          }
        }
        if (errorTabIndex >= 0) {
          this.errorLink.tab = errorTabIndex;
          this.errorLink.lineNumber -= 2;
        } else if (this.domCache.configCode.editCompleteModelCode.getValue()) {
          this.errorLink.type = "modelCode";
        } else {
          var snippets = this.makeModelCodeSnippets();
          this.errorLink.lineNumber -= snippets[0].split("\n").length - 1;
          var lineCount = this.domCache.configCode.changeSettingsFunction.getValue().split("\n").length - 1;
          if (this.errorLink.lineNumber <= lineCount) {
            this.errorLink.type = "changeSettingsFunction";
          } else {
            this.errorLink.lineNumber -= lineCount + snippets[1].split("\n").length - 1;
            this.errorLink.type = "stepFunction";
          }
        }
      }

      this.domCache.previewError.container.style.display = null;
    } else {
      this.domCache.previewError.line.textContent = '';
      this.domCache.previewError.message.textContent = '';
      this.domCache.previewError.container.style.display = 'none';
    }
  };

  Creator.prototype.jumpToError = function () {
    if (this.errorLink.tab) {
      this.tabIndex = this.errorLink.tab;
      this.updateTabs();
      this.jumpToTabCodePosition(this.tabIndex, this.errorLink.lineNumber, this.errorLink.columnNumber);
    } else if (this.errorLink.type) {
      this.tabIndex = 0;
      this.updateTabs();
      jumpToCodeMirrorPosition(this.domCache.configCode[this.errorLink.type].codeMirror, this.errorLink.lineNumber, this.errorLink.columnNumber);
    }
  };
  
  Creator.prototype.updateSectionTypeConfig = function () {
    var options = this.domCache.sectionTypeConfig.domElement.querySelectorAll('option');
    for (var i = 0, len = options.length; i < len; i++) {
      var type = options[i].getAttribute('value');
      if (type !== 'plotter' && type !== 'video') {
        if (this.initializer.sections[type] !== undefined) {
          options[i].setAttribute('disabled', 'disabled');
          
          if (this.domCache.sectionTypeConfig.getValue() === options[i].getAttribute('value')) {
            this.domCache.sectionTypeConfig.setValue('video', false);
          }
        } else {
          options[i].removeAttribute('disabled');
        }
      }
    }
  };

  Creator.prototype.updateParameterCount = function () {
    var toShow = this.domCache.configParameters.numberOfParameters.getValue();
    var created = this.domCache.configParameter.length;
    var min = Math.min(toShow, created);
    
    for (var i = 0; i < min; i++) {
      this.domCache.mainConfigTab.insertBefore(this.domCache.configParameter[i].domElement, this.domCache.headingStateVarConfig);
    }
    if (created < toShow) {
      for (var i = created; i < toShow; i++) {
        this.domCache.mainConfigTab.insertBefore(this.createParameterConfig(i), this.domCache.headingStateVarConfig);
      }
    } else {
      for (var i = toShow; i < created; i++) {
        this.domCache.configParameter[i].domElement.remove();
      }
    }
    
    this.updateModuleLibs();
  };

  Creator.prototype.updateStateVarCount = function () {
    var toShow = this.domCache.configStateVars.numberOfStateVars.getValue();
    var created = this.domCache.configStateVar.length;
    var min = Math.min(toShow, created);
    
    for (var i = 0; i < min; i++) {
      this.domCache.mainConfigTab.insertBefore(this.domCache.configStateVar[i].domElement, this.domCache.headingVideoConfig);
    }
    if (created < toShow) {
      for (var i = created; i < toShow; i++) {
        this.domCache.mainConfigTab.insertBefore(this.createStateVarConfig(i), this.domCache.headingVideoConfig);
      }
    } else {
      for (var i = toShow; i < created; i++) {
        this.domCache.configStateVar[i].domElement.remove();
      }
    }
  };

  Creator.prototype.updateSnippetElements = function () {
    var snippets = this.makeModelCodeSnippets();
    var snippetElements = this.domCache.snippetElements;
    snippetElements[0].textContent = snippets[0];
    snippetElements[1].textContent = snippets[1];
    snippetElements[2].textContent = snippets[2];

    var value = this.domCache.configCode.editCompleteModelCode.getValue();
    
    if (value) {
      if (this.domCache.configCode.modelCode.getValue() === '') {
        this.domCache.configCode.modelCode.setValue(this.parseModelSourceCode(true));
      }

      snippetElements[0].style.display = 'none';
      snippetElements[1].style.display = 'none';
      snippetElements[2].style.display = 'none';
    } else {
      snippetElements[0].style.display = '';
      snippetElements[1].style.display = '';
      snippetElements[2].style.display = '';
    }
  };

  Creator.prototype.updateCodeSettings = function () {
    var editCompl = this.domCache.configCode.editCompleteModelCode.getValue();
    var adv = this.domCache.configGeneral.generalAdvanced.getValue();

    this.domCache.configCode.stepFunction.setVisibility(!editCompl);
    this.domCache.configCode.changeSettingsFunction.setVisibility(!editCompl);
    this.domCache.configCode.modelCode.setVisibility(editCompl);
    this.domCache.configCode.modelObjectName.setVisibility(adv && !editCompl);
    this.domCache.configCode.editCompleteModelCode.setVisibility(adv || editCompl);
    this.domCache.configCode.modelObjectName.setVisibility(adv && !editCompl);
    
    this.updateSnippetElements();
  }


  Creator.prototype.createSections = function() {
    this.domCache.sections = [];
    
    this.sectionIdCounter = {
      downloads: 0,
      info: 0,
      help: 0,
      plotter: 0,
      video: 0,
      controls: 0
    };

    var sections = [ 'info', 'controls', 'video', 'plotter', 'downloads' ];
    for (var i = 0, len = sections.length; i < len; i++) {
      this.createSection(sections[i]);
    }
  };

  Creator.prototype.createSection = function (type) {
    var section = cE('section');
    section.id = type + (this.sectionIdCounter[type]++);
    
    var dragBar = cE('div');
    dragBar.className = 'section-drag-bar';
    section.appendChild(dragBar);

    var buttonRemove = cE('button');
    buttonRemove.classList.add('close');
    buttonRemove.classList.add('remove-section');
    dragBar.appendChild(buttonRemove);

    if (type === 'video' || type === 'plotter') {
      this.initializer.sections[type].push(section);
    } else {
      this.initializer.sections[type] = section;
    }

    var creator = this;
    this.attachEventListener({
      dispatcher: buttonRemove,
      type: 'click',
      callback: function () {
        if (type === 'video') {
          var videos = creator.initializer.sections.video;
          var index = videos.indexOf(section);
          creator.initializer.sections.video = [].concat(videos.slice(0, index), videos.slice(index + 1));
        } else if (type === 'plotter') {
          var plotters = creator.initializer.sections.plotter;
          var index = plotters.indexOf(section);
          creator.initializer.sections.plotter = [].concat(plotters.slice(0, index), plotters.slice(index + 1));
        } else {
          delete creator.initializer.sections[type];
        }

        section.remove();
        creator.updateSectionTypeConfig();
        creator.updatePreview();
        
        var index = creator.domCache.sections.indexOf(section);
        creator.domCache.sections = [].concat(creator.domCache.sections.slice(0, index)).concat(creator.domCache.sections.slice(index + 1));
      }
    });

    this.domCache.main.appendChild(section);
    this.domCache.sections.push(section);
    
    graphicTools.enableDragAndDropMove(dragBar, section);
  }

  Creator.prototype.createParameterConfig = function (pCounter) {
    var container = cE('div');
    container.className = 'parameter-config';
    
    var headingParameterConfig = cE('h3');

    var divParameterConfig = cE('div');
    divParameterConfig.className = 'settings';
    
    var parameterConfigConfig = {};
    parameterConfigConfig['typeP' + pCounter] = {
      labelText: 'type',
      type: 'select',
      value: 'range',
      values: [ 'range', 'number', 'string', 'text', 'checkbox', 'radio', 'select', 'file', 'tabs' ],
      texts:  [ 'range', 'number', 'string', 'text', 'checkbox', 'radio', 'select', 'file', 'tabs' ],
      syncURI: true
    };
    parameterConfigConfig['varNameP' + pCounter] = {
      labelText: 'Variable name',
      type: 'string',
      value: 'parameter' + pCounter,
      syncURI: true
    };
    parameterConfigConfig['labelTextP' + pCounter] = {
      labelText: 'Label text',
      type: 'string',
      value: 'parameter' + pCounter,
      syncURI: true
    };
    parameterConfigConfig['valueP' + pCounter] = {
      labelText: 'Value',
      type: 'string',
      value: '',
      parent: 'typeP' + pCounter,
      parentValue: [ 'range', 'number', 'string', 'text', 'radio', 'select', 'file', 'tabs' ],
      syncURI: true
    };
    parameterConfigConfig['valueCheckboxP' + pCounter] = {
      labelText: 'Value',
      type: 'select',
      value: 'false',
      texts: [ 'false', 'true' ],
      values: [ 'false', 'true' ],
      parent: 'typeP' + pCounter,
      parentValue: 'checkbox',
      syncURI: true
    };
    
    
    parameterConfigConfig['minP' + pCounter] = {
      labelText: 'Min',
      type: 'number',
      value: '',
      step: 'any',
      parent: 'typeP' + pCounter,
      parentValue: [ 'range', 'number' ],
      syncURI: true
    };
    parameterConfigConfig['maxP' + pCounter] = {
      labelText: 'Max',
      type: 'number',
      step: 'any',
      value: '',
      parent: 'typeP' + pCounter,
      parentValue: [ 'range', 'number' ],
      syncURI: true
    };
    parameterConfigConfig['stepP' + pCounter] = {
      labelText: 'Step',
      type: 'number',
      step: 'any',
      value: '',
      parent: 'typeP' + pCounter,
      parentValue: [ 'range', 'number' ],
      syncURI: true
    };
    parameterConfigConfig['logScaleP' + pCounter] = {
      labelText: 'Logarithmic scale',
      type: 'checkbox',
      value: false,
      parent: 'typeP' + pCounter,
      parentValue: 'range',
      syncURI: true
    };
    parameterConfigConfig['rowsP' + pCounter] = {
      labelText: '#Text rows',
      type: 'number',
      value: 3,
      min: 1,
      parent: 'typeP' + pCounter,
      parentValue: 'text',
      syncURI: true
    };
    parameterConfigConfig['maxlengthP' + pCounter] = {
      labelText: 'Text length',
      type: 'number',
      value: '',
      min: 0,
      parent: 'typeP' + pCounter,
      parentValue: 'string',
      syncURI: true
    };
    parameterConfigConfig['textsP' + pCounter] = {
      labelText: 'Texts (1 per line)',
      type: 'text',
      value: '',
      parent: 'typeP' + pCounter,
      parentValue: [ 'radio', 'select', 'tabs' ],
      syncURI: true
    };
    parameterConfigConfig['valuesP' + pCounter] = {
      labelText: 'Values (1 per line)',
      type: 'text',
      value: '',
      parent: 'typeP' + pCounter,
      parentValue: [ 'radio', 'select', 'tabs' ],
      syncURI: true
    };
    
    parameterConfigConfig['advancedParameterConfigP' + pCounter] = {
      labelText: 'Show more options',
      type: 'checkbox',
      value: false,
    };
    parameterConfigConfig['disabledP' + pCounter] = {
      labelText: 'Disable element',
      type: 'checkbox',
      value: false,
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true
    };
    parameterConfigConfig['keyP' + pCounter] = {
      labelText: 'Key (optional)',
      type: 'string',
      value: '',
      maxlength: 1,
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true
    };
    parameterConfigConfig['infoP' + pCounter] = {
      labelText: 'Additional information (optional)',
      type: 'text',
      value: '',
      rows: 1,
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true
    };
    parameterConfigConfig['nameP' + pCounter] = {
      labelText: 'HTML name attribute (optional)',
      type: 'string',
      value: '',
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true
    };
    parameterConfigConfig['idP' + pCounter] = {
      labelText: 'HTML id attribute (optional)',
      type: 'string',
      value: '',
      parent: 'advancedParameterConfigP' + pCounter,
      syncURI: true
    };
    parameterConfigConfig['parentP' + pCounter] = {
      labelText: 'Parent setting',
      type: 'string',
      value: '',
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true,
    };
    parameterConfigConfig['parentValueP' + pCounter] = {
      labelText: 'Aktivate if parent has one of the following values (1 per line)',
      type: 'text',
      rows: 2,
      value: '',
      parent: 'advancedParameterConfigP' + pCounter,
      parentValue: true,
      syncURI: true,
    };

    var config = graphicTools.createSettings(parameterConfigConfig, divParameterConfig);
    var advancedConfigs = [ "advancedParameterConfig", "disabled", "key", "info", "name", "id", "parent", "parentValue" ];
    for (var i = 0; i < advancedConfigs.length; i++) {
      config[advancedConfigs[i] + "P" + pCounter].domElement.classList.add("creator-advanced");
    }
    
    this.attachEventListeners([
      {
        dispatcher: config['varNameP' + pCounter],
        type: 'change',
        callback: function () {
          headingParameterConfig.textContent = config['varNameP' + pCounter].getValue();
        }
      },
      {
        dispatcher: config['typeP' + pCounter],
        type: 'change',
        callback: function () {
          creator.updateModuleLibs();
        }
      }
    ]);
      
    headingParameterConfig.textContent = config['varNameP' + pCounter].getValue();
    
    container.appendChild(headingParameterConfig);
    container.appendChild(divParameterConfig);
    
    this.domCache.configParameter[pCounter] = {
      config: config,
      domElement: container
    };

    return container;
  };
  
  Creator.prototype.createStateVarConfig = function (sVCounter) {
    var container = cE('div');
    container.className = 'parameter-config';
    
    var headingStateVarConfig = cE('h3');

    var divStateVarConfig = cE('div');
    divStateVarConfig.className = 'settings';
    
    var stateVarConfigConfig = {};
    stateVarConfigConfig['varNameSV' + sVCounter] = {
      labelText: 'Variable name',
      type: 'string',
      value: 'stateVar' + sVCounter,
      syncURI: true
    };
    
    stateVarConfigConfig['typeSV' + sVCounter] = {
      labelText: 'type',
      type: 'select',
      value: 'range',
      values: spimosimCore.modules.list('ProtocolVar'),
      texts: spimosimCore.modules.list('ProtocolVar'),
      syncURI: true
    };
   
    stateVarConfigConfig['plotSV' + sVCounter] = {
      labelText: 'Can be plotted',
      type: 'checkbox',
      value: false,
      syncURI: true
    };
    
    stateVarConfigConfig['plotOptionTextSV' + sVCounter] = {
      labelText: 'Plot name',
      type: 'string',
      value: 'var' + sVCounter,
      parent: 'plotSV' + sVCounter,
      parentValue: true,
      syncURI: true
    };
    
    stateVarConfigConfig['plotDescriptionSV' + sVCounter] = {
      labelText: 'Plot description',
      type: 'text',
      value: 'var' + sVCounter,
      parent: 'plotSV' + sVCounter,
      parentValue: true,
      syncURI: true
    };
    
    stateVarConfigConfig['useInitializerSV' + sVCounter] = {
      labelText: 'Use initializer',
      type: 'checkbox',
      value: false,
      syncURI: true
    };
    
    stateVarConfigConfig['initializerConfigSV' + sVCounter] = {
      labelText: 'Custom JSON config',
      type: 'text',
      value: '{}',
      parent: 'useInitializerSV' + sVCounter,
      parentValue: true,
      syncURI: true
    };
   
    var config = graphicTools.createSettings(stateVarConfigConfig, divStateVarConfig);
    
    this.attachEventListeners([
      {
        dispatcher: config['varNameSV' + sVCounter],
        type: 'change',
        callback: function () {
          headingStateVarConfig.textContent = config['varNameSV' + sVCounter].getValue();
        }
      },
      {
        dispatcher: config['typeSV' + sVCounter],
        type: 'change',
        callback: function () {
          creator.updateModuleLibs();
          creator.initStateVariableInitializerGui(sVCounter);
        }
      }
    ]);
      
    headingStateVarConfig.textContent = config['varNameSV' + sVCounter].getValue();
    
    container.appendChild(headingStateVarConfig);
    container.appendChild(divStateVarConfig);
    
    this.domCache.configStateVar[sVCounter] = {
      config: config,
      domElement: container,
      configContainer: divStateVarConfig
    };
    this.initStateVariableInitializerGui(sVCounter);

    return container;
  }

  Creator.prototype.initStateVariableInitializerGui = function (index) {
    var sVConfig = this.domCache.configStateVar[index];
    var initializerSetting = sVConfig.config['initializerSV' + index];

    if (initializerSetting) {
      initializerSetting.destroy();
      initializerSetting.domElement.remove();
    }

    var allInitializers = spimosimCore.modules.list('VarInitializer');
    var usableInitializers = [];
    var protocolVarType = sVConfig.config["typeSV" + index].getValue();

    for (var i = 0; i < allInitializers.length; i++) {
      if ((spimosimCore.modules.get("VarInitializer", allInitializers[i]).protocolVarType || protocolVarType) === protocolVarType) {
        usableInitializers.push(allInitializers[i]);
      }
    }

    var settingsConfig = {};
    settingsConfig['initializerSV' + index] = {
      labelText: 'Initialzer',
      type: 'select',
      values: usableInitializers,
      texts: usableInitializers,
      parent: 'useInitializerSV' + index,
      parentValue: true,
      syncURI: true
    };
    var settings = graphicTools.createSettings(settingsConfig, sVConfig.configContainer, {}, sVConfig.config);
    tools.copyInto(sVConfig.config, settings);

    //swap settings position
    sVConfig.configContainer.insertBefore(sVConfig.config['initializerSV' + index].domElement, sVConfig.config['initializerConfigSV' + index].domElement);
  }

  Creator.prototype.initStateVariableInitializerGuis = function() {
    for (var i = 0; i < this.domCache.configStateVar.length; i++) {
      this.initStateVariableInitializerGui(i);
    }
  };

  Creator.prototype.makeModelCodeSnippets = function() {
    var title = this.domCache.configGeneral.title.getValue();
    var modelObjectName = this.domCache.configCode.modelObjectName.getValue();
    return [
      "'use strict';\n" +
      "\n" +
      "function " + modelObjectName + "(settings) {\n" + 
      "  this.changeSettings(settings, true);\n" + 
      "};\n" + 
      "\n" +
      modelObjectName + ".prototype.changeSettings = function (settings, restart) {\n",
      "\n" +
      "};\n" +
      "\n" +
      modelObjectName + ".prototype.step = function (varsToSave, time) {\n",
      "\n" +
      "};\n" +
      "\n" +
      "spimosimCore.modules.add('" + modelObjectName + "', '" + title + "', Model);\n"
    ];
  };

  Creator.prototype.parseModelSourceCode = function (fromSeperateFunctions) {
    if (fromSeperateFunctions || !this.domCache.configGeneral.generalAdvanced.getValue() || !this.domCache.configCode.editCompleteModelCode.getValue()) { 
      var snippets = this.makeModelCodeSnippets();
      var code = snippets[0] +
        this.domCache.configCode.changeSettingsFunction.getValue() +
        snippets[1] +
        this.domCache.configCode.stepFunction.getValue() +
        snippets[2];
      return code;
    } else {
      return this.domCache.configCode.modelCode.getValue();
    }
  };

  Creator.prototype.parseConfig = function (forDownload) {
    var title = this.domCache.configGeneral.title.getValue();
    var config = {
      info: {
        title: this.domCache.configGeneral.title.getValue(),
        iconUrl: this.domCache.configGeneral.iconUrl.getValue(),
      },
      controls: {
        stateVariables: {},
        parameters: {},
        features: [ 'deleteOldData', 'changeEndlessMode', 'saveVarCheckboxes', "select action on changing settings" ]
      },
      simulation: {
      },
      plotter: {
        backend: {
          type: 'webworker',
          workerUrl: '../lib/modules/PlotBackend/webworker.worker.js',
          urls: this.getNeededFilesInWebworkerPlotBackend().map(function (name) { return '../../../' + name })
        },
        plotTypes: [],
        features: true
      },
      video: {
        type: 'canvas',
        features: true,
        dynamicVideo: {
          features: true
        },
        drawModes: {}
      }
    };
    
    var helpTextId = this.domCache.configGeneral.helpTextId.getValue();
    if (helpTextId !== undefined) {
      config.info,helpTextId = helpTextId;
    }

    if (this.domCache.configGeneral.continuableWithNewSettings.getValue()) {
      config.simulation.continuableWithNewSettings = true;
    }
    var simulationBackendType = this.domCache.configGeneral.simulationBackendType.getValue();
    switch (simulationBackendType) {
      case 'webworker':
        var urls = [];
        var urlsString = this.domCache.configGeneral.simulationBackendAdditionalUrls.getValue();
        if (urlsString !== '') {
          urls = urlsString.split('\n');
        }
        
        urlsString = this.domCache.configGeneral.simulationBackendModuleUrls.getValue();
        if (urlsString !== '') {
          urls = urls.concat(urlsString.split('\n'));
        }

        if (forDownload) {
          urls.push('../../../model/model.js');
        } else {
          urls.push(URL.createObjectURL(new Blob([ this.parseModelSourceCode() ] ,{ type: 'text/javascript' })));
        }
        
        config.simulation.backend = {
          type: 'webworker',
          workerUrl: this.domCache.configGeneral.simulationBackendWorkerUrl.getValue(),
          urls: urls,
          name: title,
        };
        break;
      case 'synchronous':
        config.simulation.backend = {
          type: 'synchronous',
          model: title,
        };
        break;
      case 'server':
        config.simulation.backend = {
          type: 'server',
          url: this.domCache.configGeneral.simulationBackendServerUrl.getValue(),
          model: title,
        };
        break;
    }

    var defaultPlotList = [];
    var values = {};
    for (var i = 0, len = this.domCache.configStateVars.numberOfStateVars.getValue(); i < len; i++) {
      var c = this.domCache.configStateVar[i].config;
      for (var j = 0; j < STATE_VAR_ATTRIBUTES.length; j++) {
        values[STATE_VAR_ATTRIBUTES[j]] = c[STATE_VAR_ATTRIBUTES[j] + 'SV' + i].getValue();
      }
      
      var stateVarConfig = {
        type: values.type,
      }

      if (values.plot) {
        stateVarConfig.plot = {
          description: values.plotDescription,
          optionText: values.plotOptionText
        };
        defaultPlotList.push(values.varName);
      }

      if (c['useInitializerSV' + i].getValue()) {
        stateVarConfig.initialValue = {};
        var type = c['initializerSV' + i].getValue();
        stateVarConfig.initialValue[type] = JSON.parse(c['initializerConfigSV' + i].getValue());
      }

      config.controls.stateVariables[values.varName] = stateVarConfig;
    }

    var values = {};
    for (var i = 0, len = this.domCache.configParameters.numberOfParameters.getValue(); i < len; i++) {
      var c = this.domCache.configParameter[i].config;
      for (var j = 0; j < PARAMETER_ATTRIBUTES.length; j++) {
        values[PARAMETER_ATTRIBUTES[j]] = c[PARAMETER_ATTRIBUTES[j] + 'P' + i].getValue();
      }
      
      var parameterConfig = {
        type: values.type,
        labelText: values.labelText
      };
      
      if (values.key !== '') {
        parameterConfig.key = values.key;
      }

      if (values.type !== 'checkbox') {
        if (values.value !== '') {
          parameterConfig.value = values.value;
        }
      } else {
        if (values.valueCheckbox === 'true') {
          parameterConfig.value = true;
        }
      }
      
      if (values.advancedParameterConfig) {
        if (values.disabled) {
          parameterConfig.disabled = true;
        }

        if (values.info !== '') {
           parameterConfig.info = values.info;
        }

        if (values.name !== '') {
           parameterConfig.name = values.name;
        }

        if (values.id !== '') {
           parameterConfig.name = values.name;
        }
        
        if (values.parent !== '') {
          parameterConfig.parent = values.parent;
          var value = values.parentValue.split('\n');
          if (value.length === 1) {
            parameterConfig.parentValue = value[0];
          } else {
            parameterConfig.parentValue = value;
          }
        }
      }

      switch (values.type) {
        case 'range':
          if (values.logScale) {
            parameterConfig.logScale = true;
          }
        case 'number':
          if (isFinite(values.min)) {
            parameterConfig.min = values.min;
          }
          if (isFinite(values.max)) {
            parameterConfig.max = values.max;
          }
          if (values.step !== '') {
            if (values.step === 'any') {
              parameterConfig.step = 'any';
            } else {
              parameterConfig.step = parseFloat(values.step, 10);
            }
          }
          break;
        case 'radio':
        case 'select':
        case 'tabs':
          parameterConfig.values = values.values.split('\n');
          parameterConfig.texts = values.texts.split('\n');
          break;
        case 'string':
          if (values.maxlength !== '') {
            parameterConfig.maxlength = parseInt(values.maxlength, 10);
          }
          break;
        case 'text':
          if (values.rows !== '') {
            parameterConfig.rows = parseInt(values.rows, 10);
          }
          break;
      }

      config.controls.parameters[values.varName] = parameterConfig;
    }

    try {
      var colorSetString = this.domCache.configGeneral.colorSet.getValue()
        .replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ')//allow unquoted key words
        .replace(/'([#0-9A-Fa-f]+)'/g, '"$1"');//allow single quotes
      config.colorSet = JSON.parse(colorSetString);
      this.domCache.configGeneral.colorSet.setValid();
    } catch (e) {
      console.error(e);
      this.domCache.configGeneral.colorSet.setInvalid(e);
    }

    var type = this.domCache.configVideo.createDrawModes.getValue();
    config.video.drawModes.type = type;
    switch (type) {
      case 'custom canvas':
        config.video.drawModes.texts = this.domCache.configVideo.customCanvasModeNames.getValue().split('\n');
        config.video.drawModes.code = this.domCache.configVideo.customCanvasCode.getValue();
        break;
      case 'grey scale spins':
        config.video.drawModes.maxValues = this.domCache.configVideo.maxValues.getValue().split('\n');
      case 'int map':
        config.video.drawModes.minValues = this.domCache.configVideo.minValues.getValue().split('\n');
      case 'weighted spins':
      case 'spins and flips':
        config.video.drawModes.names = this.domCache.configVideo.varNames.getValue().split('\n');
        break;
      case 'custom':
        config.video.drawModes = JSON.parse(this.domCache.configVideo.customJSONConfig.getValue());
        config.video.drawModes.type = this.domCache.configVideo.customDrawMode.getValue();
        break;
    }


    var modelInfoURL;
    if (forDownload) {
      modelInfoURL = 'model-info.html';
    } else {
      modelInfoURL = URL.createObjectURL(new Blob([ this.domCache.configGeneral.description.getValue() ] ,{ type: 'text/html' }));
    }
    config.info.url = modelInfoURL;

    var plotTypes = this.domCache.configPlotter.plotTypes.getValue();
    if (plotTypes !== '') {
      config.plotter.plotTypes = plotTypes.split('\n');
      [].push.apply(defaultPlotList, config.plotter.plotTypes);
    }
    
    config.plotter.defaultPlots = [];
    for (var i = 0, len = defaultPlotList.length; i < len; i++) {
      config.plotter.defaultPlots.push({
        type: defaultPlotList[i]
      });
    }
    
    var urls = this.domCache.configPlotter.plotterBackendUrls.getValue();
    if (urls !== '') {
      config.plotter.backend.urls = config.plotter.backend.urls.concat(urls.split('\n'));
    }

    
    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
      var names = [];
      for (var name in this.domCache.configNetwork) {
        if (this.domCache.configNetwork.hasOwnProperty(name)) {
          if (this.domCache.configNetwork[name].getValue()) {
            names.push(name);
          }
        }
      }
      config.controls.network = { types: names };
    }

    if (this.domCache.configGeneral.configureClock.getValue()) {
      config.clock = {
        buffer: {}
      };

      config.clock.onSlowSimulation = this.domCache.configClock.onSlowSimulation.getValue();
      
      if (!this.domCache.configClock.endlessMode.getValue()) {
        config.clock.endlessMode = false;
      }

      var defaultFps = this.domCache.configClock.defaultFps.getValue();
      if (isFinite(defaultFps)) {
        config.clock.fps = {
          value: defaultFps
        }
      }
      
      var triggerValue = this.domCache.configClock.clockTriggerValue.getValue();
      if (isFinite(triggerValue)) {
        config.clock.buffer.trigger = {};
        config.clock.buffer.trigger[this.domCache.configClock.clockTriggerUnit.getValue()] = triggerValue;
      }
      
      var internalValue = this.domCache.configClock.clockInternalValue.getValue();
      if (isFinite(internalValue)) {
        config.clock.buffer.internal = {};
        config.clock.buffer.internal[this.domCache.configClock.clockInternalUnit.getValue()] = internalValue;
      }
      
      var futureValue = this.domCache.configClock.clockShownFutureValue.getValue();
      if (isFinite(futureValue)) {
        config.clock.buffer.shownFuture = {};
        config.clock.buffer.shownFuture[this.domCache.configClock.clockShownFutureUnit.getValue()] = futureValue;
      }
      
      var historyValue = this.domCache.configClock.clockShownHistoryValue.getValue();
      if (isFinite(historyValue)) {
        config.clock.buffer.shownHistory = {};
        config.clock.buffer.shownHistory[this.domCache.configClock.clockShownHistoryUnit.getValue()] = historyValue;
      }
    }


    return config;
  };
      
  var PARAMETER_ATTRIBUTES = [ 'type', 'varName', 'labelText', 'info', 'value', 'valueCheckbox', 'key', 'logScale', 'min', 'max', 'step', 'rows', 'maxlength', 'texts', 'values', 'advancedParameterConfig', 'disabled', 'name', 'id', 'parent', 'parentValue' ];
  var STATE_VAR_ATTRIBUTES = [ 'type', 'varName', 'plot', 'plotOptionText', 'plotDescription' ];
  
  Creator.prototype.download = function () {
    var zip = new JSZip();
    zip.folder('ext_lib');
    zip.folder('ext_lib/css');
    zip.folder('ext_lib/lib');
    zip.folder('lib');
    zip.folder('lib/spimosimUi');
    zip.folder('lib/spimosimUi/css');
    zip.folder('lib/spimosimUi/icon');
    zip.folder('lib/spimosimCore');
    
    zip.folder('model');
    
    var config = this.parseConfig(true);
    var usedLibs = this.getUsedLibs(config);
    
    zip.file('model/model-config.js', "spimosimCore.modules.add('ModelConfig', '" + config.info.title + "', " + JSON.stringify(config, null, 2) + ')');
    zip.file('model/model.js', this.parseModelSourceCode());
    zip.file('model/index.html', this.getIndexHTML(config));
    if (this.domCache.configGeneral.url.getValue() === 'model-info.html') {
      zip.file('model/model-info.html', this.domCache.configGeneral.description.getValue());
    }
    
    for (var i = 0; i < usedLibs.length; i++) {
      var folders = getLibInfo(usedLibs[i]).folders || [];
      for (var j = 0; j < folders.length; j++) {
        zip.folder(folders[j]);
      }
    }
    

    var downloads = this.getNeededFiles(true, true);
    for (var i = 0; i < usedLibs.length; i++) {
      var libInfo = getLibInfo(usedLibs[i]);
      var downloads = downloads.concat(libInfo.scripts || []).concat(libInfo.styles || []).concat(libInfo.otherFiles || []);
    }

    var counter = downloads.length;
    function addFromURL(dest, source) {
      var request = new XMLHttpRequest();
      request.open('GET', source);
      request.responseType = 'blob';
      request.onload = function () {
        if (this.status === 200) {
          zip.file(dest, this.response);
          
          counter--;
          if (counter === 0) {
            zip.generateAsync({
              type:'base64'
            }).then(function (base64) {
              graphicTools.startDownload('data:application/zip;base64,' + base64, 'model.zip');
            });
          }
        } else {
          console.error(this.status, dest);
        }
      };
      request.onerror = function (e) {
        console.error(e);
      }

      request.send();
    }

    for (var i = 0, len = downloads.length; i < len; i++) {
      if (downloads[i].finalUrl) {
        if (downloads[i].url.startsWith(javascriptDataUrl)) {
          zip.file(downloads[i].finalUrl, decodeURIComponent(downloads[i].url.substr(javascriptDataUrl.length)));
          counter--;
        } else {
          addFromURL(downloads[i].finalUrl, '../' + downloads[i].url);
        }
      } else {
        addFromURL(downloads[i], '../' + downloads[i]);
      }
    }
  };

  Creator.prototype.getIndexHTML = function (config) {
    var sectionIdCounter = {
      downloads: 0,
      info: 0,
      help: 0,
      plotter: 0,
      video: 0,
      controls: 0
    };

    var loadScript = 'var modelChanger;\n' +
      'onload = function () {\n' +
      '  if (!modelChanger) {\n' +
      '    modelChanger = new ModelChanger(\n' +
      '      document.getElementById(\'heading0\'),\n' +
      "      [ '" + config.info.title + "' ],\n" +
      '      {\n';

    var getSectionsVideoHTML = '        video: [\n';
    var getSectionsPlotterHTML = '        plotter: [\n';
    var sectionsHTML = '';
    
    var sections = this.domCache.sections;
    for (var i = 0, len = sections.length; i < len; i++) {
      var section = sections[i],
        type;
      
      if (section === this.initializer.sections.controls) {
        type = 'controls';
      } else if (section === this.initializer.sections.info) {
        type = 'info';
      } else if (section === this.initializer.sections.help) {
        type = 'help';
      } else if (section === this.initializer.sections.downloads) {
        type = 'downloads';
      } else if (this.initializer.sections.plotter.indexOf(section) !== -1) {
        type = 'plotter';
      } else {
        type = 'video';
      }
      var id = type + (sectionIdCounter[type]++);
      sectionsHTML += '    <section id="' + id + '"></section>\n';
      switch(type) {
        case 'video':
          getSectionsVideoHTML += "          document.getElementById('" + id + "'),\n";
          break;
        case 'plotter':
          getSectionsPlotterHTML += "          document.getElementById('" + id + "'),\n";
          break;
        default:
          loadScript += "        '" + type + "': document.getElementById('" + id + "'),\n";
          break;
      }
    }
    
    getSectionsVideoHTML += '        ],\n';
    getSectionsPlotterHTML += '        ],\n';
    loadScript += getSectionsVideoHTML;
    loadScript += getSectionsPlotterHTML;
    loadScript += '    });\n' +
      '  }\n';

    if (this.domCache.configGeneral.movableSections.getValue()) {
      loadScript += '  makeSectionsMovable(document.getElementsByClassName(\'main\')[0]);\n';
    }

    loadScript += '};\n';

    var usedLibs = this.getUsedLibs(config);
    var footerHTML = this.makeFooter(usedLibs).outerHTML;

    var scriptsHTML = '';
    
    for (var i = 0; i < usedLibs.length; i++) {
      var scripts = getLibInfo(usedLibs[i]).scripts || [];
      for (var j = 0; j < scripts.length; j++) {
        scriptsHTML += '  <script src="../' + scripts[j] + '"></script>\n';
      }
    }
    
    if (this.domCache.configGeneral.movableSections.getValue()) {
      scriptsHTML += '  <script src="../lib/spimosimUi/movable-sections.js"></script>\n';
    }
    
    var moduleFiles = this.getNeededFiles(true, true);
    for (var i = 0, len = moduleFiles.length; i < len; i++) {
      var url = moduleFiles[i].finalUrl || moduleFiles[i];
      if (url.endsWith(".js")) {
        if (!url.endsWith(".worker.js")) {
          scriptsHTML += '  <script src="../' + url + '"></script>\n';
        }
      } else if (url.endsWith(".css")) {
        scriptsHTML += '  <link rel="stylesheet" href="../' + url + '" />\n';
      }
    }

    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
        '  <script>spimosimNetwork.MAX_NODES = 65536</script>\n';
    }

    scriptsHTML += '\n' +
      '  <script src="model-config.js"></script>\n';
    
    var stylesHTML = '';
    for (var i = 0; i < usedLibs.length; i++) {
      var styles = getLibInfo(usedLibs[i]).styles || [];
      for (var j = 0; j < styles.length; j++) {
        stylesHTML += '  <link rel="stylesheet" href="../' + styles[j] + '" />\n';
      }
    }
    
    return '<!doctype html>\n' +
      '<html lang="en-US">\n' +
      '<head>\n' +
      '  <meta charset="UTF-8" />\n' +
      stylesHTML +
      '\n' +
      '  <link rel="icon" href="../lib/spimosimUi/icon/favicon.svg" />\n' +
      '\n' +
      '  <title>' + config.info.title + '</title>\n' +
      '\n' +
      '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '</head>\n' +
      '<body class="spimosim-dark has-header-image">\n' +
      '  <h1 id="heading0" class="model-heading"></h1>\n' +
      '\n' +
      '  <div class="main">\n' +
      sectionsHTML + 
      '  </div>\n' +
      footerHTML +
      scriptsHTML +
      '\n' +
      '  <script>\n' +
      loadScript +
      '  </script>\n' +
      '</body>\n' +
      '</html>\n';
  };

  return Creator;
}());
