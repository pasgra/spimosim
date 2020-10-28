'use strict';

window.spimosimCreator = (function() {
  var ALL_LIBS = {
    spimosim: {
      link:    'http://spimosim.pascalgrafe.net',
      name:    'SpiMoSim',
      license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
      files: [
        'lib/spimosimCore/polyfill.js',
        'lib/spimosimCore/spimosimCore.js',
        'lib/spimosimCore/tools.js',
        'lib/spimosimCore/LICENSE.txt',
        'lib/spimosimUi/polyfill.js',
        'lib/spimosimUi/css/spimosim-dark.css',
        'lib/spimosimUi/css/tabs.css',
        'lib/spimosimUi/css/spimosim.css',
        'lib/spimosimUi/model-changer.js',
        'lib/spimosimUi/movable-sections.js',
        'lib/spimosimUi/dark-theme-switch.js',
        'lib/spimosimUi/spimosimUi.js',
        'lib/spimosimUi/graphic-tools.js',
        'lib/spimosimUi/LICENSE.txt',
        'lib/spimosimUi/icon/buffering.svg',
        'lib/spimosimUi/icon/skip-to-first.svg',
        'lib/spimosimUi/icon/expand.svg',
        'lib/spimosimUi/icon/rendering.gif',
        'lib/spimosimUi/icon/settings-rotating-css.svg',
        'lib/spimosimUi/icon/favicon.png',
        'lib/spimosimUi/icon/restart-white.svg',
        'lib/spimosimUi/icon/ending-mode.svg',
        'lib/spimosimUi/icon/tools.svg',
        'lib/spimosimUi/icon/light/skip-to-first.svg',
        'lib/spimosimUi/icon/light/settings-rotating-css.svg',
        'lib/spimosimUi/icon/light/ending-mode.svg',
        'lib/spimosimUi/icon/light/tools.svg',
        'lib/spimosimUi/icon/light/restart.svg',
        'lib/spimosimUi/icon/light/buffering-done-blue.svg',
        'lib/spimosimUi/icon/light/buffering-blue.svg',
        'lib/spimosimUi/icon/light/pause.svg',
        'lib/spimosimUi/icon/light/ok.svg',
        'lib/spimosimUi/icon/light/prev-model.svg',
        'lib/spimosimUi/icon/light/next-model.svg',
        'lib/spimosimUi/icon/light/settings-rotating.svg',
        'lib/spimosimUi/icon/light/settings.svg',
        'lib/spimosimUi/icon/light/close.svg',
        'lib/spimosimUi/icon/light/buffering-blue-css.svg',
        'lib/spimosimUi/icon/light/delete-old-data.svg',
        'lib/spimosimUi/icon/light/drawing.svg',
        'lib/spimosimUi/icon/light/play.svg',
        'lib/spimosimUi/icon/light/skip-to-last.svg',
        'lib/spimosimUi/icon/light/info.svg',
        'lib/spimosimUi/icon/light/endless-mode.svg',
        'lib/spimosimUi/icon/light/time-plus.svg',
        'lib/spimosimUi/icon/light/grab.svg',
        'lib/spimosimUi/icon/restart.svg',
        'lib/spimosimUi/icon/buffering-done-blue.svg',
        'lib/spimosimUi/icon/buffering-blue.svg',
        'lib/spimosimUi/icon/pause.svg',
        'lib/spimosimUi/icon/ok.svg',
        'lib/spimosimUi/icon/prev-model.svg',
        'lib/spimosimUi/icon/next-model.svg',
        'lib/spimosimUi/icon/buffering-css.svg',
        'lib/spimosimUi/icon/settings-rotating.svg',
        'lib/spimosimUi/icon/settings.svg',
        'lib/spimosimUi/icon/close.svg',
        'lib/spimosimUi/icon/white-settings.svg',
        'lib/spimosimUi/icon/buffering-blue-css.svg',
        'lib/spimosimUi/icon/delete-old-data.svg',
        'lib/spimosimUi/icon/drawing.svg',
        'lib/spimosimUi/icon/play.svg',
        'lib/spimosimUi/icon/skip-to-last.svg',
        'lib/spimosimUi/icon/info.svg',
        'lib/spimosimUi/icon/endless-mode.svg',
        'lib/spimosimUi/icon/time-plus.svg',
        'lib/spimosimUi/icon/grab.svg',
        'lib/spimosimUi/icon/favicon.svg',
        'lib/modules/Video/API',
        'lib/modules/PlotComputer/API',
        'lib/modules/PlotDisplay/API',
        'lib/modules/DataAggregator/API',
        'lib/modules/SimulationBackend/API',
        'lib/modules/ProtocolVar/API',
        'lib/modules/VarInitializer/API',
        'lib/modules/HelpTextGenerator/API',
        'lib/modules/ControlsAddOn/API',
        'lib/modules/createDrawModes/API',
        'lib/modules/FitBackend/API',
        'lib/modules/PlotBackend/API',
        'lib/modules/SettingsPreprocessor/API'
      ]
    },
    spimosimDoc: {
      link:    'http://spimosim.pascalgrafe.net',
      name:    'SpiMoSimDoc',
      license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
      files: [
        'lib/spimosimDoc/spimosimDoc.js',
      ]
    },
    spimosimCreator: {
      link:    'http://spimosim.pascalgrafe.net',
      name:    'SpiMoSimCreator',
      license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
      files: [
        'lib/spimosimCreator/modules-meta.js',
        'lib/spimosimCreator/spimosim-data-flow.dia',
        'lib/spimosimCreator/spimosimCreator.js',
        'lib/spimosimCreator/creator.css',
        'lib/spimosimCreator/index.html',
        'lib/spimosimCreator/spimosim-data-flow.svg'
      ]
    },
    spimosimNetworkCore: {
      link:    'http://spimosim.pascalgrafe.net',
      name:    'SpiMoSimNetwork',
      license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
      files: [
        'lib/spimosimNetwork/networkCore.js',
      ]
    },
    spimosimNetworkUi: {
      link:    'http://spimosim.pascalgrafe.net',
      name:    'SpiMoSimNetwork',
      license: 'http://spimosim.pascalgrafe.net/LICENSE.txt',
      files: [
        'lib/spimosimNetwork/networkUi.js',
      ]
    },
    modernizr: {
      link:    'https://modernizr.com/',
      name:    'Modernizr',
      license: '../ext_lib/lib/modernizr/modernizr-custom.js',
      files: [
        'ext_lib/lib/modernizr/modernizr-custom.js',
      ]
    },
    jszip: {
      link:    'https://stuk.github.io/jszip/',
      name:    'JSZip',
      license: '../ext_lib/lib/jszip/LICENSE.markdown',
      files: [
        'ext_lib/lib/jszip/jszip.js',
        'ext_lib/lib/jszip/LICENSE.markdown'
      ]
    },
    dygraph: {
      link:    'http://dygraphs.com/',
      name:    'Dygraph',
      license: '../ext_lib/lib/dygraph/dygraph-2.0.0.min.js',
      files: [
        'ext_lib/lib/dygraph/dygraph-2.0.0.min.js',
        'ext_lib/lib/dygraph/dygraph.css'
      ]
    },
    gifjs: {
      link:    'https://jnordberg.github.io/gif.js/',
      name:    'gif.js',
      license: '../ext_lib/lib/gif.js/LICENSE',
      files: [
        'ext_lib/lib/gif.js/gif.js',
        'ext_lib/lib/gif.js/LICENSE',
        'ext_lib/lib/gif.js/gif.worker.js'
      ]
    },
    visjs: {
      link:    'http://visjs.org/',
      name:    'vis.js',
      license: '../ext_lib/lib/vis.js/vis-network.min.js',
      files: [
        'ext_lib/lib/vis.js/vis-network.min.js'
      ]
    },
    numericjs: {
      link:    'http://www.numericjs.com/',
      name:    'numeric.js',
      license: '../ext_lib/lib/numeric/license.txt',
      files: [
        'ext_lib/lib/numeric/license.txt',
        'ext_lib/lib/numeric/numeric-1.2.8-2.min.js'
      ]
    }
  };
  

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

    
    this.initGui(divConfig, divPreview);
    
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
    this.domCache.divPreviewError = divPreviewError;
    divPreviewTools.appendChild(divPreviewError);

    var prePreviewError = cE('pre');
    this.domCache.prePreviewError = prePreviewError;
    divPreviewError.appendChild(prePreviewError);
    
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
    this.attachEventListener({
      dispatcher: buttonAddSection,
      type: 'click',
      callback: function () {
        creator.createSection(sectionTypeConfig.getValue());
        creator.updateSectionTypeConfig();
        creator.updatePreview();
      }
    });
    
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
    
    var buttonDownloadCode = cE('button');
    buttonDownloadCode.textContent = 'Download code';
    buttonDownloadCode.className = 'download';
    divButtonsPreview.appendChild(buttonDownloadCode);

    this.attachEventListener({
      dispatcher: buttonDownloadCode,
      type: 'click',
      callback: function () {
        creator.download();
      }
    });
    
    divPreviewTools.appendChild(divNewSection);
    
    divPreviewModel.appendChild(headingModel);
    divPreviewModel.appendChild(main);
    
    var divFooter = cE('div');
    this.domCache.divFooter = divFooter;
    divPreviewModel.appendChild(divFooter);
    
    
    var headingConfig = cE('h1');
    headingConfig.className = 'config-heading';
    headingConfig.textContent = 'Configuration'
    this.domCache.headingConfig = headingConfig;
    divConfig.appendChild(headingConfig);
    
    var headingGeneralConfig = cE('h2');
    headingGeneralConfig.textContent = 'General configuration';
    divConfig.appendChild(headingGeneralConfig);
    
    this.domCache.headingGeneralConfig = headingGeneralConfig;

    var divGeneralConfig = cE('div');
    divGeneralConfig.className = 'settings';
    divConfig.appendChild(divGeneralConfig);
    
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
        labelText: 'Advanced config',
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
      simulationBackendModulUrls: {
        type: 'text',
        labelText: 'Simulation backend modul URLs',
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
    
    this.domCache.configGeneral.title.addEventListener('change', function () {
      creator.updateSnippetElements();
    });

    this.domCache.configGeneral.enableNetworkLib.addEventListener('change', function () {
      creator.updateEnableNetworkLib();
      creator.updateModuleLibs();
    });
    this.domCache.configGeneral.configureClock.addEventListener('change', function () {
      creator.updateConfigureClock();
    });
    this.domCache.configGeneral.simulationBackendType.addEventListener('change', function () {
      creator.updateEditCode();
    });


    var headingParametersConfig = cE('h2');
    headingParametersConfig.textContent = 'Parameter configuration';
    divConfig.appendChild(headingParametersConfig);
    this.domCache.headingParametersConfig = headingParametersConfig;

    var divParametersConfig = cE('div');
    divParametersConfig.className = 'settings';
    divConfig.appendChild(divParametersConfig);
    
    this.domCache.configParameters = graphicTools.createSettings({
      numberOfParameters: {
        labelText: '#Parameters',
        type: 'number',
        min: 0,
        value: 0,
        syncURI: true
      },
    }, divParametersConfig);
    
    this.domCache.configParameters.numberOfParameters.addEventListener('change', function () {
      creator.updateParameterCount();
    });


    this.domCache.configParameter = [];
    this.domCache.divParametersConfig = divParametersConfig;


    var headingStateVarConfig = cE('h2');
    headingStateVarConfig.textContent = 'State variable configuration';
    divConfig.appendChild(headingStateVarConfig);
    this.domCache.headingStateVarConfig = headingStateVarConfig;

    var divStateVarConfig = cE('div');
    divStateVarConfig.className = 'settings';
    divConfig.appendChild(divStateVarConfig);
    
    this.domCache.configStateVars = graphicTools.createSettings({
      numberOfStateVars: {
        labelText: '#State variables',
        type: 'number',
        min: 0,
        value: 0,
        syncURI: true
      },
    }, divStateVarConfig);

    this.domCache.configStateVars.numberOfStateVars.addEventListener('change', function () {
      creator.updateStateVarCount();
    });

    this.domCache.configStateVar = [];
    
    this.domCache.divStateVarConfig = divStateVarConfig;
   
    this.updateStateVarCount();
    
    
    
    var headingVideoConfig = cE('h2');
    headingVideoConfig.textContent = 'Video configuration';
    divConfig.appendChild(headingVideoConfig);
    this.domCache.headingVideoConfig = headingVideoConfig;

    var divVideoConfig = cE('div');
    divVideoConfig.className = 'settings';
    divConfig.appendChild(divVideoConfig);
    
    var configVideo = graphicTools.createSettings({
      createDrawModes: {
        labelText: 'Display modes',
        type: 'select',
        values: [ 'custom canvas', 'spins and flips', 'int map', 'grey scale spins', 'weighted spins', 'other' ],
        texts: [ 'Custom canvas draw mode', 'Network nodes: 1 bit spins', 'Network nodes: Integer values', 'Network nodes: Float values (grey scale)', 'Network nodes: Float values (sign destinction with color)', 'Other' ],
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
      }
    }, divVideoConfig);

    this.domCache.configVideo = configVideo;
    var headingCodeConfig = cE('h2');
    headingCodeConfig.textContent = 'Model code';
    divConfig.appendChild(headingCodeConfig);
    this.domCache.headingCodeConfig = headingCodeConfig;

    var divCode = cE('div');
    divCode.classList.add('settings');
    divCode.classList.add('code-settings');
    divConfig.appendChild(divCode);
    
    var divCodeConfig = cE('div');
    divCodeConfig.className = 'settings';
    divConfig.appendChild(divCodeConfig);
    
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
      advancedCodeConfig: {
        labelText: 'Advanced config',
        type: 'checkbox',
        value: false,
        syncURI: true
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
    }, divCodeConfig);
    
    this.domCache.configCode = configCode;


    var snippetElements = [ cE('pre'), cE('pre'), cE('pre') ];
    this.domCache.snippetElements = snippetElements;
    this.updateCodeSettings();

    divCode.appendChild(snippetElements[0]);
    divCode.appendChild(configCode.changeSettingsFunction.domElement);
    divCode.appendChild(snippetElements[1]);
    divCode.appendChild(configCode.stepFunction.domElement);
    divCode.appendChild(snippetElements[2]);
    

    configCode.editCompleteModelCode.addEventListener('change', function () {
      creator.updateCodeSettings();
    });
    
    configCode.modelObjectName.addEventListener('change', function () {
      creator.updateSnippetElements();
    });
    
    configCode.advancedCodeConfig.addEventListener('change', function () {
      creator.updateCodeSettings();
    });

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
    

    
    
    var divNetwork = cE('div');
    
    var headingNetworkConfig = cE('h2');
    headingNetworkConfig.textContent = 'Network configuration';
    divNetwork.appendChild(headingNetworkConfig);
    this.domCache.headingNetworkConfig = headingNetworkConfig;

    var heading = cE('h3');
    heading.innerText = 'Active types';
    divNetwork.appendChild(heading);

    var divNetworkConfig = cE('div');
    divNetworkConfig.className = 'settings checkbox-line';
    divNetwork.appendChild(divNetworkConfig);
    
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
    var configNetwork = graphicTools.createSettings(networkConfigConfig, divNetworkConfig);

    for (var name in configNetwork) {
      if (configNetwork.hasOwnProperty(name)) {
        configNetwork[name].addEventListener('change', function () {
          creator.updateModuleLibs();
        });
      }
    }

    this.domCache.configNetwork = configNetwork;
    this.domCache.divNetwork = divNetwork;

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

    this.updateConfigureClock();
    this.updateModuleLibs(); 
    this.updateParameterCount();
  };

  Creator.prototype.updateEnableNetworkLib = function () {
    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
      this.domCache.divConfig.appendChild(this.domCache.divNetwork);
    } else {
      this.domCache.divNetwork.remove();
    }
  }

  Creator.prototype.updateConfigureClock = function () {
    if (this.domCache.configGeneral.configureClock.getValue()) {
      this.domCache.divConfig.appendChild(this.domCache.divClock);
    } else {
      this.domCache.divClock.remove();
    }
  }

  Creator.prototype.updateEditCode = function () {
    if (this.domCache.configGeneral.simulationBackendType.getValue() === 'webworker') {
      this.domCache.divConfig.appendChild(this.domCache.divCode);
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
      usedLibs.push('dygraph');
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
  
  Creator.prototype.getNeededFiles = function(withUi) {
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

    return getNeededFiles(dependencies);
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

  function getNeededFiles(dependencies) {
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
            console.log("Warning Terminating sorting.");
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
        var moduleFilesList = info.files;
        for (var j = 0, len2 = moduleFilesList.length; j < len2; j++) {
          var fileName = moduleFilesList[j];
          if (filesList.indexOf(fileName) == -1) {
            filesList.push(fileName);
          }
        }
      } else if (name.startsWith("lib:")) {
        var libFilesList = ALL_LIBS[name.substring(4)].files;
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
    var filesList = this.getNeededFiles();
    for (var i = 0, len = filesList.length; i < len; i++) {
      filesList[i] = "../../../" + filesList[i];
    }
    this.domCache.configGeneral.simulationBackendModulUrls.setValue(filesList.join('\n'));
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
      libLink.href = ALL_LIBS[libName].link;
      libLink.textContent = ALL_LIBS[libName].name;
      usedLib.appendChild(libLink);

      var licenseLink = cE('a');
      licenseLink.className = 'lib-license';
      licenseLink.href = ALL_LIBS[libName].license;
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
      this.initializer.simulation.addEventListener('error', function (e) {
        creator.setErrorMessage(e);
      });
//      this.initializer.simulation.removeEventListener('error', this.initializer.simulation.errorLogger);
    } catch (e) {
      this.setErrorMessage(e);
    }
  };

  Creator.prototype.setErrorMessage = function (e) {
    if (e !== undefined) {
      var msg = 'Error';
      if (e.lineNumber !== undefined) {
        msg += ' in line ' + e.lineNumber;
      }

      if (e.message) {
        msg += ': ' + e.message;
      } else {
        msg = e;
      }

      if (e.stack !== undefined) {
        msg += '\n' + e.stack;
      }
      this.domCache.prePreviewError.textContent = msg;
      this.domCache.divPreviewError.style.display = '';
    } else {
      this.domCache.prePreviewError.textContent = '';
      this.domCache.divPreviewError.style.display = 'none';
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
      this.domCache.divConfig.insertBefore(this.domCache.configParameter[i].domElement, this.domCache.headingStateVarConfig);
    }
    if (created < toShow) {
      for (var i = created; i < toShow; i++) {
        this.domCache.divConfig.insertBefore(this.createParameterConfig(i), this.domCache.headingStateVarConfig);
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
      this.domCache.divConfig.insertBefore(this.domCache.configStateVar[i].domElement, this.domCache.headingCodeConfig);
    }
    if (created < toShow) {
      for (var i = created; i < toShow; i++) {
        this.domCache.divConfig.insertBefore(this.createStateVarConfig(i), this.domCache.headingCodeConfig);
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
    var adv = this.domCache.configCode.advancedCodeConfig.getValue();

    this.domCache.configCode.stepFunction.setVisibility(!editCompl);
    this.domCache.configCode.changeSettingsFunction.setVisibility(!editCompl);
    this.domCache.configCode.modelCode.setVisibility(editCompl);
    this.domCache.configCode.modelObjectName.setVisibility(adv && !editCompl);
    this.domCache.configCode.advancedCodeConfig.setVisibility(!editCompl);
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
      labelText: 'Advanced config',
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

    config['varNameP' + pCounter].addEventListener('change', function () {
      headingParameterConfig.textContent = config['varNameP' + pCounter].getValue();
    });
    config['typeP' + pCounter].addEventListener('change', function () {
      creator.updateModuleLibs();
    });
      
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
    
    var config = graphicTools.createSettings(stateVarConfigConfig, divStateVarConfig);
    
    config['varNameSV' + sVCounter].addEventListener('change', function () {
      headingStateVarConfig.textContent = config['varNameSV' + sVCounter].getValue();
    });
    
    config['typeSV' + sVCounter].addEventListener('change', function () {
      creator.updateModuleLibs();
    });
      
    headingStateVarConfig.textContent = config['varNameSV' + sVCounter].getValue();
    
    container.appendChild(headingStateVarConfig);
    container.appendChild(divStateVarConfig);
    
    this.domCache.configStateVar[sVCounter] = {
      config: config,
      domElement: container
    };

    return container;
  }

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
    if (fromSeperateFunctions || !this.domCache.configCode.advancedCodeConfig.getValue() || !this.domCache.configCode.editCompleteModelCode.getValue()) { 
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
        
        urlsString = this.domCache.configGeneral.simulationBackendModulUrls.getValue();
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
        type: values.type
      }

      if (values.plot) {
        stateVarConfig.plot = {
          description: values.plotDescription,
          optionText: values.plotOptionText
        };
        defaultPlotList.push(values.varName);
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
      config.plotter.urls = urls.split('\n');
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
    
    if (usedLibs.indexOf('modernizr') !== -1) {
      zip.folder('ext_lib/lib/modernizr');
    }
    
    if (usedLibs.indexOf('gifjs') !== -1) {
      zip.folder('ext_lib/lib/gif.js');
    }
    
    if (usedLibs.indexOf('numeric') !== -1) {
      zip.folder('ext_lib/lib/numeric');
    }
    

    zip.file('model/model-config.js', "spimosimCore.modules.add('ModelConfig', '" + config.info.title + "', " + JSON.stringify(config, null, 2) + ')');
    zip.file('model/model.js', this.parseModelSourceCode());
    zip.file('model/index.html', this.getIndexHTML(config));
    if (this.domCache.configGeneral.url.getValue() === 'model-info.html') {
      zip.file('model/model-info.html', this.domCache.configGeneral.description.getValue());
    }
    
    var downloads = [
      'ext_lib/css/sliders.css',
      'ext_lib/css/radio-checkbox.css'
    ].concat(this.getNeededFiles(true));
    for (var i = 0; i < usedLibs.length; i++) {
      downloads = downloads.concat(ALL_LIBS[usedLibs[i]].files);
    }

    var counter = downloads.length;
    function addFromURL(source, dest) {
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
          console.log(this.status, dest);
        }
      };
      request.onerror = function (e) {
        console.log(e);
      }

      request.send();
    }

    for (var i = 0, len = downloads.length; i < len; i++) {
      addFromURL('../' + downloads[i], downloads[i]);
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
    if (usedLibs.indexOf('modernizr') !== -1) {
      scriptsHTML += '  <script src="../ext_lib/lib/modernizr/modernizr-custom.js"></script>\n';
    }
    
    if (usedLibs.indexOf('dygraph') !== -1) {
      scriptsHTML += '  <script src="../ext_lib/lib/dygraph/dygraph-2.0.0.min.js"></script>\n';
    }
    
    if (usedLibs.indexOf('gifjs') !== -1) {
      scriptsHTML += '  <script src="../ext_lib/lib/gif.js/gif.js"></script>\n';
    }

    if (usedLibs.indexOf('numeric') !== -1) {
      scriptsHTML += '  <script src="../ext_lib/lib/numeric/numeric-1.2.8-2.min.js"></script>\n';
    }

    if (usedLibs.indexOf('visjs') !== -1) {
      scriptsHTML += '  <script src="../ext_lib/lib/vis.js/vis-network.min.js"></script>\n';
    }
    
    scriptsHTML += '\n' +
      '  <script src="../lib/spimosimCore/polyfill.js"></script>\n' +
      '  <script src="../lib/spimosimCore/tools.js"></script>\n' +
      '  <script src="../lib/spimosimCore/spimosimCore.js"></script>\n' +
      '  \n' +
      '  <script src="../lib/spimosimUi/polyfill.js"></script>\n' +
      '  <script src="../lib/spimosimUi/graphic-tools.js"></script>\n' +
      '  <script src="../lib/spimosimUi/spimosimUi.js"></script>\n' +
      '  <script src="../lib/spimosimUi/model-changer.js"></script>\n';
    if (this.domCache.configGeneral.movableSections.getValue()) {
      scriptsHTML += '  <script src="../lib/spimosimUi/movable-sections.js"></script>\n';
    }
    
    var moduleFiles = this.getNeededFiles(true);
    for (var i = 0, len = moduleFiles.length; i < len; i++) {
      if (moduleFiles[i].endsWith(".js")) {
        if (!moduleFiles[i].endsWith(".worker.js")) {
          scriptsHTML += '  <script src="../' + moduleFiles[i] + '"></script>\n';
        }
      } else if (moduleFiles[i].endsWith(".css")) {
        scriptsHTML += '  <link rel="stylesheet" href="../' + moduleFiles[i] + '" />\n';
      }
    }

    if (this.domCache.configGeneral.enableNetworkLib.getValue()) {
        '  <script>spimosimNetwork.MAX_NODES = 65536</script>\n';
    }

    scriptsHTML += '\n' +
      '  <script src="../lib/spimosimUi/dark-theme-switch.js"></script>\n' +
      '  <script src="model-config.js"></script>\n';
    
    var stylesHTML = '';
    if (usedLibs.dygraph) {
      stylesHTML += '  <link rel="stylesheet" href="../ext_lib/lib/dygraph/dygraph.css" />\n';
    }
    stylesHTML +=
      '  <link rel="stylesheet" href="../ext_lib/css/radio-checkbox.css" />\n' +
      '  <link rel="stylesheet" href="../ext_lib/css/sliders.css" />\n' +
      '  <link rel="stylesheet" href="../lib/spimosimUi/css/spimosim.css" />\n' +
      '  <link rel="stylesheet" href="../lib/spimosimUi/css/spimosim-dark.css" />\n';
    
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
