/* Copyright 2018 Pascal Grafe - MIT License */
'use strict';
/* 
 * 
 * GUI for the SpiMoSim relying on spimosimCore.js
 *
 * depends on:
 *   spimosimCore.js ( + tools.js)
 *   graphicTools.js
 *   video.js (or your user defined file to define video players)
 *   (The file polyfill.js is needed to extend browser support.)
 *
 *
 * Modules:
 * - Simulation
 *    * Simulation
 *       Extends spimosimCore.SimulationFrontEnd a little
 *
 * - Color management
 *    * IntColorSet
 *       Stores colors as integers for efficient processing
 *    * colorSet
 *       An IntColorSet
 *
 * - Init GUI
 *    * Initializer
 *       Manages the simulation, controls, videos, plotters and downloader
 *
 * - Controls
 *    * Controls
 *       A GUI element with the model settings and simulation controls.
 *       It is highly configurable.
 *
 * - Display of current state / Video
 *    * Video
 *       A GUI element, containing an canvas, drawing and download options.
 *       This is an abstract Object that needs to be extended.
 *    * DynamicVideo
 *       Extends Video to an actual video player with a time bar, a play button
 *       and more. This is an abstract object that needs to be extended.
 *
 * - Plots
 *    * BasicPlotter
 *       A GUI element to create plots. Used by plots to create deduced plots.
 *    * Plotter
 *       Extends BasicPlotter to keep or delete plots from previous simulations.
 *    * PlotDisplay
 *       A PlotDisplay based on data from a spimosimCore.DataAggregator.
 *    * TimePlotDisplay
 *       A PlotDisplay based on data from a spimosimCore.TimeDataAggregator.
 *    * MultiSeriesTimePlotDisplay
 *       A PlotDisplay based on data from a spimosimCore.MultiSeriesTimeDataAggregator.
 *   
 * - Fits
 *    Some plots support fitting their data. This is done by the following
 *    objects:
 *    * Fit
 *       A fit with a user defined functions. Uses spimosimCore.HeadlessFit
 *    * Fitter
 *       Creates fits and manages fits. Uses spimosimCore.HeadlessFitter
 *    
 * - Other
 *    * Downloader
 *       A simple GUI element that lists every download that is created at
 *       the moment.
 *    * ModelInfo
 *       Displays information about the current model.
 *    * Help
 *       Displays information how to use SpiMoSim.
 */

self.spimosimUi = (function () {
  var modules = spimosimCore.modules,
    EventDispatcher = tools.EventDispatcher,
    EventAttacher = tools.EventAttacher,
    FeatureActivatable = tools.FeatureActivatable;
  
  function cE(type) {
    return document.createElement(type);
  }


  modules.newRegister('ControlsAddOn');
  modules.newRegister('VarInitializer');
  modules.newRegister('Video');
  modules.newRegister('createDrawModes');
  modules.newRegister('HelpTextGenerator');
  modules.newRegister('ModelConfig');
  modules.newRegister('PlotDisplay').add = function (type, Constructor, prototypeFns, fns) {
    var C = tools.Register.prototype.add.call(this, type, Constructor, prototypeFns, fns);
    C.prototype.plotType = type;
    return C;
  };

  /* ---------------------------------SIMULATION----------------------------- */

  function Simulation(controls, backendSettings, compactName) {
    this.controls = controls;
    this.compactName = compactName;

    this.tMaxCalculated = -1;//There are no saved frames. The next frame is the initial one with tMaxCalculated = 0
    this.tMax = this.getTMax();//The number of frames that should be simulated

    tools.copyInto(this.controls.parseBackendSettings(), backendSettings);

    spimosimCore.SimulationFrontend.call(this, backendSettings);//Create backend and protocol

    this.changeBackendSettings(backendSettings, false);//send settings to backend

    var simulation = this;
    this.addEventListener('new data', function (e) {
      controls.setProgress(e.t);//Update progress when receiving new data
    });

    this.addEventListener('done', function () {
      controls.showThatSimulationIsDone();//Tell controls that the simulation is done
    });

    //Get settings from HTML using the controls
    var modelSettings = controls.parseModelSettings(false);//Settings for the model
    this.changeModelSettings(modelSettings, true);

    this.resume();//Start the simulation
  }
  Simulation.prototype = Object.create(spimosimCore.SimulationFrontend.prototype);

  Simulation.prototype.changeModelSettings = function (modelSettings, restart) {
    restart = restart || !modelSettings.continuable;
    spimosimCore.SimulationFrontend.prototype.changeModelSettings.call(this, modelSettings, restart);

    this.tMax = this.getTMax();//The number of frames that should be simulated
    this.controls.setProgressMax(this.tMax);
  };

  /*
   * Returns t for the last frame that should be simulated but not less than
   * the last simulated and received frame.
   */
  Simulation.prototype.getTMax = function () {
    return Math.max(this.controls.getTToSimulate(), this.tMaxCalculated);
  };

  /*
   * Tell controls and backend to resume the simulation.
   */
  Simulation.prototype.resume = function () {
    this.controls.showThatSimulationIsRunning();

    spimosimCore.SimulationFrontend.prototype.resume.call(this);
  };

  /*
   * Sends new settings to the backend and updates the progress maximum.
   */
  Simulation.prototype.changeBackendSettings = function (backendSettings, resume) {
    if (!backendSettings) {
      backendSettings = this.controls.parseBackendSettings();
    }

    this.tMax = backendSettings.tMax;
    this.controls.setProgressMax(this.tMax);
    this.controls.showThatSimulationIsRunning();

    spimosimCore.SimulationFrontend.prototype.changeBackendSettings.call(this, backendSettings, resume);
  };

  Simulation.prototype.getParametersForFileName = function () {
    var settings = this.modelSettings,
      lines = [];

    if (settings) {
      var section = settings.parameters;
      for (var name in section) {
        if (section.hasOwnProperty(name)) {
          var value = section[name];
          var type = typeof value;
          switch (type) {
            case 'string':
              lines.push(name + '=' + graphicTools.toValidFileName(value));
              break;
            case 'number':
            default:
              lines.push(name + '=' + value);
          }
        }
      }
    }

    return lines.join('&');
  }


  /* ---------------------------------CLOCK--------------------------------- */

  function Clock(initializer, config, smallDefaultBuffer) {
    EventDispatcher.call(this, [ 'fps change', 'endless mode change', 'retard', 'slow down', 'ignore', 'stop', 'start', 'end' ]);
    var defaultBuffer;
    if (smallDefaultBuffer) {
      defaultBuffer = 1.5;//1.5 seconds
    } else {
      defaultBuffer = 20;//20 seconds
    }
    var minimalShownFuture = smallDefaultBuffer && !(config !== undefined && config.buffer !== undefined && config.buffer.shownFuture !== undefined && config.buffer.shownFuture.seconds !== undefined);
    this.config = tools.copyInto(config, {
      endlessMode: true,
      fps: {
        min: 1,
        max: 4000,
        step: 1,
        value: 30,
        disabled: false,
        key: 'f',
        name: 'fps',
        labelText: 'fps',
        logScale: true
      },
      buffer: {
        internal: {
          seconds: defaultBuffer,//Buffer 20s
        },
        shownFuture: {
          seconds: .5 * defaultBuffer, //Show half the buffer as preview of the future or no future
          steps: minimalShownFuture ? 1 : undefined
        },
        shownHistory: {
          seconds: 10,//Show 10s of history
        },
        trigger: {
          seconds: .75 * defaultBuffer//Start buffering if buffer gets smaller than 75% of the wanted size
        }
      },
      onSlowSimulation: 'retard'//'ignore', 'retard' or 'slow down'
    });
    
    this.t0Time = undefined;
    this.t = 0;
    this.isRunning = false;
    this.fps = this.config.fps.value;
    this.endlessMode = this.config.endlessMode;
    this.msPerFrame = 1000 / this.fps;
    this.initializer = initializer;
    this.animators = [];
    this.addAnimator(this);
  }
  Clock.prototype = Object.create(EventDispatcher.prototype);

  Clock.prototype.setT = function (t) {
    this.t = t;
    if (this.isRunning) {
      this.t0Time = Date.now() - t * this.msPerFrame;
    }
  };
  
  Clock.prototype.destroy = function () {
    this.removeAnimator(this);
  };
  
  Clock.prototype.getT = function () {
    if (this.isRunning) {
      var now = Date.now(),
        t = (now - this.t0Time) / this.msPerFrame,
        tMax = Infinity;
      if (this.initializer.simulation !== undefined) {
        tMax = this.initializer.simulation.getTMaxCalculated();
      }
      if (t > tMax) {
        switch (this.config.onSlowSimulation) {
          case 'ignore':
            this.dispatchEvent('ignore', this);
            break;
          case 'slow down':
            t = Math.max(0, tMax);
            this.t0Time = now - t * this.msPerFrame - 8;
            if (tMax > 2 * this.fps) {//do not slow down in first 2s
              this.setFps(Math.max(1, Math.floor(this.fps * .95)), t);
              this.dispatchEvent('slow down', this);
            }
            break;
          case 'retard':
            t = Math.max(0, tMax);
            this.t0Time = now - t * this.msPerFrame - 8;
            this.dispatchEvent('retard', this);
            break;
          default:
            throw 'Error: Unknown value for clock.onSlowSimulation.';
        }
      }

      if (this.initializer.simulation !== undefined && !this.endlessMode && t === this.initializer.simulation.getTMax()) {
        this.dispatchEvent('end', this);
        this.stop(t);
      }
      return Math.floor(t);//Numerical error??
    } else {
      return this.t;
    }
  };

  Clock.prototype.getShownTMax = function (t) {
    var shownTMax;
    if (this.endlessMode) {
      if (t === undefined) {
        t = this.getT();
      }

      if (this.config.buffer.shownFuture.steps !== undefined) {
        shownTMax = t + this.config.buffer.shownFuture.steps;
      } else {
        shownTMax = t + Math.floor(this.config.buffer.shownFuture.seconds * this.fps);
      }
    } else {
      shownTMax = this.initializer.controls.lastValidTMax;
    }
    return shownTMax;
  };

  Clock.prototype.getTMax = function (t) {
    if (this.initializer.simulation !== undefined) {
      return this.initializer.simulation.protocol.tMax;
    } else {
      return this.getShownTMax(t);
    }
  };

  Clock.prototype.getShownTMin = function (t) {
    var shownTMin;
    if (this.endlessMode) {
      if (t === undefined) {
        t = this.getT();
      }

      if (this.config.buffer.shownHistory.steps !== undefined) {
        shownTMin = t - this.config.buffer.shownHistory.steps;
      } else {
        shownTMin = t - Math.floor(this.config.buffer.shownHistory.seconds * this.fps);
      }
    } else {
      shownTMin = -Infinity;
    }
    if (this.initializer.simulation !== undefined) {
      return Math.max(this.initializer.simulation.protocol.tMin, shownTMin);
    } else {
      return shownTMin;
    }
  };

  Clock.prototype.getTMin = function (t) {
    if (this.initializer.simulation !== undefined) {
      return this.initializer.simulation.protocol.tMin;
    } else {
      return this.getShownTMin(t);
    }
  };

  Clock.prototype.setFps = function (fps, t) {
    if (t === undefined) {
      t = this.getT();
    }
    this.fps = fps;
    this.msPerFrame = 1000 / fps;
    this.t0Time = Date.now() - this.msPerFrame * t;
    this.dispatchEvent('fps change', this);
  };

  Clock.prototype.setEndlessMode = function (endlessMode) {
    this.endlessMode = endlessMode;
    this.dispatchEvent('endless mode change', this);
  };
  
  Clock.prototype.toggleEndlessMode = function () {
    this.setEndlessMode(!this.endlessMode);
  };

  Clock.prototype.createFpsRangeInput = function (customFpsConfig) {
    var fpsConfig = tools.copyInto(this.config.fps, {
      min: 1,
      value: 30,
      max: 4000,
      step: 1,
      labelText: 'fps',
      type: 'range'
    });

    if (customFpsConfig !== undefined) {
      tools.copyInto(customFpsConfig, fpsConfig);
    }

    var element = graphicTools.createSetting(fpsConfig);
    
    var clock = this;
    element.addEventListener('change', function () {
      clock.setFps(element.getValue());
    });
    
    this.addEventListener('fps change', function (clock) {
      element.setValue(clock.fps, false);
    });

    return element;
  };
  
  Clock.prototype.buffer = function (t) {
    if (t === undefined) {
      t = this.getT();
    }
    var triggerSteps;
    if (this.config.buffer.trigger.steps !== undefined) {
      triggerSteps = this.config.buffer.trigger.steps;
    } else {
      triggerSteps = this.config.buffer.trigger.seconds * this.fps;
    }
    if (this.initializer.controls.lastValidTMax <= t + triggerSteps) {
      var bufferSteps;
      if (this.config.buffer.internal.steps !== undefined) {
        bufferSteps = this.config.buffer.internal.steps;
      } else {
        bufferSteps = Math.ceil(this.config.buffer.internal.seconds * this.fps);
      }
      if (this.initializer.simulation !== undefined) {
        bufferSteps = Math.min(this.initializer.simulation.protocol.getMaxSteps(), bufferSteps);
      }
      this.initializer.controls.setTToSimulate(t + bufferSteps);
    }
  };
  
  Clock.prototype.draw = function (t) {
    if (this.endlessMode) {
      this.buffer();
    }
  };

  Clock.prototype.setIsRunning = function (isRunning, t) {
    if (this.isRunning !== isRunning) {
      if (this.isRunning) {
        if (t === undefined) {
          t = this.getT();
        }
        this.t = t;
        this.t0Time = undefined;
        this.isRunning = false;
        this.dispatchEvent('stop', this);
      } else {
        this.t0Time = Date.now() - this.msPerFrame * this.t;
        this.isRunning = true;
        this.dispatchEvent('start', this);
      }
    }
  };

  Clock.prototype.stop = function (t) {
    this.setIsRunning(false, t);
  };

  Clock.prototype.start = function () {
    this.setIsRunning(true);
  };
  
  Clock.prototype.toggleIsRunning = function (t) {
    this.setIsRunning(!this.isRunning, t)
  };

  Clock.prototype.addAnimator = function (animator) {
    var wrappedAnimator = {
      animator: animator,
      id: null
    };
    this.animators.push(wrappedAnimator);
    this.requestAnimationFrame(wrappedAnimator);
  };

  Clock.prototype.removeAnimator = function (animator) {
    for (var i = 0, len = this.animators.length; i < len; i++) {
      if (this.animators[i].animator === animator) {
        cancelAnimationFrame(this.animators[i].id);
        this.animators.splice(i, 1);
        return;
      }
    }
  };
  
  Clock.prototype.requestAnimationFrame = function (wrappedAnimator) {
    var clock = this;
    wrappedAnimator.id = requestAnimationFrame(function() {
      clock.callAnimator(wrappedAnimator);
    });
  };

  Clock.prototype.callAnimator = function (wrappedAnimator) {
    wrappedAnimator.animator.draw(this);
    this.requestAnimationFrame(wrappedAnimator);
  };


  /* ---------------------------------COLORS--------------------------------- */

  var IntColorSet = (function () {
    function str2IntLittleEndian(str) {
      var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str),
        red = parseInt(components[1], 16),
        green = parseInt(components[2], 16),
        blue = parseInt(components[3], 16),
        alpha = 255;
      if (components[4] !== undefined) {
        alpha = parseInt(components[4], 16);
      }

      return (alpha << 24) + (blue << 16) + (green << 8) + red;
    };

    function str2IntBigEndian(str) {
      var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(str),
        red = parseInt(components[1], 16),
        green = parseInt(components[2], 16),
        blue = parseInt(components[3], 16),
        alpha = 255;

      if (components[4] !== undefined) {
        alpha = parseInt(components[4], 16);
      }
      
      return (red << 24) + (green << 16) + (blue << 8) + alpha;
    };

    function int2StrLittleEndian(val) {
      if (!isFinite(val)) {
        throw 'Invalid color int';
      }

      var red = val & 0xff,
        green = (val >> 8) & 0xff,
        blue = (val >> 16) & 0xff,
        val = (red << 16) + (green << 8) + blue;

      return '#' + ('00000' + (val & 0xffffff).toString(16)).substr(-6);
    };

    function int2StrBigEndian(val) {
      if (!isFinite(val)) {
        throw 'Invalid color int';
      }

      return '#' + ('00000' + (val >> 8 & 0xffffff).toString(16)).substr(-6);
    };

    var str2Int, int2Str;

    if (tools.ENDIAN === 'big') {
      str2Int = str2IntBigEndian;
      int2Str = int2StrBigEndian;
    } else if (tools.ENDIAN === 'little') {
      str2Int = str2IntLittleEndian;
      int2Str = int2StrLittleEndian;
    } else {
      throw 'Cannot convert colors: unknown endianess.';
    }

    function IntColorSet(strColorSet) {
      this.strColorSet = strColorSet;
      this.str2IntMap = {};
      this.int2StrMap = {};

      for (var name in strColorSet) {
        if (strColorSet.hasOwnProperty(name)) {
          var value = strColorSet[name];
          if (typeof value === 'string') {
            var asInt = str2Int(value);
            this[name] = asInt;
            this.str2IntMap[value] = asInt;
            this.int2StrMap[asInt] = value;
          } else if (Array.isArray(value)) {
            this[name] = [];

            for (var i = 0, len = value.length; i < len; i++) {
              var asInt = str2Int(value[i]);
              this[name][i] = asInt;
              this.str2IntMap[value[i]] = asInt;
              this.int2StrMap[asInt] = value[i];
            }
          }
        }
      }
    }

    IntColorSet.str2Int = str2Int;
    IntColorSet.int2Str = int2Str;

    return IntColorSet;
  }());

  var colorSet = (function () {
    var RGB_STR_GREY = '#708090',
      RGB_STR_RED = '#b40431',
      RGB_STR_SLATEGREY = '#708090',
      RGB_STR_DARKSLATEGREY = '#2d4f4f',
      RGB_STR_LIGHTGREY = '#e0e5f1',
      RGB_STR_STEELBLUE = '#4682b4',

      RGB_STR_INVALID = RGB_STR_RED,
      RGB_STR_NEUTRAL = RGB_STR_GREY;

    return {
      NEUTRAL: RGB_STR_NEUTRAL,
      INVALID: RGB_STR_INVALID,
      THEME_MAIN: RGB_STR_STEELBLUE,
      THEME_NORMAL: RGB_STR_SLATEGREY,
      THEME_DARK: RGB_STR_DARKSLATEGREY,
      THEME_LIGHT: RGB_STR_LIGHTGREY
    };
  }());


  /* -------------------------------INITIALIZER----------------------------- */

  function Initializer(sections) {
    this.sections = sections;
    this.videos = [];
    this.plotters = [];

    if (sections.plotter && sections.plotter.length > 0) {
      BasicPlotter.generateFallbackColors(sections.plotter[0]);
    }

    /* Check for deprecated plot descriptions */
    var Constructors = spimosimCore.modules.registers.PlotDisplay.registeredConstructors,
      types = Object.keys(Constructors);
    for (var i = 0, len = types.length; i < len; i++) {
      if (Constructors[types[i]].description) {
        throw 'Attaching plot description to the constructor is deprecated! Attach the description to the prototype instead! (' + types[i]+ ')';
      }
    }
  }

  Initializer.prototype.initModel = function (modelConfig) {
    if (this.sections.controls === undefined) {
      this.sections.controls = cE('section');//dummy element
    }
    
    
    this.modelConfig = modelConfig;
    if (modelConfig.video && modelConfig.video.colorSet) {
      throw 'Defining color sets in the video section is no longer supported. Use top level configuration instead.';
    }

    var parameters = modelConfig.controls.parameters;
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name) && !parameters[name].hasOwnProperty("syncURI")) {
        parameters[name].syncURI = true;
      }
    }

    var strColorSet = tools.copyInto(colorSet, {});
    if (modelConfig.colorSet) {
      tools.copyInto(modelConfig.colorSet, strColorSet);
    }
    this.colorSet = new IntColorSet(strColorSet);

    this.createHelp();
    this.setInfo();

    this.createClock();
    this.createDownloader();
    this.createControls();

    this.createStateVariablePlotDisplays();

    this.destroyVideos();
    this.destroyPlotters();

    this.start(false);
  };

  Initializer.prototype.createStateVariablePlotDisplays = function () {
    var varsConfig = this.modelConfig.controls.stateVariables;
    this.stateVariablePlotTypes = [];
    for (var name in varsConfig) {
      if (varsConfig.hasOwnProperty(name) && varsConfig[name].plot) {
        if (!modules.exists('PlotDisplay', name)) {
          modules.add('PlotDisplay',
            {
              name: name,
              files: [],
              depends: [],
              version: '1.0',
              author: 'spimosim',
              description: 'Auto generated by spimosim',
              date: '2020-03-26'
            },
            TimePlotDisplay,
            {
              description: varsConfig[name].plot.description || 'No description! Add description in modelConfig as controls.stateVariables.plot.description!',
              customConstructor: function (plotter, settings) {
                settings.varName = this.varName,
                TimePlotDisplay.call(this, plotter, settings);
              },
              varName: name,
              getNewDataAggregator: function (plotter, settings) {
                return new (modules.get('DataAggregator', 'protocol'))(plotter, settings);
              },
              getPlotOptions: (function (name) {
                  return function () {
                    return {
                      title: name,
                      xlabel: 't',
                      labels: this.getSeriesLabels(true),
                      digitsAfterDecimal: 10
                    };
                  };
                })(varsConfig[name].plot.optionText || name)
            },
            {
              optionText: varsConfig[name].plot.optionText || name,
            }
          );
        }
        this.stateVariablePlotTypes.push(name);
      }
    }
  };

  Initializer.prototype.createClock = function () {
    this.clock = new Clock(this, this.modelConfig.clock, this.modelConfig.simulation.continuableWithNewSettings);
  };

  Initializer.prototype.createControls = function () {
    var controlsSection = this.sections.controls;
    this.controls = new Controls(this, this.modelConfig, controlsSection);
  };

  Initializer.prototype.destroyPlotters = function () {
    this.plotters.forEach(function (plotter) {
      plotter.destroy();
    });
    this.plotters = [];
  };

  Initializer.prototype.createPlotters = function () {
    var plotterSections = this.sections.plotter;

    if (plotterSections) {
      var fitBackendConfig = this.modelConfig.fitter !== undefined ?
        this.modelConfig.fitter.backend : undefined;
  
      var config = this.modelConfig.plotter;
      for (var i = 0, len = plotterSections.length; i < len; i++) {
        var thisConfig = config;
        if (Array.isArray(config)) {
          thisConfig = config[i % config.length];
        }
        if (thisConfig.backend === undefined) {
          throw 'Error in config: plotter.backend is undefined';
        }

        thisConfig = tools.copyInto(thisConfig, {
          plotTypes:[]
        });
        thisConfig.plotTypes = thisConfig.plotTypes.concat(this.stateVariablePlotTypes);
        var plotter = new Plotter(this, thisConfig, plotterSections[i], this.colorSet, fitBackendConfig, this.simulation);
        this.plotters.push(plotter);
      }
    }
  };

  Initializer.prototype.createDownloader = function () {
    var downloadsSection = this.sections.downloads;

    if (downloadsSection) {
      this.downloader = new Downloader(downloadsSection);
    } else {
      this.downloader = undefined;
    }
  };

  Initializer.prototype.destroyVideos = function () {
    this.videos.forEach(function (video) {
      video.destroy();
    });
    this.videos = [];
  }

  Initializer.prototype.createVideos = function () {
    var videoSections = this.sections.video;

    if (videoSections) {
      this.currentVideoType = this.simulation.modelSettings.video.type;
      var VP = modules.get('Video', this.currentVideoType);

      for (var i = 0, len = videoSections.length; i < len; i++) {
        var config = this.modelConfig.video;
        if (Array.isArray(config)) {
          config = config[i % config.length];
        }
        var video = new VP(this, config, videoSections[i], this.colorSet);
        this.videos.push(video);
      }
    }
  };

  Initializer.prototype.createHelp = function () {
    var helpSection = this.sections.help;

    if (helpSection && !this.help) {
      this.help = new Help(helpSection, this.modelConfig.info.helpTextId, this.modelConfig.info.iconPath);
    }
  };

  Initializer.prototype.createInfo = function () {
    var infoSection = this.sections.info;

    if (infoSection) {
      this.modelInfo = new ModelInfo(infoSection);
    }
  };

  Initializer.prototype.setInfo = function () {
    if (this.sections.info && !this.modelInfo) {
      this.createInfo();
    }
    if (this.modelInfo && this.modelConfig.info.html) {
      this.modelInfo.setContent(this.modelConfig.info.html);
    } else if (this.modelInfo && this.modelConfig.info.url) {
      this.modelInfo.setContentFromUrl(this.modelConfig.info.url);
    } else if (this.modelInfo) {
      this.modelInfo.setNoContent();
    }
  };

  Initializer.prototype.start = function (automaticStart) {
    this.clock.stop();

    var backendSettings = this.modelConfig.simulation.backend;
    if (backendSettings === undefined) {
      throw 'Error in config: simulation.backend is undefined';
    }

    //Create a simulation that calculates the frames
    if (!this.simulation) {
      this.simulation = new Simulation(this.controls, backendSettings, this.modelConfig.info.compactName || graphicTools.toValidFileName(this.modelConfig.info.title));
      
      this.controls.attachSimulationListeners(this.simulation);
      
      var clock = this.clock;
      this.simulation.addEventListener('first data', function () {
        clock.start();
      });
    } else {
      this.simulation.tMaxCalculated = -1;
      this.simulation.changeBackendSettings(undefined, false);
      var modelSettings = this.controls.parseModelSettings(automaticStart);//Settings for the model
      this.simulation.changeModelSettings(modelSettings, true);

      //Tell controls about the progress of the simulation
      this.controls.setProgress(0);
    }

    this.controls.setMemorySize();


    if (this.currentVideoType !== this.simulation.modelSettings.video.type) {
      this.destroyVideos();
    }

    if (this.videos.length === 0) {
      this.createVideos();
    }

    var simulation = this.simulation;
    this.videos.forEach(function (video) {
      video.setSimulation(simulation);
    });

    if (this.plotters.length === 0) {
      this.createPlotters();
    } else {
      this.plotters.forEach(function (plotter) {
        plotter.setDataSource(simulation);
      });
    }
  };

  Initializer.prototype.deleteOldData = function () {
    this.simulation.protocol.deleteOldData(this.clock.getT());

    this.plotters.forEach(function (plotter) {
      plotter.replotPlots();
    });
  };

  Initializer.prototype.destroyModel = function () {
    if (this.controls) {
      this.controls.destroy();
      this.controls = undefined;
    }

    if (this.downloader) {
      this.downloader.destroy();
      this.downloader = undefined;
    }

    if (this.simulation) {
      this.simulation.destroy();
      this.simulation = undefined;
    }

    if (this.modelInfo) {
      this.modelInfo.destroy();
      this.modelInfo = undefined;
    }

    if (this.help) {
      this.help.destroy();
      this.help = undefined;
    }

    this.destroyVideos();
    this.destroyPlotters();
    
    if (this.clock) {
      this.clock.destroy();
      this.clock = undefined;
    }
  };

  Initializer.prototype.changeModel = function (modelConfig) {
    this.destroyModel();

    this.initModel(modelConfig);
  }

  
  /* ---------------------------------CONTROLS------------------------------- */

  function Controls(initializer, modelConfig, controlsSection) {
    EventAttacher.call(this);
    FeatureActivatable.call(this, modelConfig.controls.features, 'Controls');

    this.modelConfig = modelConfig;
    this.initializer = initializer;
    this.lastValidTMax = Controls.DEFAULT_T_MAX;
    this.isApplyCountdownShown = false;
    this.nextApplyT = -1;

    this.keyMap = {};
    this.varInitializers = {};

    this.invalidParameters = [];
    
    
    this.settingsPreprocessors = [];
    for (var name in modelConfig.controls.preprocess) {
      if (modelConfig.controls.preprocess.hasOwnProperty(name)) {
        this.settingsPreprocessors.push(spimosimCore.modules.get('SettingsPreprocessor', name));
      }
    }

    this.initAddOns();

    for (var addOnName in this.addOns) {
      if (this.addOns.hasOwnProperty(addOnName)) {
        var preprocessorConfig = this.addOns[addOnName].preprocessorConfig;
        for (var name in preprocessorConfig) {
          if (preprocessorConfig.hasOwnProperty(name)) {
            this.settingsPreprocessors.push(spimosimCore.modules.get('SettingsPreprocessor', name));
          }
        }
      }
    }

    var div = this.initGui();
    div.classList.add('controls-container');
    controlsSection.appendChild(div);


    initializer.clock.addAnimator(this);
  }

  Controls.prototype = Object.create(EventAttacher.prototype);
  tools.addToPrototype(Controls, FeatureActivatable);

  Controls.DEFAULT_T_MAX = 200;//Default steps for a simulation
  Controls.DEFAULT_T_PLUS = 200;//Default steps for button 'time plus'

  Controls.prototype.availableFeatures = {
    Controls: [
      { name: 'deleteOldData' },
      { name: 'changeEndlessMode' },
      { name: 'saveVarCheckboxes' },
      { name: 'uploadInitialState' },
      { name: 'select action on changing settings' }
    ]
  };

  Controls.prototype.setAll = function (settings) {
    for (var name in settings) {
      if (settings.hasOwnProperty(name)) {
        this.domCache.inputsModel[name].setValue(settings[name], false);
      }
    }
  };

  Controls.prototype.initAddOns = function () {
    this.addOns = {};
    for (var addOnName in this.modelConfig.controls) {
      if (this.modelConfig.controls.hasOwnProperty(addOnName) &&
          addOnName !== 'features' &&
          addOnName !== 'parameters' &&
          addOnName !== 'preprocess' &&
          addOnName !== 'stateVariables') {
        
        var AddOn = modules.get('ControlsAddOn', addOnName);
        this.addOns[addOnName] = new AddOn(this.modelConfig.controls[addOnName], this);
      }
    }
  };

  var STORAGE_SIZE_TEXTS = [
    '~10 MiB',
    '~20 MiB',
    '~50 MiB',
    '~100 MiB',
    '~200 MiB',
    '~500 MiB',
    '~1000 MiB',
    '~2000 MiB',
    '~5000 MiB',
    '~10000 MiB',
    'unlimited' ];
  var STORAGE_SIZE_VALUES = [
    (10 * (1 << 20)).toString(),
    (20 * (1 << 20)).toString(),
    (50 *  (1 << 20)).toString(),
    (100 * (1 << 20)).toString(),
    (200 * (1 << 20)).toString(),
    (500 * (1 << 20)).toString(),
    (1000 * (1 << 20)).toString(),
    (2000 * (1 << 20)).toString(),
    (5000 * (1 << 20)).toString(),
    (10000 * (1 << 20)).toString(),
    'Infinity' ];

  Controls.prototype.initGui = function () {
    var box = cE('div');

    this.domCache = {};
    this.domCache.box = box;

    box.appendChild(initMenuGui.call(this));
    box.appendChild(initSettingsGui.call(this));

    return box;
  };

  function initMenuGui() {
    var controls = this;
    
    /* A menu to control the simulation */
    var cornerMenuSimulation = cE('div');
    cornerMenuSimulation.className = 'simulation-settings corner-menu';

    var buttonSimulationMenu = cE('button');
    buttonSimulationMenu.className =
      'simulation-menu simulation-menu-running open-corner-menu';
    buttonSimulationMenu.title = 'more';
    cornerMenuSimulation.appendChild(buttonSimulationMenu);

    var buttonRestart = cE('button');
    buttonRestart.className = 'restart';
    buttonRestart.title = 'Restart';
    cornerMenuSimulation.appendChild(buttonRestart);

    if (this.features.deleteOldData) {
      var buttonDeleteOldData = cE('button');
      buttonDeleteOldData.className = 'delete-old-data';
      buttonDeleteOldData.title = 'Delete everything up to current time step';
      cornerMenuSimulation.appendChild(buttonDeleteOldData);

      this.attachEventListener({
        dispatcher: buttonDeleteOldData,
        type: 'click',
        callback: function (){
          controls.initializer.deleteOldData();
        }
      });
    }


    if (this.features.changeEndlessMode) {
      var buttonEndlessMode = cE('button');
      cornerMenuSimulation.appendChild(buttonEndlessMode);
      this.keyMap['^'] = buttonEndlessMode;
      
      this.attachEventListeners([
        {
          dispatcher: buttonEndlessMode,
          type: 'click',
          callback: function () {
            controls.initializer.clock.toggleEndlessMode();
          }
        },
        {
          dispatcher: this.initializer.clock,
          type: 'endless mode change',
          callback: function (clock) {
            updateEndlessModeButton(controls, clock);
          }
        },
      ]);
    }

    var buttonTimePlus = cE('button');
    buttonTimePlus.className = 'time-plus';
    buttonTimePlus.title = '+' + Controls.DEFAULT_T_PLUS + ' steps';
    if (this.initializer.clock.endlessMode) {
      buttonTimePlus.style.opacity = 0;
      buttonTimePlus.disabled = true;
    }
    cornerMenuSimulation.appendChild(buttonTimePlus);
    this.keyMap['+'] = buttonTimePlus;
    this.attachEventListener({
      dispatcher: buttonTimePlus,
      type: 'click',
      callback: function () {
        var input = controls.domCache.inputTMax;
        controls.setTToSimulate(parseInt(input.value, 10) + Controls.DEFAULT_T_PLUS);
      }
    });

    var spanApplyCountdown = cE('span');
    spanApplyCountdown.className = 'apply-countdown';
    spanApplyCountdown.appendChild(document.createTextNode('Applying in '));
    var spanApplyCountdownSteps = cE('span');
    spanApplyCountdown.appendChild(spanApplyCountdownSteps);
    spanApplyCountdown.appendChild(document.createTextNode(' steps...'));
    cornerMenuSimulation.appendChild(spanApplyCountdown);

    var divSimulation = cE('div');
    divSimulation.className = 'simulation-task corner-menu-contents';

    var headingSimulation = cE('h3');
    headingSimulation.textContent = 'Simulation';
    divSimulation.appendChild(headingSimulation);


    var formSimulation = cE('form');
    formSimulation.className = 'backend-settings';
    formSimulation.action = 'javascript:void(0)';

    var divMainSettings = cE('div');

    var divTimeSteps = cE('div');

    var labelTMax = cE('label');
    labelTMax.htmlFor = 't-max';

    var simulatedSteps = cE('span');
    simulatedSteps.className = 'simulated-steps';
    simulatedSteps.textContent = '0';
    labelTMax.appendChild(simulatedSteps);

    labelTMax.appendChild(document.createTextNode('/'));

    var inputTMax = cE('input');
    inputTMax.id = 't-max';
    inputTMax.type = 'number';
    inputTMax.name = 't-max';
    inputTMax.step = 1;
    inputTMax.min = 0;
    inputTMax.value = Controls.DEFAULT_T_MAX;
    inputTMax.className = 'labeled-input steps-to-simulate';
    labelTMax.appendChild(inputTMax);

    labelTMax.appendChild(document.createTextNode(' time steps simulated'));
    divTimeSteps.appendChild(labelTMax);

    divMainSettings.appendChild(divTimeSteps);

    var progressBarSimulation = cE('progress');
    progressBarSimulation.className = 'simulation-progress';
    progressBarSimulation.value = 0;
    progressBarSimulation.max = Controls.DEFAULT_T_MAX;
    divMainSettings.appendChild(progressBarSimulation);

    if (this.features['select action on changing settings']) {
      var selectActionOnChangingSettings = cE('select');
      selectActionOnChangingSettings.className = 'action-on-changing-settings';
      selectActionOnChangingSettings.name = 'action-on-changing-settings';
      var optionDoNothing = cE('option');
      optionDoNothing.value = 'do-nothing';
      optionDoNothing.textContent = 'Manual restarts only';
      
      var optionAlwaysRestart = cE('option');
      optionAlwaysRestart.value = 'always-restart';
      optionAlwaysRestart.textContent = 'Always restart when changing settings';

      if (this.initializer.modelConfig.simulation.continuableWithNewSettings) {
        var optionContinue = cE('option');
        optionContinue.value = 'continue-with-new-settings';
        optionContinue.textContent = 'Continue simulation when changing settings (if possible)';
        optionContinue.selected = true;
        selectActionOnChangingSettings.appendChild(optionContinue);
      } else {
        optionAlwaysRestart.selected = true;
      }

      selectActionOnChangingSettings.appendChild(optionAlwaysRestart);
      selectActionOnChangingSettings.appendChild(optionDoNothing);
      
      divMainSettings.appendChild(selectActionOnChangingSettings);
    }


    formSimulation.appendChild(divMainSettings);


    var divPerformanceOptimizations = cE('div');

    var headingPerformanceOptimizations = cE('h4');
    headingPerformanceOptimizations.textContent = 'Performance optimizations';
    divPerformanceOptimizations.appendChild(headingPerformanceOptimizations);

    var checkboxesSaveVar = {};
    if (this.features.saveVarCheckboxes) {
      var divSaveVarCheckboxes = cE('div');
      divSaveVarCheckboxes.className = 'save-var-checkboxes';

      var varsConfig = this.modelConfig.controls.stateVariables;
      for (var name in varsConfig) {
        if (varsConfig.hasOwnProperty(name)) {
          var element = graphicTools.createSetting({
            type: 'checkbox',
            name: name,
            value: true,
            labelText: 'Save ' + (varsConfig[name].labelText || name)
          });

          checkboxesSaveVar[name] = element;
          this.attachEventListener({
            dispatcher: element,
            type: 'change',
            callback: function (){
              controls.initializer.simulation.changeBackendSettings(undefined, true);
            }
          });

          divSaveVarCheckboxes.appendChild(element.domElement);
        }
      }

      divPerformanceOptimizations.appendChild(divSaveVarCheckboxes);
    }

    var divMemory = cE('div');
    var inputMemory = graphicTools.createSetting({
      type: 'select',
      labelText: 'Memory to save time steps: ',
      name: 'spimosim-memory',
      value: localStorage.getItem('spimosim-memory') || (500 << 20).toString(),
      texts: STORAGE_SIZE_TEXTS,
      values: STORAGE_SIZE_VALUES
    });

    divMemory.appendChild(inputMemory.domElement);
    divPerformanceOptimizations.appendChild(divMemory);

    formSimulation.appendChild(divPerformanceOptimizations);

    divSimulation.appendChild(formSimulation);

    cornerMenuSimulation.appendChild(divSimulation);

    this.attachEventListeners([
      {
        dispatcher: buttonSimulationMenu,
        type: 'click',
        callback: function (e) {
          controls.domCache.cornerMenuSimulation.classList.toggle('corner-menu-expanded');
        }
      },
      {
        dispatcher: document,
        type: 'click',
        callback: function (e) {
          if (!controls.domCache.cornerMenuSimulation.contains(e.target)) {
            controls.domCache.cornerMenuSimulation.classList.remove('corner-menu-expanded');
          }
        }
      },
      {
        dispatcher: inputTMax,
        type: 'input',
        callback: function (){
          controls.initializer.simulation.changeBackendSettings(undefined, true);
        }
      },
      {
        dispatcher: buttonRestart,
        type: 'click',
        callback: function (){
          controls.restartOrUpdateSettings('restart button')
        }
      },
      {
        dispatcher: document,
        type: 'keypress',
        callback: function (e) {
          var firedOnInput = graphicTools.wasFiredOnInput(e),
            key = e.key;

          if (!firedOnInput) {
            switch (key) {
              case 'r':
                controls.restartOrUpdateSettings('keyboard')
                break;
              default:
                graphicTools.processKey(e, controls.keyMap);
            }
          }
        }
      },
      {
        dispatcher: inputMemory,
        type: 'change',
        callback: function (){
          controls.setMemorySize();
        }
      }
    ]);

    
    this.domCache.selectActionOnChangingSettings = selectActionOnChangingSettings;
    
    this.domCache.inputTMax = inputTMax;
    this.domCache.progressBarSimulation = progressBarSimulation;
    this.domCache.simulatedSteps = simulatedSteps;
    this.domCache.spanApplyCountdown = spanApplyCountdown;
    this.domCache.spanApplyCountdownSteps = spanApplyCountdownSteps;
    
    this.domCache.divSaveVarCheckboxes = divSaveVarCheckboxes;
    this.domCache.checkboxesSaveVar = checkboxesSaveVar;
    this.domCache.inputMemory = inputMemory;
    
    this.domCache.buttonRestart = buttonRestart;
    this.domCache.buttonTimePlus = buttonTimePlus;
    this.domCache.buttonSimulationMenu = buttonSimulationMenu;
    this.domCache.buttonEndlessMode = buttonEndlessMode;
    this.domCache.buttonDeleteOldData = buttonDeleteOldData;
    this.domCache.cornerMenuSimulation = cornerMenuSimulation;
    
    return cornerMenuSimulation;
  };

  function initSettingsGui() {
    var controls = this;
    var inputsModel = {};

    var formModelSettings = cE('form');
    formModelSettings.action = 'javascript:void(0)';
    formModelSettings.className = 'subdivided-settings model-settings settings';
 
    var submitButton = cE('button');
    submitButton.type = 'submit';
    submitButton.style.display = 'none';
    formModelSettings.appendChild(submitButton);
    
    this.attachEventListener({
      dispatcher: formModelSettings,
      type: 'submit',
      callback: function (){
        controls.restartOrUpdateSettings('submit')
      }
    });

    function newSettingsSection(className, headingText) {
      var div = cE('div');
      div.className = className;
      formModelSettings.appendChild(div);

      var heading = cE('h3');
      heading.textContent = headingText;
      div.appendChild(heading);

      return div;
    }

    /* Add on settings */

    for (var addOnName in this.addOns) {
      if (this.addOns.hasOwnProperty(addOnName)) {
        var addOn = this.addOns[addOnName];
        if (addOn.hasGui()) {
          newSettingsSection(addOn.settingsClass, addOn.headingText).appendChild(addOn.getMainElement());
          addOn.addToKeyMap(this.keyMap);
        }
      }
    }
    
    /* Initial state */
    
    function processInitialStateFile(e) {
      var uploadInitialState = controls.domCache.inputsModel.uploadInitialState;
      if (this.files.length === 0) {
        controls.initialState = undefined;
        uploadInitialState.setInvalid();
        return;
      }

      var file = this.files[0],
        reader = new FileReader();

      reader.onload = function (e) {
        var str = e.target.result;

        if (!str.startsWith(MAGIC_STR)) {
          controls.initialState = undefined;
          uploadInitialState.setInvalid();
          uploadInitialState.setMsg('Invalid file!');
          uploadInitialState.setValue('');
          uploadInitialState.dispatchEvent('change');
          return;
        }

        var obj = JSON.parse(str.slice(MAGIC_STR.length));

        controls.initialState = {
          settings: obj[0],
          values: spimosimCore.Protocol.parsedJson2Values(obj[1], controls.modelConfig.controls.stateVariabels)
        };

        unloadInitialState.setValid();
        uploadInitialState.setMsg('');
        controls.restartOrUpdateSettings('settings')
      };

      reader.readAsText(file);
    }


    var divInitialValues = newSettingsSection('initial-values-settings', 'Initial state');
    var hasInitialValuesSettings = false;

    if (this.features.uploadInitialState) {
      var container = cE('div');
      hasInitialValuesSettings = true;
      
      graphicTools.createSettings({
        uploadInitialState: {
          type: 'file',
          labelText: 'Upload initial state',
          name: 'upload-init-state',
        }
      }, container, undefined, inputsModel);

      divInitialValues.appendChild(container);

      this.attachEventListener({
        dispatcher: inputsModel.uploadInitialState,
        type: 'change',
        callback: processInitialStateFile
      });
    }

    var varsConfig = this.modelConfig.controls.stateVariables;
    for (var varName in varsConfig) {
      if (varsConfig.hasOwnProperty(varName)) {
        this.varInitializers[varName] = [];

        var varConfig = varsConfig[varName],
          initialValueConfigs = varConfig.initialValue;

        if (initialValueConfigs !== undefined)  {
          hasInitialValuesSettings = true;
          var heading = cE('h4'),
            headingBar = cE('span'),
            spanVarName = cE('span'),
            settingsDiv = cE('div'),
            container = cE('div');

          settingsDiv.className = 'initial-values-settings';

          headingBar.className = 'bar';
          spanVarName.textContent = varName; 

          heading.appendChild(headingBar);
          heading.appendChild(spanVarName);
          settingsDiv.appendChild(heading);
          
          container.className = 'initializer';
          settingsDiv.appendChild(container);

          for (var name in initialValueConfigs) {
            if (initialValueConfigs.hasOwnProperty(name)) {
              var VarInitializer = modules.get('VarInitializer', name);
              var varInitializer = new VarInitializer(initialValueConfigs[name], this, varName);
              this.varInitializers[varName].push(varInitializer);
              
              if (varInitializer.hasGui()) {
                if (container.childElementCount > 0) {
                  var divOr = cE('div');
                  divOr.textContent = '- or - ';
                  divOr.className = 'initializer-separator';
                  container.appendChild(divOr);
                }
                container.appendChild(varInitializer.getMainElement());
              }
              
              varInitializer.addToKeyMap(this.keyMap);
            }
          }

          if (container.childElementCount > 0) {
            formModelSettings.appendChild(settingsDiv);
          }
        }
      }
    }

    if (!hasInitialValuesSettings) {
      formModelSettings.removeChild(divInitialValues);
    }


    /* Model parameter settings */

    var divParameter = newSettingsSection('highlighted-settings-section', 'Parameters');
    formModelSettings.appendChild(divParameter);
    
    var divParameterInnerBox = cE('div');
    divParameter.appendChild(divParameterInnerBox);
    graphicTools.createSettings(this.modelConfig.controls.parameters, divParameterInnerBox, this.keyMap, inputsModel);

    var hasParameters = false;
    for (var name in this.modelConfig.controls.parameters) {
      if (this.modelConfig.controls.parameters.hasOwnProperty(name)) {
        hasParameters = true;
        this.attachEventListener({
          dispatcher: inputsModel[name],
          type: 'change',
          callback: function () {
            controls.restartOrUpdateSettings('settings');
          }
        });
      }
    }
    if (!hasParameters) {
      divParameter.style.display= 'none';
    }

    this.domCache.inputsModel = inputsModel;
    
    if (this.features.changeEndlessMode) {
      updateEndlessModeButton(controls, this.initializer.clock);
    }
    
    return formModelSettings;
  };

  Controls.prototype.draw = function (clock) {
    var applyingIn = this.nextApplyT - clock.getT();
    if (applyingIn > 0) {
      if (!this.isApplyCounterShown) {
        this.domCache.spanApplyCountdown.style.opacity = 1;
        this.isApplyCounterShown = true;
      }
      this.domCache.spanApplyCountdownSteps.textContent = applyingIn;
    } else {
      this.nextApplyT = -1;
      if (this.isApplyCounterShown) {
        this.domCache.spanApplyCountdown.style.opacity = 0;
        this.isApplyCounterShown = false;
      }
    }
  };

  function updateEndlessModeButton(controls, clock) {
    var buttonEndlessMode = controls.domCache.buttonEndlessMode;
    if (clock.endlessMode) {
      buttonEndlessMode.className = 'endless-mode';
      buttonEndlessMode.title = 'Simulate fixed interval';
      controls.domCache.buttonTimePlus.disabled = true;
      controls.domCache.buttonTimePlus.style.opacity = 0;
    } else {
      buttonEndlessMode.className = 'ending-mode';
      buttonEndlessMode.title = 'Simulate more steps automatically';
      controls.domCache.buttonTimePlus.removeAttribute('disabled');
      controls.domCache.buttonTimePlus.style.opacity = 1;
    }
  };

  Controls.prototype.setTToSimulate = function (tMax) {
    if (tMax > this.lastValidTMax) {
      this.lastValidTMax = tMax;
      this.domCache.inputTMax.value = tMax;
      this.initializer.simulation.changeBackendSettings(undefined, true);
    }
  };

  Controls.prototype.setMemorySize = function () {
    var spimosimMemory = this.domCache.inputMemory.getValue();
    var protocol = this.initializer.simulation.protocol;

    localStorage.setItem('spimosim-memory', spimosimMemory);
    protocol.maxBytes = spimosimMemory;
    protocol.deleteOldData();
  };

  Controls.prototype.attachSimulationListeners = function (simulation) {
    var controls = this;

    this.attachEventListeners([
      {
        dispatcher: simulation,
        type: 'invalid parameter',
        callback: function (e) {
          controls.domCache.inputsModel[e.parameter].setInvalid(e.msg);
          controls.invalidParameters.push(e.parameter);
        }
      },
      {
        dispatcher: simulation,
        type: "backend event",
        callback: function (eventObject) {
          if (eventObject.hasOwnProperty("type") && eventObject.type == "settings") {
            controls.setAll(eventObject.settings);
          }
        }
      }
    ]);
  };

  /*
   * Starts the simulation when changing settings
   */
  Controls.prototype.restartOrUpdateSettings = function (action) {
    for (var i = 0, len = this.invalidParameters.length; i < len; i++) {
      this.domCache.inputsModel[this.invalidParameters[i]].setValid();
    }

    this.invalidParameters = [];
    
    var modelSettings = this.parseModelSettings(false);
    
    this.nextApplyT = -1;
    switch (action) {
      case 'settings':
        var wantedAction;
        if (this.features['select action on changing settings']) {
          wantedAction = this.domCache.selectActionOnChangingSettings.value;
        } else if (this.modelConfig.simulation.continuableWithNewSettings) {
          wantedAction = 'continue-with-new-settings';
        } else {
          wantedAction = 'always-restart';
        }

        if (wantedAction === 'always-restart' || (wantedAction !== 'do-nothing' && modelSettings.continuable === false)) {
          this.initializer.start(true);
        } else if (wantedAction === 'continue-with-new-settings') {
          modelSettings = this.parseModelSettings(true);//Get settings again with option automaticStart
          this.nextApplyT = this.initializer.simulation.getTMaxCalculated();
          this.initializer.simulation.changeModelSettings(modelSettings, false);
        }
        break;
      case 'submit':
      case 'restart button':
      case 'keyboard':
        this.initializer.start(false);
        break;
    }
  };

  /*
   * Parse the settings and return a JSON object
   */
  Controls.prototype.parseModelSettings = function (automaticStart) {
    var settings = {
      parameters: {},
      initialState: {},
      continuable: true,
      video: {
        type: this.modelConfig.video.type
      }
    };
    
    for (var name in this.modelConfig.controls.parameters) {
      if (this.modelConfig.controls.parameters.hasOwnProperty(name)) {
        var value = this.domCache.inputsModel[name].getValue();
        settings.parameters[name] = value;
      }
    }


    for (var addOnName in this.addOns) {
      if (this.addOns.hasOwnProperty(addOnName)) {
        var addOn = this.addOns[addOnName];

        if (addOn.hasValue(settings, automaticStart)) {
          settings[addOnName] = addOn.getValue(settings, automaticStart);
        }
      }
    }

    var oldSettings;
    if (this.initializer.simulation !== undefined) {
      oldSettings = this.initializer.simulation.modelSettings;
    }
    for (var i = 0, len = this.settingsPreprocessors.length; i < len; i++) {
      this.settingsPreprocessors[i](oldSettings, settings);
    }

    
    if (this.initialState !== undefined) {
      var values = this.initialState.values,
        usedSettings = this.initialState.settings,
        mismatch;

      for (var name in usedSettings) {
        if (usedSettings.hasOwnProperty(name)) {
          if (usedSettings[name]
              !== settings[name]) {
            mismatch = name;
          }
        }
      }

      if (mismatch === undefined) {
        this.domCache.inputsModel.uploadInitialState.setMsg('');
        tools.copyInto(values, settings);
        tools.copyInto(values, settings.initialState);
      } else {
        this.domCache.inputsModel.uploadInitialState.setMsg('Error: ' + mismatch + '≠' + usedSettings[mismatch]);
      }
    }

    for (var varName in this.varInitializers) {
      if (this.varInitializers.hasOwnProperty(varName)) {
        if (settings.initialState[varName] === undefined) {
          var value = undefined;

          for (var i = 0, len = this.varInitializers[varName].length; i < len &&
              value === undefined; i++) {
            var initializer = this.varInitializers[varName][i];

            if (initializer.hasValue(settings, automaticStart)) {
              value = initializer.getValue(settings, automaticStart);
            }
          }

          settings[varName] = value;
          settings.initialState[varName] = value;
        }
      }
    }
    
    var oldSettings;
    if (this.initializer.simulation !== undefined) {
      oldSettings = this.initializer.simulation.modelSettings;
    }
    
    return settings;
  };

  Controls.prototype.parseBackendSettings = function () {
    var completeVarsConfig = this.modelConfig.controls.stateVariables,
      varsConfig = {};

    for (var name in completeVarsConfig) {
      if (completeVarsConfig.hasOwnProperty(name)) {
        if ((!this.features.saveVarCheckboxes) || this.domCache.checkboxesSaveVar[name].getValue()) {
          varsConfig[name] = completeVarsConfig[name];
        }
      }
    }

    var tMax = this.getTToSimulate();
    if (this.simulation) {
      tMax = Math.max(this.simulation.tMaxCalculated, tMax);
    }

    var backendSettings = {
      protocol: {
        varsConfig: varsConfig,
      },
      tMax: tMax
    };

    return backendSettings;
  };


  Controls.prototype.showThatSimulationIsDone = function () {
    this.domCache.progressBarSimulation.style.opacity = 0;
    this.domCache.buttonSimulationMenu.classList.remove('simulation-menu-running');
  };

  Controls.prototype.showThatSimulationIsRunning = function () {
    this.domCache.progressBarSimulation.style.opacity = 1;
    this.domCache.buttonSimulationMenu.classList.add('simulation-menu-running');
  };

  Controls.prototype.setProgress = function (t) {
    this.domCache.progressBarSimulation.value = t;
    this.domCache.simulatedSteps.textContent = t;
  };

  Controls.prototype.setProgressMax = function (maxValue) {
    this.domCache.progressBarSimulation.max = maxValue;
  };

  Controls.prototype.getTToSimulate = function () {
    var val = parseInt(this.domCache.inputTMax.value, 10);
    if (isFinite(val)) {
      this.lastValidTMax = val;
    } else {
      val = this.lastValidTMax;
    }

    return val;
  };

  Controls.prototype.destroy = function () {
    EventAttacher.prototype.destroy.call(this);
    this.initializer.clock.removeAnimator(this);
    
    var names = [];
    var parameters = this.modelConfig.parameters;
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name)) {
        names.push(name);
      }
    }
    graphicTools.removeUriFragmentQueries(names);

    this.domCache.box.remove();
  };


  function SettingsSection(config, controls) {
    this.controls = controls;
    this.keyMap = {};
    this.domCache = {};
    this.config = config;

    if (this.hasGui()) {
      this.domCache.mainElement = this.initGui();
    }

    EventAttacher.call(this);
  }
  SettingsSection.prototype = Object.create(EventAttacher.prototype);

  SettingsSection.prototype.hasGui = function () {
    return false;
  };

  SettingsSection.prototype.getMainElement = function () {
    return this.domCache.mainElement;
  };

  SettingsSection.prototype.addToKeyMap = function (mainKeyMap) {
    for (var name in this.keyMap) {
      if (this.keyMap.hasOwnProperty(name)) {
        mainKeyMap[name] = this.keyMap[name];
      }
    }
  };


  function VarInitializer(config, controls, varName) {
    this.varName = varName;
    SettingsSection.call(this, config, controls);
  }
  VarInitializer.prototype = Object.create(SettingsSection.prototype);


  function ControlsAddOn(config, controls, settingsClass, headingText) {
    this.settingsClass = settingsClass;
    this.headingText = headingText;
    SettingsSection.call(this, config, controls);
  }
  ControlsAddOn.prototype = Object.create(SettingsSection.prototype);
  
  ControlsAddOn.prototype.preprocessorConfig = {}


  /* ----------------------------------VIDEO--------------------------------- */
  /*
   * An abstract video
   */
  function Video(initializer, config, videoSection, colorSet) {
    EventAttacher.call(this);
    FeatureActivatable.call(this, config.features, 'Video');
    
    this.initializer = initializer;
    this.colorSet = colorSet;
    this.config = config;
    this.createDrawModes();

    var div = this.initGui();
    div.classList.add('video-container');
    videoSection.appendChild(div);

    this.shownT = -1;
    initializer.clock.addAnimator(this);

    this.ctx = this.domCache.videoCanvas.getContext(this.contextType);
  };


  Video.prototype = Object.create(EventAttacher.prototype);
  tools.addToPrototype(Video, FeatureActivatable);

  Video.prototype.availableFeatures = {
    Video: [
      {
        name: 'fullscreen'
      },
      {
        name: 'downloads menu',
        activates: [ 'menu' ]
      },
      {
        name: 'download spimosim json',
        activates: [ 'downloads menu' ]
      },
      {
        name: 'draw mode menu',
        activates: [ 'menu' ]
      },
      {
        name: 'menu'
      }
    ]
  };

  Video.prototype.contextType = '2d';
  
  Video.prototype.createDrawModes = function () {
    var drawModesConfig = this.config.drawModes,
      create = modules.get('createDrawModes', drawModesConfig.type);
    this.drawModes = create(drawModesConfig, this.colorSet);
    if (this.config.defaultDrawMode) {
      this.drawMode = this.config.defaultDrawMode;
    } else {
      this.drawMode = 0;
    }
  };

  Video.prototype.draw = function (clock) {
    this.drawFrame(clock.getT());
  };

  Video.prototype.getAnimatedGifFileName = function (tStart, tEnd, drawMode) {
    return this.simulation.compactName + '-' +
      graphicTools.toValidFileName(drawMode) + '-' +
      this.simulation.getParametersForFileName() +
      '-Frames_' + tStart + '-' + tEnd + '.gif';
  };

  Video.prototype.getFrameFileName = function (t, drawMode) {
    return this.simulation.compactName + '-' +
      graphicTools.toValidFileName(drawMode) + '-' +
      this.simulation.getParametersForFileName() +
      '-Frame_' + t + '.png';
  };

  Video.prototype.getSpimosimFrameFileName = function (t) {
    return this.simulation.compactName + '-' +
      this.simulation.getParametersForFileName() +
      '-Frame_' + t + '.smss';
  };

  Video.prototype.setSimulation = function (simulation) {
    this.simulation = simulation;
  };

  Video.prototype.initVideoMenu = function () {
    var formVideoMenu = cE('form');
    formVideoMenu.className = 'video-menu corner-menu';
    formVideoMenu.action = 'javascript:void(0)';

    var domCache = {
      formVideoMenu: formVideoMenu
    };

    var video = this;

    if (this.features.fullscreen) {
      var buttonExpandVideo = cE('button');
      buttonExpandVideo.className = 'expand-video';
      buttonExpandVideo.textContent = 'Fullscreen';
      formVideoMenu.appendChild(buttonExpandVideo);

      function expandUnexpand() {
        var videoDiv = video.domCache.divVideo;
        if (document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen) {
          //The video is expanded. Leave expanded mode
          videoDiv.classList.add('expanded-video');
        } else {
          videoDiv.classList.remove('expanded-video');
        }
      }

      this.attachEventListeners([
        {
          dispatcher: document,
          type: 'fullscreenchange',
          callback: expandUnexpand
        },
        {
          dispatcher: document,
          type: 'webkitfullscreenchange',
          callback: expandUnexpand
        },
        {
          dispatcher: document,
          type: 'mozfullscreenchange',
          callback: expandUnexpand
        },
        {
          dispatcher: document,
          type: 'msfullscreenchange',
          callback: expandUnexpand
        },
        {
          dispatcher: buttonExpandVideo,
          type: 'click',
          callback: function (e) {
            graphicTools.toggleFullscreen(e, video.domCache.divVideo);
          }
        }
      ]);
      
      domCache.buttonExpandVideo = buttonExpandVideo;
    }

    if (this.features.menu) {
      var buttonVideoMenu = cE('button');
      buttonVideoMenu.className = 'open-corner-menu';
      buttonVideoMenu.textContent = '+';
      formVideoMenu.appendChild(buttonVideoMenu);

      var divMenuContent = cE('div');
      divMenuContent.className = 'corner-menu-contents';

      var drawModeControl = cE('div');
      drawModeControl.className = 'draw-mode-control';
      divMenuContent.appendChild(drawModeControl);


      if (this.features['downloads menu']) {
        var downloadMenu = cE('div');
        downloadMenu.className = 'download-options';

        var headingDownloadOptions = cE('h4');
        headingDownloadOptions.textContent = 'Downloads';
        downloadMenu.appendChild(headingDownloadOptions);

        if (this.features['download spimosim json']) {
          var buttonSaveAsSpimosimFrame= cE('button');
          buttonSaveAsSpimosimFrame.className = 'save-frame-as-json';
          buttonSaveAsSpimosimFrame.textContent = 'Frame as JSON';
          downloadMenu.appendChild(buttonSaveAsSpimosimFrame);

          divMenuContent.appendChild(downloadMenu);
          this.attachEventListener({
            dispatcher: buttonSaveAsSpimosimFrame,
            type: 'click',
            callback: function () {
              var t = video.initializer.clock.getT(),
                fileName = video.getSpimosimFrameFileName(t);
              if (t) {
                imageSaver.saveAsSpimosimFrame(video.simulation, t, fileName);
              }
            }
          });
          domCache.buttonSaveAsSpimosimFrame = buttonSaveAsSpimosimFrame;
        }
      
        domCache.downloadMenu = downloadMenu;
      }

      if (this.features['draw mode menu']) {
        domCache.buttonVideoMenu = buttonVideoMenu;
        domCache.divMenuContent = divMenuContent;
        var showDrawModeCheckboxes = Object.keys(this.drawModes).length > 1;

        if (showDrawModeCheckboxes) {
          var headingDrawModes = cE('h4');
          headingDrawModes.textContent = 'Draw mode';
          drawModeControl.appendChild(headingDrawModes);
        }

        var drawModeInputs = {};

        var drawModes = this.drawModes;
        for (var value in drawModes) {
          if (drawModes.hasOwnProperty(value)) {
            if (showDrawModeCheckboxes) {
              var text = drawModes[value].text,
                tmp = graphicTools.createLabeledRadioButton('draw-mode', 'drawMode', value, text),
                surroundingDiv = tmp.surroundingDiv,
                radioButton = tmp.radioButton;

              drawModeControl.appendChild(surroundingDiv);

              drawModeInputs[value] = tmp.radioButton;

              if (this.drawMode == value) {
                radioButton.checked = true;
              }
            }
          }
        }

        for (var name in drawModeInputs) {
          if (drawModeInputs.hasOwnProperty(name)) {
            this.attachEventListener({
              dispatcher: drawModeInputs[name],
              type: 'change',
              callback: function boundUpdateDrawMode (e) {
                video.drawMode = e.target.value;
              }
            });
          }
        }
      
        domCache.drawModeInputs = drawModeInputs;
        domCache.drawModeControl = drawModeControl;
      }

      formVideoMenu.appendChild(divMenuContent);
      this.attachEventListeners([
        {
          dispatcher: document,
          type: 'click',
          callback: function (e) {
            if (!video.domCache.formVideoMenu.contains(e.target)) {
              video.domCache.formVideoMenu.classList.remove('corner-menu-expanded');
            }
          }
        },
        {
          dispatcher: buttonVideoMenu,
          type: 'click',
          callback: function (e) {
            video.domCache.formVideoMenu.classList.toggle('corner-menu-expanded');
          }
        }
      ]);
    }

    return domCache;
  };

  Video.prototype.createImageData = function (ctx) {
    return ctx.createImageData(this.getFrameWidth(), this.getFrameHeight());
  };

  /*
   * Removes event listners
   */
  Video.prototype.destroy = function () {
    EventAttacher.prototype.destroy.call(this);
    this.initializer.clock.removeAnimator(this);
    this.domCache.box.remove();
  };

  Video.prototype.drawFrameInImageData = function (pixels, protocol, t, drawMode) {
    this.drawModes[drawMode].draw.call(this, pixels, protocol, t, 0);
  };

  Video.prototype.drawFrameInContext = function (ctx, protocol, t, drawMode) {
    this.drawModes[drawMode].draw.call(this, ctx, protocol, t);
  };

  
  function DynamicVideo(initializer, config, videoSection, colorSet) {
    this.keyMap = {};
    if ('dynamicVideo' in config) {
      FeatureActivatable.call(this, config.dynamicVideo.features, 'DynamicVideo');
    } else if (config.features === true) {
      FeatureActivatable.call(this, true, 'DynamicVideo');
    }
    Video.call(this, initializer, config, videoSection, colorSet);

    this.setFrameNotSaved(false);
    this.setFrameNotSimulated(true);
    this.setStartingSimulation(initializer.simulation.tMaxCalculated < 0);

    this.shownT = undefined;
    this.shownTMin = 0;
    this.shownTMax = 0;
  }
  DynamicVideo.prototype = Object.create(Video.prototype);

  DynamicVideo.prototype.availableFeatures.DynamicVideo = [
    {
      name: 'playbackControls'
    },
    {
      name: 'timeLabel',
      activates: [ 'playbackControls' ]
    },
    {
      name: 'timeProgressBar',
      activates: [ 'playbackControls' ]
    },
    {
      name: 'fpsControls',
      activates: [ 'playbackControls' ]
    },
    {
      name: 'playbackButtons',
      activates: [ 'playbackControls' ]
    },
    {
      name: 'playPauseButton',
      activates: [ 'playbackButtons' ]
    },
    {
      name: 'skipToFirstButton',
      activates: [ 'playbackButtons' ]
    },
    {
      name: 'skipToLastButton',
      activates: [ 'playbackButtons' ]
    },
  ];

  DynamicVideo.prototype.initGui = function () {
    var divVideo = cE('div');
    divVideo.className = 'video-dynamic';

    var heading = cE('h2');
    heading.textContent = 'Video video';

    var canvasFrame = cE('div');
    canvasFrame.className = 'canvas-frame';

    var canvasContainer = cE('div');
    canvasContainer.className = 'canvas-container';

    var videoCanvas = cE('canvas');
    videoCanvas.width = 32;
    videoCanvas.height = 32;
    canvasContainer.appendChild(videoCanvas);

    var videoMenuDomCache = this.initVideoMenu();
    this.domCache = videoMenuDomCache;
    canvasFrame.appendChild(videoMenuDomCache.formVideoMenu);
    canvasFrame.appendChild(canvasContainer);


    var videoText = cE('div');
    videoText.className = 'video-text';

    var videoTextNotSaved = cE('p');
    videoTextNotSaved.className = 'not-saved';
    videoTextNotSaved.textContent = 'No data for this time step.';
    videoText.appendChild(videoTextNotSaved);

    var videoTextNotSimulated = cE('p');
    videoTextNotSimulated.className = 'not-simulated';
    videoTextNotSimulated.textContent = 'This step has not yet been simulated';
    videoText.appendChild(videoTextNotSimulated);

    var videoTextStartingSimulation = cE('p');
    videoTextStartingSimulation.className = 'starting simulation';
    videoTextStartingSimulation.textContent = 'Starting simulation';
    videoText.appendChild(videoTextStartingSimulation);

    canvasFrame.appendChild(videoText);

    divVideo.appendChild(canvasFrame);
    
    if (this.features.playbackControls) {
      var playbackControl = cE('form');
      playbackControl.action = 'javascript:void(0)';
      playbackControl.className = 'playback-control';

      var divLabelT = cE('div');
      divLabelT.className = 't-label';

      var labelT = cE('label');
      labelT.htmlFor = 't';

      var labelSetT = cE('a');
      labelSetT.className = 'label-set';
      labelSetT.href = 'javascript:void(0)';
      labelSetT.textContent = 't';
      labelT.appendChild(labelSetT);

      labelT.appendChild(document.createTextNode('\u202F=\u202F'));

      var labelValueT = cE('span');
      labelValueT.textContent = '0';
      labelT.appendChild(labelValueT);

      divLabelT.appendChild(labelT);

      if (this.features.timeLabel) {
        playbackControl.appendChild(divLabelT);
        this.attachEventListener({
          dispatcher: labelSetT,
          type: 'click',
          callback: function () {
            var value = graphicTools.promptRangeValue(inputT, 'Set time');
            if (value !== undefined) {
              video.pause();
              video.initializer.clock.setT(value);
            }
          }
        });
        this.domCache.labelSetT = labelSetT;
        this.domCache.labelValueT = labelValueT;
      } else {
        playbackControl.classList.add('no-time-display');
      }


      if (this.features.fpsControls) {
        var fpsConfig = {
          key: 'f',
          labelText: ' fps ',
          logScale: true
        };
        if (this.config && 'dynamicVideo' in this.config && 'fps' in this.config.dynamicVideo) {
          tools.copyInto(this.config.dynamicVideo.fps, fpsConfig);
        }
        var inputFps = this.initializer.clock.createFpsRangeInput(fpsConfig);
        var fpsControl = inputFps.domElement;
        this.keyMap[fpsConfig.key] = inputFps;

        fpsControl.className = 'fps-control';
        var labelSet = fpsControl.querySelector('.label-set');
        labelSet.appendChild(labelSet.firstChild);
        labelSet.removeChild(labelSet.firstChild);

        playbackControl.appendChild(fpsControl);
        
        this.domCache.inputFps = inputFps;
      } else {
        playbackControl.classList.add('no-fps-control');
      }


      if (this.features.playbackButtons) {
        var playbackButtons = cE('div');
        playbackButtons.className = 'playback-buttons';
        
        var buttonSkipToFirst, buttonPlayPause, buttonSkipToLast;

        if (this.features.skipToFirstButton) {
          buttonSkipToFirst = cE('button');
          buttonSkipToFirst.className = 'skip-to-first';
          buttonSkipToFirst.textContent = '|<';
          playbackButtons.appendChild(buttonSkipToFirst);
          this.attachEventListener({
            dispatcher: buttonSkipToFirst,
            type: 'click',
            callback: function () {
              video.skipToFirst();
            }
          });
          this.domCache.buttonSkipToFirst = buttonSkipToFirst;
        }

        if (this.features.playPauseButton) {
          buttonPlayPause = cE('button');
          buttonPlayPause.className = 'play-button';
          buttonPlayPause.textContent = '|>';
          playbackButtons.appendChild(buttonPlayPause);
          this.attachEventListener({
            dispatcher: buttonPlayPause,
            type: 'click',
            callback: function () {
              video.playPause();
            }
          });
          this.domCache.buttonPlayPause = buttonPlayPause;
        }

        if (this.features.skipToLastButton) {
          buttonSkipToLast = cE('button');
          buttonSkipToLast.className = 'skip-to-last';
          buttonSkipToLast.textContent = '>|';
          playbackButtons.appendChild(buttonSkipToLast);
          this.attachEventListener({
            dispatcher: buttonSkipToLast,
            type: 'click',
            callback: function () {
              video.skipToLast();
            }
          });
          this.domCache.buttonSkipToLast = buttonSkipToLast;
        }

        playbackControl.appendChild(playbackButtons);
      } else {
        playbackControl.classList.add('no-playback-buttons');
      }


      if (this.features.timeProgressBar) {
        var divTimeProgress = cE('div');
        divTimeProgress.className = 'time-progress';

        var inputT = cE('input');
        inputT.id = 't';
        inputT.step = 1;
        inputT.value = 0;
        inputT.min = 0;
        inputT.max = 0;
        inputT.name = 't';
        inputT.className = 'labeled-input';
        inputT.type = 'range';
        divTimeProgress.appendChild(inputT);

        playbackControl.appendChild(divTimeProgress);
        
        this.domCache.inputT = inputT;
        
        this.attachEventListeners([
          {
            dispatcher: inputT,
            type: 'input',
            callback: function () {
              video.pause();
              video.initializer.clock.setT(parseInt(video.domCache.inputT.value, 10));
            }
          },
          {
            dispatcher: inputT,
            type: 'mousewheel',
            callback: function (e) {
              video.domCache.inputT.value = graphicTools.getValueAfterScroll(video.domCache.inputT, e);
              video.pause();
              video.initializer.clock.setT(parseInt(video.domCache.inputT.value, 10));
            }
          },
        ]);
      } else {
        playbackControl.classList.add('no-time-progess');
      }

      divVideo.appendChild(playbackControl);
    }

    
    var box = cE('div');
    box.appendChild(divVideo);

    this.domCache.box = box;
    this.domCache.divVideo = divVideo;
    this.domCache.videoCanvas = videoCanvas;
    this.domCache.canvasContainer = canvasContainer;
    this.domCache.canvasFrame = canvasFrame;
    this.domCache.videoText = videoText;
    this.domCache.videoTextNotSaved = videoTextNotSaved;
    this.domCache.videoTextNotSimulated = videoTextNotSimulated;
    this.domCache.videoTextStartingSimulation = videoTextStartingSimulation;
     
    var video = this;

    this.attachEventListeners([
      {
        dispatcher: this.domCache.canvasContainer,
        type: 'dblclick',
        callback: function (e) {
          graphicTools.toggleFullscreen(e, video.domCache.divVideo);
        }
      },
      {
        dispatcher: document,
        type: 'keydown',
        callback: function (e) {
          var firedOnInput = graphicTools.wasFiredOnInput(e);

          if (!firedOnInput) {
            switch (e.key) {
              case '.':
                graphicTools.radioStep('drawMode', 1, video.domCache.formVideoMenu);
                break;
              case ',':
                graphicTools.radioStep('drawMode', -1, video.domCache.formVideoMenu);
                break;
              case ' ':
                if (e.target.nodeName.toLowerCase() === 'button') {
                  break;
                }
              case 'k':
                if (video.features['playPauseButton']) {
                  video.playPause();
                }
                break;
              case 't':
              case 'T':
              case 'ArrowLeft':
              case 'ArrowRight':
                if (video.features['timeProgressBar'] && e.target.nodeName !== 'input' && e.target.type !== 'range') {
                  var steps = (e.altKey || e.ctrlKey ? 10 : 1);
                  if (e.key === 'ArrowLeft') {
                    steps *= -(e.shiftKey ? 10 : 1);
                  } else if (e.key === 'ArrowRight') {
                    steps *= (e.shiftKey ? 10 : 1);
                  } else {
                    steps *= (e.shiftKey ? -1 : 1);
                  }
                  video.initializer.clock.setT(graphicTools.getValueAfterSteps(video.domCache.inputT, steps));
                }
                break;
              default:
                graphicTools.processKey(e, video.keyMap);
            }
          }
        }
      },
      {
        dispatcher: this.initializer.clock,
        type: 'start',
        callback: function (){
          video.setPlayPauseButton();
        }
      },
      {
        dispatcher: this.initializer.clock,
        type: 'stop',
        callback: function (){
          video.setPlayPauseButton();
        }
      }
    ]);

    return box;
  }

  DynamicVideo.prototype.setSimulation = function (simulation) {
    Video.prototype.setSimulation.call(this, simulation);
    this.highestShownTMax = -1;
    this.skipToFirst();
  };

  DynamicVideo.prototype.setPlayPauseButton = function () {
    var button = this.domCache.buttonPlayPause;
    if (button) {
      var isRunning = this.initializer.clock.isRunning;
      if (this.shownIsRunning !== isRunning) {
        if (isRunning) {
          button.className = 'pause-button';
          button.textContent = '||';
        } else {
          button.className = 'play-button';
          button.textContent = '|>';
        }
      }
      this.shownIsRunning = isRunning;
    }
  };

  DynamicVideo.prototype.setFrameNotSaved = function (frameNotSaved) {
    if (this.frameNotSaved !== frameNotSaved) {
      this.frameNotSaved = frameNotSaved;
      if (frameNotSaved) {
        this.domCache.videoText.style.display = 'inline-block';
        this.domCache.videoTextNotSaved.style.display = 'block';
      } else {
        this.domCache.videoTextNotSaved.style.display = 'none';
        if (!this.frameNotSimulated && !this.startingSimulation) {
          this.domCache.videoText.style.display = 'none';
        }
      }
    }
  };

  DynamicVideo.prototype.setFrameNotSimulated = function (frameNotSimulated) {
    if (this.frameNotSimulated !== frameNotSimulated) {
      this.frameNotSimulated = frameNotSimulated;
      if (frameNotSimulated) {
        this.domCache.videoText.style.display = 'inline-block';
        this.domCache.videoTextNotSimulated.style.display = 'block';
        this.domCache.videoText.classList.add('buffering');
      } else {
        this.domCache.videoTextNotSimulated.style.display = 'none';
        this.domCache.videoText.classList.remove('buffering');
        if (!this.frameNotSaved && !this.startingSimulation) {
          this.domCache.videoText.style.display = 'none';
        }
      }
    }
  };

  DynamicVideo.prototype.setStartingSimulation = function (startingSimulation) {
    if (this.startingSimulation !== startingSimulation) {
      this.startingSimulation = startingSimulation;
      if (startingSimulation) {
        this.domCache.videoText.style.display = 'inline-block';
        this.domCache.videoTextStartingSimulation.style.display = 'block';
        this.domCache.videoText.classList.add('buffering');
        this.setFrameNotSaved(false);
        this.setFrameNotSimulated(false);
      } else {
        this.domCache.videoTextStartingSimulation.style.display = 'none';
        this.domCache.videoText.classList.remove('buffering');
        if (!this.frameNotSaved && !this.frameNotSimulated) {
          this.domCache.videoText.style.display = 'none';
        }
      }
    }
  };

  DynamicVideo.prototype.pause = function () {
    this.initializer.clock.stop();
  };

  DynamicVideo.prototype.play = function () {
    this.initializer.clock.start();
  };
  
  /*
   * Toggle play and pause
   */
  DynamicVideo.prototype.playPause = function () {
    this.initializer.clock.toggleIsRunning();
  };

  /*
   * Calculates when the next frame should be videoed
   */
  DynamicVideo.prototype.draw = function (clock) {
    var t = clock.getT();

    this.setTMax(Math.max(this.highestShownTMax, clock.getShownTMax(t)));
    this.setTValue(t);
    this.setTMin(clock.getTMin(t));

    if (this.isFrameShown(t)) {
      try {
        this.drawFrame(t);
      } catch (e) {
        if ((e !== 'Unknown variable') && (e !== 'Unknown frame')) {
          this.pause();
          throw e;
        }
      }
    }
  };

  DynamicVideo.prototype.isFrameShown = function (t) {
    return t !== this.shownT ||
      this.drawMode !== this.shownDrawMode;
  };

  DynamicVideo.prototype.setTValue = function (t) {
    if (this.shownTValue !== t) {
      if (this.features.timeProgressBar) {
        this.domCache.inputT.value = t;
      }
      if (this.features.timeLabel) {
        this.domCache.labelValueT.textContent = t;
      }
      this.shownTValue = t;
    }
  };

  DynamicVideo.prototype.setTMin = function (tMin) {
    if (this.shownTMin !== tMin) {
      if (this.features.timeProgressBar) {
        this.domCache.inputT.min = tMin;
      }
      this.shownTMin = tMin;
    }
  };

  DynamicVideo.prototype.setTMax = function (tMax) {
    if (this.shownTMax !== tMax) {
      if (this.features.timeProgressBar) {
        this.domCache.inputT.max = tMax;
      }
      this.shownTMax = tMax;
      this.highestShownTMax = Math.max(tMax, this.highestShownTMax);
    }
  };

  DynamicVideo.prototype.skipToFirst = function () {
    this.initializer.clock.setT(this.simulation.protocol.tMin);
  };

  DynamicVideo.prototype.skipToLast = function () {
    this.initializer.clock.setT(this.simulation.protocol.tMax);
  };

  DynamicVideo.prototype.getFrameWidth = function () {
    return this.width;
  };

  DynamicVideo.prototype.getFrameHeight = function () {
    return this.height;
  };




  var MAGIC_STR = 'spimosimState:';//Start sequence for files storing state

  var imageSaver = {
    GIF_WORKER_URL: '../ext_lib/lib/gif.js/gif.worker.js',
    /*
     * Saves the video as an animated GIF
     */
    saveAnimatedGif: function (simulation, video, downloader, fps, stepsPerFrame, tMin,
        tMax, fileName, gifWorkerUrl) {
      var taskId,
        timePerFrame = 1000 / fps * stepsPerFrame,
        width = video.getFrameWidth(),//width for 2d, n for 1d
        height = video.getFrameHeight(),//height for 2d, 1 for 1d
        drawMode = video.drawMode,
        gif = new GIF({
          workers: 1,//1 thread
          quality: 1,//high quality
          width: width,
          height: height,
          workerScript: gifWorkerUrl || this.GIF_WORKER_URL
        }),
        ctx = imageSaver.createContext(width, height),//invisble context
        imageData = video.createImageData(ctx),//for caching purposes
        pixels = new Int32Array(imageData.data.buffer),//for caching purposes
        protocol = simulation.protocol,
        t = tMin;

      if (downloader) {
        gif.on('progress', function (percent) {
          downloader.setProgress(taskId, 1 + percent);
        });//update progress bar for every frame that GIF.js encodes.
      }

      gif.on('finished', function (blob) {
        var url = URL.createObjectURL(blob);//Convert blob to URL
        graphicTools.startDownload(url, fileName);//Download from the URL
        if (downloader) {
          downloader.removeDownload(taskId);
        }
      });//Start the download after the rendering finished

      function showErrorAndRemove(e) {
        alert('GIF could not be created:\nError: ' + e);
        downloader.removeDownload(taskId);
      };//Start the download after the rendering finished

      function drawNextFrame() {
        if (downloader) {
          downloader.setProgress(taskId, (t - tMin) / (tMax - tMin + 1));//Update progress bar
        }
        if (t < tMax) {
          switch (video.drawMethod) {
            case 'image data':
              try {
                video.drawFrameInImageData(pixels, protocol, t, drawMode);
              } catch (e) {
                showErrorAndRemove(e);
              }
              ctx.putImageData(imageData, 0, 0);//Draw the imageData
              break;
            case 'canvas':
              try {
                video.drawFrameInContext(ctx, protocol, t, drawMode);
              } catch (e) {
                showErrorAndRemove(e);
              }
              break;
            default:
              showErrorAndRemove('Error: Cannot render with draw method "' + video.drawMethod + '".');
          }

          gif.addFrame(ctx, {
            delay: timePerFrame,
            copy: true//Copy pixels from context because they will be redrawn in the next step
          });//Save frame in gif object

          t += stepsPerFrame;
          setTimeout(drawNextFrame, 0);//Starts itself using a timeout to prevent freezing GUI
        } else {
          //All frames are safed but not encoded yet
          gif.render();
        }
      }

      if (downloader) {
        taskId = downloader.addDownload('Rendering GIF: ' + fileName);
        downloader.setProgressMax(taskId, 2);//The GIF is created in 2 steps: drawing and encoding
      }

      drawNextFrame();//Draw first frame
    },

    /*
     * Saves the frame t as a png file
     */
    saveFrame: function (simulation, video, t, fileName) {
      var width = video.getFrameWidth(),
        height = video.getFrameHeight(),
        drawMode = video.drawMode,
        ctx = imageSaver.createContext(width, height),//insible context
        protocol = simulation.protocol;

      
      switch (video.drawMethod) {
        case 'image data':
        var imageData = video.createImageData(ctx),//for caching purposes
          pixels = new Int32Array(imageData.data.buffer);//for caching purposes
          video.drawFrameInImageData(pixels, protocol, t, drawMode);
          ctx.putImageData(imageData, 0, 0);//draw the imageData
          break;
        case 'canvas':
          try {
            video.drawFrameInContext(ctx, protocol, t, drawMode);
          } catch (e) {
            showErrorAndRemove(e);
          }
          break;
        default:
          showErrorAndRemove('Error: Cannot render with draw method "' + video.drawMethod + '".');
      }

      ctx.canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);//Convert blob to URL
        graphicTools.startDownload(url, fileName);//Download from the url
      }, 'image/png', 1);
    },

    /*
     * Saves the frame t as a json file
     */
    saveAsSpimosimFrame: function (simulation, t, fileName) {
      var modelSettings = {};
      for (var name in simulation.modelSettings) {
        if (simulation.modelSettings.hasOwnProperty(name) &&
            !simulation.protocol.vars.hasOwnProperty(name)) {
          modelSettings[name] = simulation.modelSettings[name];
        }
      }

      var blob = new Blob(
          [
            MAGIC_STR,
            '[' + JSON.stringify(modelSettings) + ',' + simulation.protocol.getAsJson(t) + ']'
          ],
          { type: 'bin/spimosim' }),
        url = URL.createObjectURL(blob);//Convert blob to URL

      graphicTools.startDownload(url, fileName);//Download from the url
    },

    /*
     * Generates a canvas element that is not attached to the document and return
     * its context.
     */
    createContext: function (width, height) {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      return canvas.getContext('2d');
    },
  };

  /* -------------------------------MODEL INFO------------------------------- */

  function ModelInfo(infoSection) {
    this.initGui(infoSection);
  }

  ModelInfo.prototype.setContent = function (html) {
    this.domCache.infoContent.innerHTML = html;
  };

  ModelInfo.prototype.setContentFromUrl = function (infoUrl) {
    this.domCache.infoContent.textContent = 'Loading model info...';

    var request = new XMLHttpRequest();
    var modelInfo = this;
    request.onload = function() {
      if (request.readyState === 4 && request.status === 200) {
        modelInfo.setContent(request.responseText);
      }
    };

    request.open('GET', infoUrl, true);
    request.send();
  };

  ModelInfo.prototype.setNoContent = function () {
    this.domCache.infoContent.textContent = 'No information about the model available';
  };

  ModelInfo.prototype.show = function () {
    this.domCache.infoSection.classList.remove('hidden-main-info');
    this.domCache.infoSection.classList.add('shown-main-info');
  };

  ModelInfo.prototype.hide = function () {
    this.domCache.infoSection.classList.remove('shown-main-info');
    this.domCache.infoSection.classList.add('hidden-main-info');
  };

  ModelInfo.prototype.initGui = function (infoSection) {
    var box = cE('div');
    infoSection.appendChild(box);

    var buttonHideInfo = cE('button');
    buttonHideInfo.className = 'ok';
    buttonHideInfo.textContent = 'OK';
    box.appendChild(buttonHideInfo);

    var infoContent = cE('div');
    infoContent.className = 'info-content';
    box.appendChild(infoContent);

    infoSection.classList.add('info');

    this.domCache = {
      box: box,
      infoContent: infoContent,
      infoSection: infoSection
    };
    
    infoSection.classList.add('main-info');
    if (this.isShown()) {
      this.domCache.infoSection.classList.add('shown-main-info');
    } else {
      this.domCache.infoSection.classList.add('hidden-main-info');
    }

    var modelInfo = this;
    buttonHideInfo.addEventListener('click', function () {
      modelInfo.hide();
    });
  };

  ModelInfo.prototype.destroy = function () {
    this.domCache.box.remove();
  };

  ModelInfo.prototype.isShown = function () {
    return !this.domCache.infoSection.classList.contains('hidden-main-info');
  };

  /* -----------------------------------HELP--------------------------------- */

  function Help(helpSection, helpTextId, iconUrl) {
    this.helpTextId = helpTextId;
    this.iconUrl = iconUrl || Help.ICON_URL;
    this.initGui(helpSection);
  }

  Help.prototype.show = function () {
    document.body.classList.remove('no-explanations');
    this.domCache.helpSection.classList.remove('hidden-main-info');
    this.domCache.helpSection.classList.add('shown-main-info');
  };

  Help.prototype.hide = function () {
    document.body.classList.add('no-explanations');
    this.domCache.helpSection.classList.remove('shown-main-info');
    this.domCache.helpSection.classList.add('hidden-main-info');
  };

  Help.prototype.initGui = function (helpSection) {
    var box = cE('div');
    
    var buttonHideHelp = cE('button');
    buttonHideHelp.className = 'ok';
    buttonHideHelp.textContent = 'OK';
    box.appendChild(buttonHideHelp);

    var help = this;
    buttonHideHelp.addEventListener('click', function () {
      help.hide();
    });

    var helpContent = cE('div');
    box.appendChild(helpContent);

    helpContent.innerHTML = this.generateHelpText();

    this.domCache = {
      helpSection: helpSection,
      box: box
    };

    helpSection.classList.add('help');
    helpSection.classList.add('info');
    helpSection.classList.add('main-info');
    if (this.isShown()) {
      helpSection.classList.add('shown-main-info');
    } else {
      helpSection.classList.add('hidden-main-info');
    }

    helpSection.appendChild(box);
  };

  Help.prototype.destroy = function () {
    this.domCache.box.remove();
  };

  Help.ICON_URL = '../lib/spimosimUi/icon';
  Help.prototype.generateHelpText = function () {
    if (this.helpTextId) {
      return (modules.get('HelpTextGenerator', this.helpTextId))(this.iconUrl);
    } else {
     return this.generateDefaultHelpText(this.iconUrl);
    }
  }
  
  Help.prototype.generateDefaultHelpText = function (iconUrl) {
    return '<h2>Help</h2>' +
      '<p>' +
      '  On this website you can play with several interesting models studied by' +
      '  physicists in the field of statistical mechanics and complex systems.' +
      '  Use the arrows next to the model name to switch between models.' +
      '<p>' +
      '' +
      '<p>' +
      '  In the "controls" section you can change parameters of the model. Click' +
      '  <ul>' +
      '    <li><img class="inline-symbol" src="' + iconUrl + '/restart.svg"> to restart the simulation,</li>' +
      '    <li><img class="inline-symbol" src="' + iconUrl + '/ending-mode.svg"> to toggle if the simulation should run forever or just for a fixed number of steps,</li>' +
      '    <li><img class="inline-symbol" src="' + iconUrl + '/time-plus.svg"> to simulate more steps,</li>' +
      '    <li><img class="inline-symbol" src="' + iconUrl + '/delete-old-data.svg"> to delete all previous time steps,</li>' +
      '    <li><img class="inline-symbol" src="' + iconUrl + '/settings.svg"> to show more options.</li>' +
      '  </ul>' +
      '<p>' +
      '' +
      '<p>' +
      '  In the "video" section(s) you can see the state of the model. Click' +
      '  <img class="inline-symbol" src="' + iconUrl + '/settings.svg"> to show more' +
      '  options or <img style="background-color: black" class="inline-symbol" src="' + iconUrl + '/expand.svg"> to switch to fullscreen mode.' +
      '</p>' +
      '' +
      '<p>' +
      '  In the "plotter" section(s) you can create plots to visualize and analyze the' +
      '  simulated data. Create a new plot by selecting one from the list and click the' +
      '  "Create plot" button. Some plots have settings that appear below the plot. At' + 
      '  an existing plot click <img class="inline-symbol" src="' + iconUrl  + '/tools.svg">' +
      '  to download CSV files, create fits, and more.' +
      '</p>';
  };

  Help.prototype.isShown = function () {
    return !this.domCache.helpSection.classList.contains('hidden-main-info');
  };


  /* ---------------------------------DOWNLOADS------------------------------ */

  function Downloader(downloadsSection) {
    EventAttacher.call(this);

    this.downloads = {};//All downloads
    this.counter = 0;//number of downloads
    this.idCounter = 0;

    var div = this.initGui();
    div.classList.add('downloads-container');
    downloadsSection.appendChild(div);
    downloadsSection.classList.add('empty-downloads');

    this.domCache.downloadsSection = downloadsSection;
  }

  Downloader.prototype = Object.create(EventAttacher.prototype);

  Downloader.prototype.initGui = function () {
    var box = document.createElement('div'),
      heading = document.createElement('h2'),
      downloadsList = document.createElement('ul');

    heading.textContent = 'Downloads';
    downloadsList.className = 'downloads-list';

    box.appendChild(heading);
    box.appendChild(downloadsList);

    this.domCache = {
      box: box,
      downloadsList: downloadsList
    };

    return box;
  };

  Downloader.prototype.destroy = function () {
    this.domCache.box.remove();
  };

  Downloader.prototype.addDownload = function (name) {
    var progress;

    if (this.counter === 0) {
      this.domCache.downloadsSection.classList.remove('empty-downloads');
    }

    var listItem = document.createElement('li'),
      progress = document.createElement('progress'),
      description = document.createElement('span');

    description.textContent = name;

    listItem.appendChild(progress);
    listItem.appendChild(description);

    this.domCache.downloadsList.appendChild(listItem);

    var id = this.idCounter++;

    this.downloads[id] = {
      name: name,
      div: listItem,
      progress: progress
    };

    this.counter++;//number of downloads increased by 1

    return id;
  };

  Downloader.prototype.removeDownload = function (id) {
    var div = this.downloads[id].div;
    this.domCache.downloadsList.removeChild(div);

    this.downloads[id] = undefined;//Mark download as deleted
    this.counter--;//one task less

    if (this.counter === 0) {
      this.domCache.downloadsSection.classList.add('empty-downloads');
    }
  };

  Downloader.prototype.setProgress = function(id, value) {
    this.downloads[id].progress.value = value;
  };

  Downloader.prototype.setProgressMax = function(id, maxValue) {
    this.downloads[id].progress.max = maxValue;
  };

  Downloader.prototype.showProgress = function(id) {
    this.downloads[id].progress.style.opacity = 1;
  };

  Downloader.prototype.hideProgress = function(id) {
    this.downloads[id].progress.style.opacity = 0;
  };

  
  /* -----------------------------------PLOTS-------------------------------- */

  function BasicPlotter(initializer, config, plotSection, colorSet, fitBackendConfig, dataSource) {
    EventAttacher.call(this);
    FeatureActivatable.call(this, config.features, 'BasicPlotter');
    spimosimCore.PlotterFrontend.call(this, BasicPlotter.createPlotTypes(config.plotTypes), config.backend);
    this.initializer = initializer;
    this.config = config;
    this.fitBackendConfig = fitBackendConfig;
    this.colorSet = colorSet;

    this.dataSource = dataSource;//Needed for initGui

    var div = this.initGui();
    div.classList.add('plotter-container');
    plotSection.appendChild(div);

    if (dataSource !== undefined) {
      this.setDataSource(dataSource);
    }

    if (config.defaultPlots) {
      this.plotAll(config.defaultPlots);
    }
  }
  BasicPlotter.prototype = Object.create(spimosimCore.PlotterFrontend.prototype);
  tools.addToPrototype(BasicPlotter, EventAttacher);
  tools.addToPrototype(BasicPlotter, FeatureActivatable);

  BasicPlotter.prototype.availableFeatures = {
    BasicPlotter: [
      {
        name: 'deletable plots'
      },
      {
        name: 'description under plots'
      },
      {
        name: 'create plot menu'
      }
    ]
  };

  BasicPlotter.createPlotTypes = function (plotTypeNames) {
    var plotTypes = {};

    for (var i = 0, len = plotTypeNames.length; i < len; i++) {
      var name = plotTypeNames[i];
      plotTypes[name] = modules.get('PlotDisplay', name);
    }

    return plotTypes;
  };
  
  BasicPlotter.prototype.plotAll = function (plotSettings) {
    for (var i = 0, len = plotSettings.length; i < len; i++) {
      var plotType = plotSettings[i].type;
      if (this.plotTypes[plotType] === undefined) {
        throw 'Unknown plot type: ' + plotType;
      }
      var plot = this.plot(plotType, plotSettings[i].settings);
      if (plotSettings[i].settings !== undefined && plotSettings[i].settings.fit !== undefined) {
        plot.initFitter();
      }
      if (plotSettings[i].deducedPlots) {
        plot.deducedPlotter.plotAll(plotSettings[i].deducedPlots);
      }
    }
  };

  BasicPlotter.prototype.initGui = function () {
    var box = cE('div'),
      divCurrentPlots, plotTypeSelect, divNewPlotSettings, pDescription, createPlotMenu, buttonCreatePlot;
    var plotter = this;
    
    divCurrentPlots = cE('div');
    divCurrentPlots.className = 'plots';
    divCurrentPlots.id = tools.randId('plot_div');
    box.appendChild(divCurrentPlots);

    if (this.features['create plot menu']) {
      createPlotMenu = cE('form');
      createPlotMenu.action = 'javascript:void(0)';
      createPlotMenu.className = 'create-plot-menu';
      
      var submitButton = cE('button');
      submitButton.type = 'submit';
      submitButton.style.display = 'none';
      createPlotMenu.appendChild(submitButton);

      var headingCreatePlotMenu = cE('h3');
      headingCreatePlotMenu.textContent = 'New plot';
      createPlotMenu.appendChild(headingCreatePlotMenu);

      plotTypeSelect = cE('select');
      plotTypeSelect.className = 'plot-type-select';
      createPlotMenu.appendChild(plotTypeSelect);


      buttonCreatePlot = cE('button');
      buttonCreatePlot.type = 'button';
      buttonCreatePlot.className = 'create-plot main-button';
      buttonCreatePlot.textContent = 'Create plot';
      createPlotMenu.appendChild(buttonCreatePlot);

      pDescription = cE('p');
      pDescription.className = 'plot-description';
      createPlotMenu.appendChild(pDescription);

      divNewPlotSettings = cE('div');
      divNewPlotSettings.className = 'new-plot-settings settings';
      createPlotMenu.appendChild(divNewPlotSettings);

      for (var type in this.plotTypes) {
        if (this.plotTypes.hasOwnProperty(type)) {
          var PlotDisplay = this.plotTypes[type];

          var option = cE('option');
          option.value = type;
          option.innerHTML = PlotDisplay.optionText;

          plotTypeSelect.appendChild(option);
        }
      }

      if (Object.keys(this.plotTypes).length === 0) {
        buttonCreatePlot.disabled = true;
      }
    
      box.appendChild(createPlotMenu);

      this.attachEventListeners([
        {
          dispatcher: buttonCreatePlot,
          type: 'click',
          callback: function (){
            plotter.plot();
          }
        },
        {
          dispatcher: createPlotMenu,
          type: 'submit',
          callback: function (){
            plotter.plot();
          }
        },
        {
          dispatcher: plotTypeSelect,
          type: 'change',
          callback: function () {
            plotter.updateNewPlotSettings();
          }
        }]);
    }

    this.domCache = {
      divCurrentPlots: divCurrentPlots,
      plotTypeSelect: plotTypeSelect,
      divNewPlotSettings: divNewPlotSettings,
      pDescription: pDescription,
      createPlotMenu: createPlotMenu,
      buttonCreatePlot: buttonCreatePlot,
      box: box,
    };

    if (this.features['create plot menu']) {
      this.updateNewPlotSettings();
    }

    return box;
  };

  BasicPlotter.prototype.replotPlots = function () {
    for (var i = 0, len = this.plots.length; i < len; i++) {
      this.plots[i].replot();
    };
  };

  BasicPlotter.prototype.updateNewPlotSettings = function () {
    if (Object.keys(this.plotTypes).length > 0 && this.features['create plot menu']) {
      var type = this.domCache.plotTypeSelect.value;

      graphicTools.removeAllChildNodes(this.domCache.divNewPlotSettings);
      this.domCache.pDescription.innerHTML = this.plotTypes[type].prototype.description;
      
      this.domCache.inputsNewPlotSettings = {};
      var getSettingsConfig = this.plotTypes[type].getSettingsConfig;
      if (getSettingsConfig !== undefined) {
        var config = getSettingsConfig(this);

        this.domCache.inputsNewPlotSettings = graphicTools.createSettings(config, this.domCache.divNewPlotSettings);
      }
    }
  };

  BasicPlotter.prototype.plot = function (plotType, settings) {
    return spimosimCore.PlotterFrontend.prototype.plot.call(this,
      plotType || this.domCache.plotTypeSelect.value, settings || this.getNewPlotSettings());
  };

  BasicPlotter.prototype.plotCustom = function (plot) {
    spimosimCore.PlotterFrontend.prototype.plotCustom.call(this, plot);

    var box = plot.initGui();

    var divCurrentPlots = this.domCache.divCurrentPlots;
    if (divCurrentPlots.firstChild) {
      divCurrentPlots.insertBefore(box, divCurrentPlots.firstChild);
    } else {
      divCurrentPlots.appendChild(box);
    }

    graphicTools.enableDragAndDropMove(box, box, function (e) {
      e.dataTransfer.setData('text/plain', plot.dataAggregator.getCsv());
    });

    return plot;
  };

  BasicPlotter.prototype.getNewPlotSettings = function () {
    var settings = {};
    var inputs = this.domCache.inputsNewPlotSettings;
    for (var name in inputs) {
      if (inputs.hasOwnProperty(name)) {
        var input = inputs[name];
        settings[name] = input.getValue();
      }
    }

    return settings;
  };
  /*
   * Set the simulation and request its models configuration
   */
  BasicPlotter.prototype.setDataSource = function (dataSource) {
    spimosimCore.PlotterFrontend.prototype.setDataSource.call(this, dataSource);
  };

  BasicPlotter.prototype.resize = function () {
    for (var i = 0, len = this.plots.length; i < len; i++) {
      this.plots[i].resize();
    };
  };


  BasicPlotter.prototype.destroy = function () {
    EventAttacher.prototype.destroy.call(this);
    spimosimCore.PlotterFrontend.prototype.destroy.call(this);

    this.domCache.box.remove();
  };

  BasicPlotter.prototype.getParametersForFileName = function () {
    return this.dataSource.getParametersForFileName();
  }
  
  BasicPlotter.prototype.getColor = function () {
    return this.colorSet.strColorSet.PLOT || this.fallbackColors.PLOT;
  };

  BasicPlotter.prototype.getFadedColor = function () {
    return this.colorSet.strColorSet.FADED_PLOT || this.fallbackColors.FADED_PLOT;
  };

  BasicPlotter.prototype.getCursorColor = function () {
    return this.colorSet.strColorSet.PLOT_CURSOR || this.fallbackColors.PLOT_CURSOR;
  };

  BasicPlotter.generateFallbackColors = function (element) {
    var faded = cE('div');
    faded.className = 'faded';
    element.appendChild(faded);
    var link = cE('a');
    link.href = '#';
    element.appendChild(link);
    this.prototype.fallbackColors = {
      PLOT: graphicTools.getFontColor(element),
      PLOT_FADED: graphicTools.getFontColor(faded),
      PLOT_CURSOR: graphicTools.getFontColor(link)
    }
    element.removeChild(link);
    element.removeChild(faded);
  }

  BasicPlotter.prototype.fallbackColors = {
    PLOT: colorSet.THEME_DARK,
    PLOT_FADED: colorSet.THEME_NORMAL,
    PLOT_CURSOR: colorSet.THEME_MAIN
  };

  function Plotter(initializer, config, plotSection, colorSet, fitBackendConfig, dataSource) {
    FeatureActivatable.call(this, config.features, 'Plotter');
    BasicPlotter.call(this, initializer, config, plotSection, colorSet, fitBackendConfig, dataSource);
    plotSection.classList.add('plotter');
    if (!this.features['description under plots']) {
      plotSection.classList.add('no-description-under-plots');
    }
  }
  Plotter.prototype = Object.create(BasicPlotter.prototype);
  
  Plotter.prototype.availableFeatures.Plotter = [
    {
      name: 'old plot options'
    },
    {
      name: 'keep plots',
      activates: [ 'old plot options' ]
    },
    {
      name: 'delete on restart',
      activates: [ 'old plot options' ]
    }
  ];


  Plotter.prototype.initGui = function () {
    var box = BasicPlotter.prototype.initGui.call(this);
    var plotter = this;

    if (this.features['delete on restart']) {
      var plotSettings = cE('div');
      plotSettings.className = 'plot-settings corner-menu';

      var buttonPlotSettings = cE('button');
      buttonPlotSettings.className = 'open-corner-menu';
      plotSettings.appendChild(buttonPlotSettings);


      var plotSettingsContent = cE('div');
      plotSettingsContent.className = 'corner-menu-contents';

      var oldPlotsQuestion = cE('p');
      oldPlotsQuestion.textContent =
        'What should happen to the plot if a new simulation is started?';
      plotSettingsContent.appendChild(oldPlotsQuestion);


      var oldPlotsOptions = {
        'replot-plots': 'Replot for the new simulation',
        'delete-plots': 'Delete the plot'
      };

      if (this.features['keep plots']) {  
        oldPlotsOptions['keep-plots'] = "Move the plot to the 'Previous plots' section";
      }

      var inputsOldPlots = {};

      for (var name in oldPlotsOptions) {
        if (oldPlotsOptions.hasOwnProperty(name)) {

          var surroundingSpan = cE('span');

          var oldPlotsInput = cE('input');
          oldPlotsInput.value = name;
          oldPlotsInput.name = 'old-plots';
          oldPlotsInput.type = 'radio';
          oldPlotsInput.id = name;
          surroundingSpan.appendChild(oldPlotsInput);


          var oldPlotsLabel = cE('label');
          oldPlotsLabel.htmlFor = name;
          oldPlotsLabel.textContent = oldPlotsOptions[name];
          surroundingSpan.appendChild(oldPlotsLabel);

          plotSettingsContent.appendChild(surroundingSpan);

          inputsOldPlots[name] = oldPlotsInput;
        }
      }
      
      if (this.oldPlotsDefault in inputsOldPlots) {
        inputsOldPlots[this.oldPlotsDefault].checked = true;
      }

      plotSettings.appendChild(plotSettingsContent);
    
      this.domCache.radioDeleteOldPlots = inputsOldPlots['delete-plots'];
      this.domCache.radioReplotOldPlots = inputsOldPlots['replot-plots'];
      this.domCache.plotsSettings = plotSettings;
      this.domCache.buttonPlotSettings = buttonPlotSettings;

      box.insertBefore(plotSettings, this.domCache.divCurrentPlots);

      if (this.features['keep plots']) {
        this.domCache.radioKeepOldPlots = inputsOldPlots['keep-plots'];
        
        var headingCurrentPlots = cE('h3');
        headingCurrentPlots.textContent = 'Current plots';

        var headingOldPlots = cE('h3');
        headingOldPlots.textContent = 'Previous plots';


        var oldPlotsExplanation = cE('p');
        oldPlotsExplanation.className = 'explanation';
        oldPlotsExplanation.textContent =
          'These plots are based on data from previous simulations';


        var divOldPlots = cE('div');
        divOldPlots.className = 'old-plots faded';
        divOldPlots.id = tools.randId('old_plot_div');

        box.insertBefore(headingCurrentPlots, this.domCache.divCurrentPlots);
        box.insertBefore(headingOldPlots, this.domCache.createPlotMenu);
        box.insertBefore(oldPlotsExplanation, this.domCache.createPlotMenu);
        box.insertBefore(divOldPlots, this.domCache.createPlotMenu);
      }

      this.domCache.divOldPlots = divOldPlots;
      
      function setOldPlotsDefault(e) {
        Plotter.prototype.oldPlotsDefault = e.target.value;
      }
      
      this.attachEventListeners([
        {
          dispatcher: this.domCache.radioReplotOldPlots,
          type: 'change',
          callback: setOldPlotsDefault
        },
        {
          dispatcher: this.domCache.radioDeleteOldPlots,
          type: 'change',
          callback: setOldPlotsDefault
        },
        {
          dispatcher: this.domCache.radioKeepOldPlots,
          type: 'change',
          callback: setOldPlotsDefault
        }
      ]);
    }
    
    if (!this.features['deletable plots']) {
      box.classList.add('fix-plots');
    }

    if (!this.features['keep plots']) {
      box.classList.add('no-old-plots');
    }
    
    if (this.features['delete on restart']) {
      this.attachEventListeners([
        {
          dispatcher: document,
          type: 'click',
          callback: function (e) {
            if (!plotter.domCache.plotsSettings.contains(e.target)) {
              plotter.domCache.plotsSettings.classList.remove('corner-menu-expanded');
            }
          }
        },
        {
          dispatcher: this.domCache.buttonPlotSettings,
          type: 'click',
          callback: function (e) {
            plotter.domCache.plotsSettings.classList.toggle('corner-menu-expanded');
          }
        }
      ]);
    }

    this.resizeAnimFrameId = requestAnimationFrame(function (){
      plotter.resize();
    });

    return box;
  };

  Plotter.prototype.destroy = function () {
    cancelAnimationFrame(this.resizeAnimFrameId);
    BasicPlotter.prototype.destroy.call(this);
  };

  Plotter.prototype.oldPlotsDefault = 'replot-plots';

  Plotter.prototype.setDataSource = function (dataSource) {
    spimosimCore.PlotterFrontend.prototype.setDataSource.call(this, dataSource);

    if (this.features['keep plots'] && this.domCache.radioKeepOldPlots.checked) {
      this.makePlotsOld();
    } else if (this.features['old plot options'] && this.domCache.radioDeleteOldPlots.checked) {
      this.removePlots();
    } else {
      this.replotPlots();
    }
  };

  Plotter.prototype.makePlotsOld = function (keepOldPlots) {
    var plotter = this;
    this.plots.forEach(function (plot) {
      plotter.makePlotOld(plot, keepOldPlots);
    });
  };

  Plotter.prototype.makePlotOld = function (plot, keepOldPlots) {
    plot.makePlotOld();

    this.domCache.divOldPlots.appendChild(plot.domCache.box);

//not .dygraph-title
    graphicTools.enableDragAndDropMove(this.domCache.box, plot.domCache.box);
  };

  function PlotDisplay(plotter, settings) {
    EventAttacher.call(this);

    this.compactName = plotter.dataSource.compactName + '-' +
      graphicTools.toValidFileName(this.plotType);

    this.plotter = plotter;
    this.parametersForFileName = this.plotter.getParametersForFileName();
    this.isFullscreen = false;

    this.drawState = {
      initialized: false,
      upToDate: false,
      error: false
    };

    this.isOld = false;
    var plot = this;
    this.boundSetNotUpToDate = function () {
      plot.drawState.upToDate = false;
    };

    this.setDataAggregator(this.getNewDataAggregator(plotter, settings));

    this.plotter.initializer.clock.addAnimator(this);
  }
  PlotDisplay.prototype = Object.create(EventAttacher.prototype);

  PlotDisplay.prototype.getNewDataAggregator = function (plotter, settings) {
    return new (modules.get('DataAggregator', this.plotType))(plotter, settings);
  };

  PlotDisplay.prototype.defaultLogScaleMode = 'none';
  
  PlotDisplay.prototype.resize = function () {
    if (this.drawState.initialized) {
      this.g.resize();
    }
    this.deducedPlotter.resize();
  };

  PlotDisplay.prototype.replot = function () {
    if (this.drawState.initialized) {
      this.destroyGraph();

      this.drawState = {
        initialized: false,
        upToDate: false,
        error: false
      }
    } else if (this.drawState.error === 'noData') {
      graphicTools.removeAllChildNodes(this.domCache.div);

      this.drawState = {
        initialized: false,
        upToDate: false,
        error: false
      }
    }

    this.setAutoUpdate(false);

    var refit = this.dataAggregator.fitter !== undefined;
    var settings = this.dataAggregator.settings;

    this.dataAggregator.destroy();

    this.setDataAggregator(this.getNewDataAggregator(this.plotter, settings));
    this.initBackend(this.plotter.backendConfig);

    this.domCache.checkboxAutoUpdate.checked = true;
    this.setAutoUpdate(true);

    if (refit) {
      this.initFitter();
    }

    this.deducedPlotter.setDataSource(this.dataAggregator);
    this.deducedPlotter.replotPlots();
  };

  PlotDisplay.prototype.removeLiveOptions = function () {
    this.domCache.liveOptions.remove();
    this.drawState.upToDate = false;
    this.deducedPlotter.plots.forEach(function (plot) {
      plot.removeLiveOptions();
    });
  };

  PlotDisplay.prototype.updateFitSettings = function () {
    if (this.drawState.initialized) {
      var fitLabels = this.getFitLabels(),
        len = fitLabels.length;

      if (len > 0) {
        var options = {
          labels: this.getSeriesLabels(true),
          file: this.getData()
        };

        if (options.series === undefined) {
          options.series = {};
        }

        for (var i = 0, len = fitLabels.length; i < len; i++) {
          options.series[fitLabels[i]] = {
            strokeWidth: 1,
            drawPoints: false
          };
        }
        this.g.updateOptions(options);
      }
    }
  };
  PlotDisplay.prototype.seriesLabels = [ 'x', 'y' ];

  PlotDisplay.prototype.getSeriesLabels = function (withFits) {
    var labels = this.seriesLabels;

    if (withFits) {
      labels = labels.concat(this.getFitLabels());
    }

    return labels;
  };

  PlotDisplay.prototype.getLogScaleMode = function () {
    return this.dataAggregator.settings.logScaleMode || this.defaultLogScaleMode;
  };

  PlotDisplay.prototype.getFitLabels = function () {
    var labels = [],
      fitter = this.dataAggregator.fitter;

    if (fitter) {
      for (var i = 0, len = fitter.fits.length; i < len; i++) {
        labels.push('Fit' + i);
      }
    }

    return labels;
  };

  PlotDisplay.prototype.updateLogScaleMode = function () {
    if (this.drawState.initialized) {
      this.g.updateOptions(this.getLogScaleOptions());
    }
  };

  PlotDisplay.prototype.getLogScaleOptions = function (options) {
    if (options === undefined) {
      options = {
        logscale: false,
        axes: {
          x: {
            logscale: false
          }
        }
      };
    } else if (options.axes === undefined) {
      options.axes = {
        x: {
          logscale: false
        }
      };
    } else if (options.axes.x === undefined) {
      options.axes.x = {
        logscale: false
      };
    }

    switch (this.getLogScaleMode()) {
      case 'none':
        break;
      case 'x':
        options.axes.x.logscale = true;
        break;
      case 'y':
        options.logscale = true;
        break;
      case 'xy':
        options.axes.x.logscale = true;
        options.logscale = true;
        break;
      default:
        throw 'Unknown log scale mode: ' + mode;
    }

    return options;
  };

  PlotDisplay.prototype.setDataAggregator = function (dataAggregator) {
    this.dataAggregator = dataAggregator;
    this.dataAggregator.owner = this;
    dataAggregator.addEventListener('new data', this.boundSetNotUpToDate);
  };

  PlotDisplay.prototype.getData = function () {
    return this.dataAggregator.getData();
  };

  /*
   * Remove event listeners and destroy plot.
   */
  PlotDisplay.prototype.destroy = function () {
    this.plotter.initializer.clock.removeAnimator(this);
    this.deducedPlotter.destroy();

    this.dataAggregator.destroy();
    if (this.drawState.initialized) {
      this.destroyGraph();
    }

    this.domCache.box.remove();

    EventAttacher.prototype.destroy.call(this);
  };

  PlotDisplay.prototype.initBackend = function (settings) {
    this.dataAggregator.initBackend(settings);
  };

  PlotDisplay.prototype.makePlotOld = function () {
    this.isOld = true;
    this.domCache.preParameterInfo.display = 'block';
    
    this.g.updateOptions({
      color: this.plotter.getFadedColor()
    });

    this.deducedPlotter.plots.forEach(function (plot) {
      plot.makePlotOld();
    });
    this.dataAggregator.destroy();
    this.removeLiveOptions();
  };

  PlotDisplay.prototype.destroyGraph = function () {
    if (this.g) {
      this.g.destroy();
      this.g = undefined;
    }

    if (this.drawState.error) {
      graphicTools.removeAllChildNodes(this.domCache.div);
      this.drawState.error = false;
    }

    this.drawState.initialized = false;
  }

  PlotDisplay.prototype.setError = function (type) {
    if (this.drawState.initialized) {
      this.destroyGraph();
    } else if (this.drawState.error) {
      graphicTools.removeAllChildNodes(this.domCache.div);
    }

    var divError = document.createElement('div'),
      title = document.createElement('div');


    title.className = 'dygraph-title';
    title.textContent = this.plotter.plotTypes[this.plotType].optionText;
    divError.appendChild(title);
    divError.className = 'plot-error';

    switch (type) {
      case 'noData':
        divError.classList.add('plot-no-data');
        break;
      case 'unsupported':
        divError.classList.add('plot-unsupported');
        break;
    }

    this.drawState.initialized = false;
    this.drawState.error = type;

    this.domCache.div.appendChild(divError);
  };

  /*
   * Update the plots data and draw it
   */
  PlotDisplay.prototype.draw = function () {
    if (!this.drawState.initialized) {
      if (this.dataAggregator.unsupportedSettings) {
        if (this.drawState.error !== 'unsupported') {
          this.setError('unsupported');
        }
      } else {
        try {
          this.initGraph();
        } catch (e) {
          if (e === 'Empty data') {
            if (this.drawState.error !== 'noData' &&
                !this.dataAggregator.isExpectingData()) {
              this.setError('noData');
            }
          } else if (e !== 'Unknown frame') {
            throw e;
          }
        }
      }
    } else if (!this.drawState.upToDate) {
      try {
        this.updateGraph();
      } catch (e) {
        if (e === 'Empty data') {
          if (this.drawState.error !== 'noData' &&
              !this.dataAggregator.isExpectingData()) {
            this.setError('noData');
          }
        } else if (e === 'Unknown frame') {
          this.destroyGraph();
        } else {
          throw e;
        }
      }
    }

    var now = Date.now();
    if (this.lastFrameTime) {
      if (this.msPerFrame) {
        this.msPerFrame = .8 * this.msPerFrame + .2 * (now - this.lastFrameTime);
      } else {
        this.msPerFrame = now - this.lastFrameTime;
      }

      this.dataAggregator.setInterval(5 * this.msPerFrame);
    }

    this.lastFrameTime = now;
  };

  PlotDisplay.prototype.initGraph = function () {
    var data = this.getData(),
      plotOptions = this.getPlotOptions();
    plotOptions.color = this.plotter.getColor();
    plotOptions = this.getLogScaleOptions(plotOptions);

    this.g = new Dygraph(this.domCache.div, data, plotOptions);

    this.drawState.initialized = true;
    this.drawState.upToDate = true;
    this.drawState.error = false;

    this.updateFitSettings();
  };

  PlotDisplay.prototype.updateGraph = function () {
    var data = this.getData();
    this.g.updateOptions({
      file: data
    });

    this.drawState.upToDate = true;
  };

  PlotDisplay.prototype.setAutoUpdate = function (doAutoUpdate) {
    this.dataAggregator.setAutoUpdate(doAutoUpdate);
  }


  /*
   * Download the data of the plot as CSV without updating it
   */
  PlotDisplay.prototype.downloadCsv = function () {
    var blob = new Blob([ this.dataAggregator.getCsv() ], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);//Convert blob to URL
    graphicTools.startDownload(url, this.getCsvFileName());
  };

  PlotDisplay.prototype.initGui = function () {
    var box = cE('div'),//element containing the plot and extra controls
      div = cE('div'),//element containing the plot

      plotDescriptionUnderPlot = cE('div'),
      divDeducedPlots = cE('div'),
      buttons = cE('div'),
      buttonTools = cE('button'),//button for more plot options
      menu = cE('div'),//menu containing more plot options
      menuPlotter = cE('div'),
      divMenuButtons = cE('div'),
      buttonDownloadCsv = cE('button'),//button the download the plot data as CSV
      buttonToggleFullscreen = cE('button'),
      preParameterInfo = cE('pre'),
      liveOptions = cE('form'),
      autoUpdateDiv = cE('div'),
      checkboxAutoUpdate = cE('input'),
      autoUpdateLabel = cE('label'),

      selectLogScaleMode = graphicTools.createSetting({
        type: 'select',
        labelText: 'Log scales:',
        name: 'logscaleMode',
        value: this.getLogScaleMode(),
        texts: [ 'none', 'x', 'y', 'xy' ],
        values: [ 'none', 'x', 'y', 'xy' ]
      }),
      divLogScaleMode = selectLogScaleMode.domElement,

      boxId = tools.randId('plot_box'),
      autoUpdateId = tools.randId('auto_update');

    liveOptions.action = 'javascript:void(0)';

    box.id = boxId;


    box.className = 'plot-box';
    plotDescriptionUnderPlot.className = 'description-under-plot info';
    div.className = 'plot-div';
    divDeducedPlots.className = 'deduced-plots';
    buttons.className = 'plot-buttons';
    buttonTools.className = 'plot-tools';
    menu.className = 'plot-menu';
    buttonDownloadCsv.className = 'plot-download-csv';
    buttonToggleFullscreen.className = 'plot-toggle-fullscreen';
    preParameterInfo.className = 'plot-parameter-info';
    liveOptions.className = 'settings plot-live-options';
    divMenuButtons.className = 'plot-menu-buttons'

    checkboxAutoUpdate.id = autoUpdateId;
    checkboxAutoUpdate.type = 'checkbox';
    autoUpdateLabel.htmlFor = autoUpdateId;
    autoUpdateLabel.textContent = 'Keep updating';

    plotDescriptionUnderPlot.innerHTML = this.description;
    buttonDownloadCsv.textContent = 'Download CSV';
    buttonToggleFullscreen.textContent = 'Toggle fullscreen';
    preParameterInfo.textContent = this.getParameterInfo();

    autoUpdateDiv.appendChild(checkboxAutoUpdate);
    autoUpdateDiv.appendChild(autoUpdateLabel);

    liveOptions.appendChild(autoUpdateDiv);

    divMenuButtons.appendChild(buttonDownloadCsv);
    divMenuButtons.appendChild(buttonToggleFullscreen);

    menu.appendChild(preParameterInfo);
    menu.appendChild(divMenuButtons);
    menu.appendChild(divLogScaleMode);
    menu.appendChild(liveOptions);
    menu.appendChild(menuPlotter);

    buttons.appendChild(buttonTools);

    this.domCache = {
      div: div,
      divDeducedPlots: divDeducedPlots,
      box: box,
      menu: menu,
      menuPlotter: menuPlotter,
      divMenuButtons: divMenuButtons,
      buttonTools: buttonTools,
      buttonDownloadCsv: buttonDownloadCsv,
      liveOptions: liveOptions,
      checkboxAutoUpdate: checkboxAutoUpdate,
      preParameterInfo: preParameterInfo
    };

    if (this.plotter.features['deletable plots']) {
      var close = cE('button');//button to close the plot
      close.className = 'close';
      close.textContent = 'Close';
      buttons.appendChild(close);
      this.domCache.close = close;
      
      this.attachEventListener({
        type: 'click',
        callback: function (e) {
          if (plot.isFullscreen) {
            graphicTools.toggleFullscreen(e, box);
          } else {
            plot.plotter.removePlot(plot);
          }
        },
        dispatcher: close
      });
    }

    box.appendChild(buttons);
    box.appendChild(menu);
    box.appendChild(div);
    box.appendChild(plotDescriptionUnderPlot);

    if (this.fittable) {
      var divFitMenu = cE('div'),
        buttonShowFitMenu = cE('button');

      divFitMenu.className = 'fit-menu';
      buttonShowFitMenu.textContent = 'Fit';
      divMenuButtons.appendChild(buttonShowFitMenu);
      box.appendChild(divFitMenu);

      this.domCache.divFitMenu = divFitMenu;
      this.domCache.fits = {};

      var plot = this;
      buttonShowFitMenu.addEventListener('click', function (e) {
        if (plot.dataAggregator.fitter === undefined) {
          plot.initFitter();
        } else {
          divFitMenu.style.display = 'none';
        }

        plot.closeMenu();
      });
    }

    box.appendChild(divDeducedPlots);

    var plot = this;

    function expandUnexpand() {
      if (document.fullscreen || document.webkitIsFullScreen
          || document.mozFullScreen) {
        //The video is expanded. Leave expanded mode
        box.classList.add('fullscreen-plot');
        plot.isFullscreen = true;
      } else {
        box.classList.remove('fullscreen-plot');
        plot.isFullscreen = false;
      }
    }

    this.attachEventListeners([
      {
        type: 'click',
        callback: function (e) {
          if (e.target !== buttonTools && !menu.contains(e.target)) {
            menu.style.display = 'none';
          }
        },
        dispatcher: document
      },
      {
        type: 'click',
        callback: function () {
          if (menu.style.display !== "unset") {
            menu.style.display = "unset";
          } else {
            menu.style.display = 'none';
          }
        },
        dispatcher: buttonTools
      },
      {
        type: 'change',
        callback: function () {
          plot.dataAggregator.settings.logScaleMode = selectLogScaleMode.getValue();
          plot.updateLogScaleMode();
        },
        dispatcher: selectLogScaleMode
      },
      {
        type: 'click',
        callback: function () {
          plot.closeMenu();
          plot.downloadCsv();
        },
        dispatcher: buttonDownloadCsv
      },
      {
        type: 'click',
        callback: function (e) {
          plot.closeMenu();
          graphicTools.toggleFullscreen(e, box);
        },
        dispatcher: buttonToggleFullscreen,
      },
      {
        dispatcher: document,
        type: 'fullscreenchange',
        callback: expandUnexpand
      },
      {
        dispatcher: document,
        type: 'webkitfullscreenchange',
        callback: expandUnexpand
      },
      {
        dispatcher: document,
        type: 'mozfullscreenchange',
        callback: expandUnexpand
      },
      {
        dispatcher: document,
        type: 'msfullscreenchange',
        callback: expandUnexpand
      },
      {
        type: 'change',
        callback: function () {
          plot.dataAggregator.setAutoUpdate(checkboxAutoUpdate.checked);
        },
        dispatcher: checkboxAutoUpdate
      }
    ]);

    checkboxAutoUpdate.checked = true;
    this.setAutoUpdate(true);

    var deducedFeatures = [];
    if (this.plotter.features['deletable plots']) {
      deducedFeatures.push('deletable plots');
    }
    if (this.plotter.features['create plot menu']) {
      deducedFeatures.push('create plot menu');
    }
    this.deducedPlotter = new BasicPlotter(this.plotter.initializer,
      {
        backend: {
          urls: []
        },
        plotTypes: this.getDeducedPlotTypes(),
        features: deducedFeatures,
      }, menuPlotter, this.plotter.colorSet, this.plotter.fitBackendConfig, this.dataAggregator);
    this.deducedPlotter.backendConfig = this.plotter.backendConfig;
    var plot = this;
    this.deducedPlotter.getParametersForFileName = function () {
      return plot.plotter.getParametersForFileName();
    };

    if (this.plotter.features['create plot menu']) {
      this.attachEventListener({
        dispatcher: this.deducedPlotter.domCache.buttonCreatePlot,
        type: 'click',
        callback: function () {
          plot.closeMenu();
        }
      });
    }

    divDeducedPlots.appendChild(this.deducedPlotter.domCache.divCurrentPlots);
    return box;
  };

  PlotDisplay.prototype.getParameterInfo = function () {
    var settings = this.plotter.dataSource.modelSettings,
      lines = [];

    if (settings) {
      for (var name in settings) {
        if (settings.hasOwnProperty(name)) {
          var value = settings[name],
            type = typeof value;
          if (type === 'number' || type === 'string') {
            lines.push(name + ' = ' + value);
          }
        }
      }
    }

    return lines.join('\n');
  };

  PlotDisplay.prototype.initFitter = function () {
    var fitter = new Fitter(this.dataAggregator, this.dataAggregator.settings.fit,
      this.domCache.divFitMenu, this.plotter.fitBackendConfig);

    this.dataAggregator.setFitter(fitter);

    var plot = this;
    fitter.addEventListener('settings changed',
      function () {
        plot.updateFitSettings();
      }),
    fitter.addEventListener('fitted',
      function () {
        plot.drawState.upToDate = false;
      });

    fitter.triggerSettingsChanged();
  };
  
  PlotDisplay.deducedPlotTypeRegister = new tools.Register();
  
  PlotDisplay.prototype.getDeducedPlotTypes = function () {
    return PlotDisplay.deducedPlotTypeRegister.list();
  };

  PlotDisplay.prototype.closeMenu = function () {
    if (this.domCache.menu.style.display !== 'hidden') {
      this.domCache.buttonTools.click();
    }
  };

  PlotDisplay.prototype.getCsvFileName = function () {
    return this.compactName + '-' + this.parametersForFileName + '.csv';
  }


  /*
   * An abstract plot whos x-values are time values of the simulated steps
   */
  function TimePlotDisplay(plotter, settings) {
    PlotDisplay.call(this, plotter, settings);
    this.drawState.cursorDrawn = false;
    this.drawState.shownT = undefined;
    this.tToShow = undefined;
  };
  TimePlotDisplay.prototype = Object.create(PlotDisplay.prototype);

  TimePlotDisplay.prototype.getIntervalToShow = function () {
    var tMin, tMax;

    if (this.doFollow && !this.isOld) {
      tMin = this.plotter.initializer.clock.getShownTMin(this.tToShow);
      tMax = this.plotter.initializer.clock.getShownTMax(this.tToShow) + 1;
    }

    return [ tMin, tMax ];
  };


  TimePlotDisplay.prototype.getData = function () {
    var interval = this.getIntervalToShow();
    return this.dataAggregator.getData(interval[0], interval[1]);
  };


  TimePlotDisplay.prototype.makePlotOld = function () {
    PlotDisplay.prototype.makePlotOld.call(this);

    this.g.updateOptions({
      clickCallback: null,
      zoomCallback: null,
      drawCallback: null,
      highlightCallback: null,
      unhighlightCallback: null
    });
  };

  TimePlotDisplay.deducedPlotTypeRegister = new tools.Register();
  TimePlotDisplay.prototype.getDeducedPlotTypes = function () {
    return PlotDisplay.deducedPlotTypeRegister.list().concat(TimePlotDisplay.deducedPlotTypeRegister.list());
  };

  TimePlotDisplay.prototype.initGraph = function () {
    PlotDisplay.prototype.initGraph.call(this);

    var plot = this;
    function redrawCursor() {
      plot.drawState.cursorDrawn = false;
    }

    this.g.updateOptions({
      clickCallback: function (e, t) {
        plot.plotter.initializer.clock.setT(t);
      },
      zoomCallback: redrawCursor,
      drawCallback: redrawCursor,//Redraw when whole graph is redrawn
      highlightCallback: redrawCursor,//Redraw when highlighting points (mouse over)
      unhighlightCallback: redrawCursor//Redraw when unnhighlighting points (mouse over)
    });
  }

  TimePlotDisplay.prototype.draw = function (clock) {
    if (!this.isOld) { 
      var lastSelectedRow = null;
      if (this.drawState.initialized) {
        lastSelectedRow = this.g.lastRow_;
      }
      var t = clock.getT();
      if (this.drawState.initialized && this.drawState.shownT !== t) {
        this.drawState.upToDate = false;
      }
      this.tToShow = t;
      PlotDisplay.prototype.draw.call(this, clock);
      if (this.drawState.initialized) {
        if (!this.drawState.cursorDrawn || this.drawState.shownT !== t) {
          var g = this.g;

          var ctx = g.canvas_ctx_,//The graph overlay canvas
            x = g.toDomXCoord(t);//The x coordinate in px corresponding to t

          if (this.lastX !== undefined) {
            ctx.clearRect(this.lastX - 1.5, 0, 4, g.canvas_.height);//Remove old time cursor
          }

          ctx.fillStyle = this.plotter.getCursorColor();
          ctx.fillRect(x - .5, 0, 2, g.canvas_.height);//Draw time cursor at new position

          this.lastX = x;//save position
          this.drawState.shownT = t;
          this.drawState.cursorDrawn = true;
        }
        if (lastSelectedRow !== null) {
          this.g.setSelection(lastSelectedRow);
        }
      }
      this.tToShow = undefined;
    } else {
      PlotDisplay.prototype.draw.call(this, clock);
    }
  };

  TimePlotDisplay.prototype.initGui = function () {
    var idFollowVideo = tools.randId('follow_video'),
      idTimeSteps = tools.randId('time_steps'),
      idIntervalLength = tools.randId('interval_length');

    var box = PlotDisplay.prototype.initGui.call(this);

    var followVideoDiv = cE('div');
    var checkboxFollowVideo = cE('input');
    checkboxFollowVideo.id = idFollowVideo;
    checkboxFollowVideo.type = 'checkbox';

    if (this.plotter.initializer.clock.endlessMode) {
      checkboxFollowVideo.checked = true;
      this.doFollow = true;
    }
    followVideoDiv.appendChild(checkboxFollowVideo);

    var followVideoLabel = cE('label');
    followVideoLabel.htmlFor = idFollowVideo;
    followVideoLabel.textContent = 'Automatic zoom';
    followVideoDiv.appendChild(followVideoLabel);

    this.domCache.checkboxFollowVideo = checkboxFollowVideo;

    this.domCache.liveOptions.appendChild(followVideoDiv);

    var plot = this;
    this.attachEventListener(
      {
        type: 'change',
        callback: function () {
          plot.doFollow = checkboxFollowVideo.checked;
          plot.drawState.upToDate = false;
        },
        dispatcher: checkboxFollowVideo
      }
    );

    return box;
  };

  TimePlotDisplay.prototype.seriesLabels = [ 'Time t', 'y' ];

  function MultiSeriesTimePlotDisplay(plotter, settings, n) {
    this.n = n;

    TimePlotDisplay.call(this, plotter, settings);
  };
  MultiSeriesTimePlotDisplay.prototype = Object.create(TimePlotDisplay.prototype);

  MultiSeriesTimePlotDisplay.deducedPlotTypeRegister = new tools.Register();
  MultiSeriesTimePlotDisplay.prototype.getDeducedPlotTypes = function () {
    return MultiSeriesTimePlotDisplay.deducedPlotTypeRegister.list();
  };

  MultiSeriesTimePlotDisplay.prototype.seriesLabels = [ 'Series # 0', 'Series #' ];

  MultiSeriesTimePlotDisplay.prototype.getSeriesLabels = function (withFits) {
    var labels = [ this.seriesLabels[0] ];

    for (var i = 1; i < this.n; i++) {
      labels.push(this.seriesLabels[1] + ' ' + i.toString());
    }

    if (withFits) {
      labels = labels.concat(this.getFitLabels());
    }

    return labels;
  };


  /* ----------------------------------FITTER-------------------------------- */

  function Fitter(dataAggregator, settings, fitterDiv, backendSettings) {
    spimosimCore.HeadlessFitter.call(this, {
        isPdf: dataAggregator.isPdf,
        isCdf: dataAggregator.isCdf,
        isDiscrete: dataAggregator.isDiscrete
      }, backendSettings);
    this.dataAggregator = dataAggregator;

    fitterDiv.appendChild(this.initGui());

    if (settings !== undefined) {
      for (var i = 0, len = settings.length; i < len; i++) {
        var liFit = document.createElement('li');
        this.domCache.ulFits.appendChild(liFit);

        this.addFit(new Fit(this, liFit, settings[i].vars,
            settings[i].guess, settings[i].xMin, settings[i].xMax,
            settings[i].fnString, settings[i].cdfString));
      }
    }
  }
  Fitter.prototype = Object.create(spimosimCore.HeadlessFitter.prototype);

  Fitter.prototype.initGui = function () {
    var box = cE('div'),
      headingFitMenu = cE('h4'),
      divNewFitMenu = cE('form'),
      selectFitType = cE('select'),
      buttonAddFit = cE('button'),
      ulFits = cE('ul');

    divNewFitMenu.action = 'javascript:void(0)';

    headingFitMenu.textContent = 'Fits';
    buttonAddFit.textContent = 'Add fit';

    ulFits.className = 'fits-list';
    divNewFitMenu.className = 'new-fit-menu';

    var fitTypes = {
      'leastSquares1': 'Least squares fit with 1 parameter',
      'leastSquares2': 'Least squares fit with 2 parameter',
      'leastSquares3': 'Least squares fit with 3 parameter',
      'leastSquares4': 'Least squares fit with 4 parameter',
      'leastSquares5': 'Least squares fit with 5 parameter',
      'leastSquares6': 'Least squares fit with 6 parameter'
    };

    for (var type in fitTypes) {
      if (fitTypes.hasOwnProperty(type)){
        var option = cE('option');
        option.textContent = fitTypes[type];
        option.value = type;
        selectFitType.appendChild(option);
      }
    }

    divNewFitMenu.appendChild(selectFitType);
    divNewFitMenu.appendChild(buttonAddFit);

    box.appendChild(headingFitMenu);
    box.appendChild(divNewFitMenu);
    box.appendChild(ulFits);

    this.domCache = {
      divNewFitMenu: divNewFitMenu,
      ulFits: ulFits,
      selectFitType: selectFitType,
      box: box
    };

    var fitter = this;
    buttonAddFit.addEventListener('click',
      function (e) {
        fitter.newFit();
      });

    return box;
  };

  Fitter.prototype.destroy = function () {
    EventDispatcher.prototype.destroy.call(this);
    spimosimCore.HeadlessFitter.prototype.destroy.call(this);

    this.domCache.box.remove();
  };

  Fitter.prototype.newFit = function (type, config) {
    var type = type || this.domCache.selectFitType.value,
      config = config || {},
      xMin = config.xMin || undefined,
      xMax = config.xMax || undefined,
      fnString = config.fnString || 'a',
      cdfString = config.cdfString || 'a*x',
      vars,
      guess = [],
      fit;

    switch (type) {
      case 'leastSquares6':
        vars = [ 'a', 'b', 'c', 'd', 'e', 'f' ];
        break;
      case 'leastSquares5':
        vars = [ 'a', 'b', 'c', 'd', 'e' ];
        break;
      case 'leastSquares4':
        vars = [ 'a', 'b', 'c', 'd' ];
        break;
      case 'leastSquares3':
        vars = [ 'a', 'b', 'c' ];
        break;
      case 'leastSquares2':
        vars = [ 'a', 'b' ];
        break;
      case 'leastSquares1':
        vars = [ 'a' ];
        break;
    }

    for (var i = 0; i < vars.length; i++) {
      guess.push(1);
    }

    var liFit = document.createElement('li');
    this.domCache.ulFits.appendChild(liFit);

    fit = new Fit(this, liFit, vars, guess, xMin, xMax, fnString, cdfString);

    this.addFit(fit);
  };

  function Fit(fitter, box, vars, guess, xMin, xMax, fnString, cdfString) {
    spimosimCore.HeadlessFit.call(this, fitter, vars, guess, xMin, xMax,
      fnString, cdfString);

    this.initGui(box);
  }
  Fit.prototype = Object.create(spimosimCore.HeadlessFit.prototype);

  var DIGITS = 5;
  Fit.prototype.setResult = function (result) {
    spimosimCore.HeadlessFit.prototype.setResult.call(this, result);

    var fitResultSpans = this.domCache.fitResultSpans;

    for (var i = 0, len = this.vars.length; i < len; i++) {
      fitResultSpans[i].textContent = graphicTools.toFixed(result.solution[i], DIGITS);
    }

    var distanceMsg = '?';
    if (result.distance) {
      distanceMsg = '';
      if (result.distance.msg) {
        distanceMsg += result.distance.msg;
      }
      distanceMsg += ': ' + graphicTools.toFixed(result.distance.distance, DIGITS) + ' (p=' +
          graphicTools.toFixed(result.distance.prob, DIGITS) + ')';
    }
    this.domCache.spanDistance.textContent = distanceMsg;

    this.domCache.spanFitMsg.textContent = result.message;
  }

  Fit.prototype.destroy = function () {
    spimosimCore.HeadlessFit.prototype.destroy.call(this);
    this.domCache.box.remove();
  };

  Fit.prototype.initGui = function (box) {
    var fitInputsConfig = {
      'fnString': {
        type: 'string',
        name: 'fnString',
        labelText: 'Function f(x, ' + this.vars.join(', ') + ')',
      },
      'cdfString': {
        type: 'string',
        name: 'cdfString',
        labelText: 'cdf(x, ' + this.vars.join(', ') + ')',
      },
      'useXMin': {
        value: (this.xMin !== undefined),
        type: 'checkbox',
        name: 'useXMin',
        labelText: 'Lower interval limit',
      },
      'xMin': {
        value: this.xMin,
        step: 'any',
        type: 'number',
        disabled: (this.xMin === undefined),
        name: 'xMin',
        parent: 'useXMin',
        labelText: 'x<sub>min</sub>'
      },
      'useXMax': {
        value: (this.xMax !== undefined),
        type: 'checkbox',
        name: 'useXMax',
        labelText: 'Upper interval limit',
      },
      'xMax': {
        value: this.xMax || 1000,
        step: 'any',
        type: 'number',
        parent: 'useXMax',
        disabled: (this.xMax === undefined),
        name: 'xMax',
        labelText: 'x<sub>max</sub>'
      }
    };

    if (!this.fitter.isPdf || this.fitter.isDiscrete) {
      fitInputsConfig.cdfString = undefined;
    }

    var guessInputs = [],
      fitResultSpans = [],
      generalInputs = {},


      fitForm = cE('form'),
      heading = cE('h5'),
      table = cE('table'),
      tHead = cE('thead'),
      tBody = cE('tbody'),
      tHeadRow = cE('tr'),
      thVarName = cE('th'),
      thFittedValue = cE('th'),
      buttonRemoveFit = cE('button');

    this.domCache = {
      generalInputs: generalInputs,
      guessInputs: guessInputs,
      fitResultSpans: fitResultSpans,
      box: box
    };


    fitForm.action = 'javascript:void(0)';
    fitForm.className = 'settings';

    fitInputsConfig.fnString.value = this.fnString;

    if (this.fitter.isPdf && !this.fitter.isDiscrete) {
      fitInputsConfig.cdfString.value = this.cdfString;
    }

    heading.textContent = 'Least squares fit';

    graphicTools.createSettings(fitInputsConfig, fitForm, undefined, generalInputs);

    buttonRemoveFit.className = 'close';

    var fit = this;
    buttonRemoveFit.addEventListener('click', function () {
      fit.fitter.removeFit(fit);
    });

    heading.appendChild(buttonRemoveFit);

    box.appendChild(heading);
    var pFitMsg = cE('p'),
      spanFitMsg = cE('span');

    pFitMsg.className = 'fit-msg';
    spanFitMsg.className = 'fit-msg-value';

    pFitMsg.textContent = 'Message: ';
    spanFitMsg.textContent = '?';

    pFitMsg.appendChild(spanFitMsg);
    fitForm.appendChild(pFitMsg);

    this.domCache.spanFitMsg = spanFitMsg;

    var pDistance = cE('p'),
      spanDistance = cE('span');

    pDistance.className = 'distance';
    spanDistance.className = 'distance-value';

    pDistance.textContent = 'Distance: ';
    spanDistance.textContent = '?';

    pDistance.appendChild(spanDistance);
    fitForm.appendChild(pDistance);

    this.domCache.spanDistance = spanDistance;


    thVarName.textContent = 'Var name';
    thFittedValue.textContent = 'Fitted value';

    tHeadRow.appendChild(thVarName);

    var thGuess = cE('th');
    thGuess.textContent = 'Guess';
    tHeadRow.appendChild(thGuess);

    tHeadRow.appendChild(thFittedValue);

    tHead.appendChild(tHeadRow);

    table.className = 'guess-table';

    table.appendChild(tHead);
    table.appendChild(tBody);

    for (var i = 0, len = this.vars.length; i < len; i++) {
      var varName = this.vars[i],
        value = this.guess[i],
        id = tools.randId(varName),
        row = cE('tr'),
        tdVarName = cE('td'),
        labelGuess = cE('label'),
        tdFittedValue = cE('td');

      tdVarName.textContent = varName;
      tdFittedValue.textContent = '?';

      tdVarName.appendChild(labelGuess);

      row.appendChild(tdVarName);

      var tdGuess = cE('td'),
        inputGuess = cE('input');

      labelGuess.htmlFor = id;

      inputGuess.type = 'number';
      inputGuess.step = 'any';
      inputGuess.name = varName;
      inputGuess.id = id;
      inputGuess.value = value;

      tdGuess.appendChild(inputGuess);

      row.appendChild(tdGuess);

      guessInputs.push(inputGuess);

      row.appendChild(tdFittedValue);

      fitResultSpans.push(tdFittedValue);

      tBody.appendChild(row);
    }

    fitForm.appendChild(table);
    box.appendChild(fitForm);

    var fit = this;
    function boundUpdateSettings() {
      fit.updateSettings();
    }

    for (var name in generalInputs) {
      if (generalInputs.hasOwnProperty(name)) {
        var input = generalInputs[name];
        input.addEventListener('change', boundUpdateSettings);
      }
    }

    for (var i = 0, len = guessInputs.length; i < len; i++) {
      var input = guessInputs[i];
      input.addEventListener('change', boundUpdateSettings);
    }

    this.updateSettings();
  }

  Fit.prototype.updateSettings = function () {
    var vars = this.vars,
      guessInputs = this.domCache.guessInputs,
      guess = [];

    if (this.domCache.generalInputs.useXMin &&
        this.domCache.generalInputs.useXMin.checked) {
      this.xMin = this.domCache.generalInputs.xMin.getValue();
    } else {
      this.xMin = undefined;
    }

    if (this.domCache.generalInputs.useXMax &&
        this.domCache.generalInputs.useXMax.checked) {
      this.xMax = this.domCache.generalInputs.xMax.getValue();
    } else {
      this.xMax = undefined;
    }

    for (var i = 0, len = this.domCache.guessInputs.length; i < len; i++) {
      guess.push(parseFloat(this.domCache.guessInputs[i].value, 10));
    }
    this.guess = guess;

    var inputFnString = this.domCache.generalInputs.fnString,
      fnString = inputFnString.value;

    try {
      this.fn = spimosimCore.HeadlessFit.toFunction(fnString, vars, guess);
      this.fnString = fnString;

      inputFnString.setValid();
      inputFnString.setTitle();
    } catch (e) {
      inputFnString.setInvalid();
      inputFnString.setTitle(e);
    }

    if (this.fitter.isPdf && !this.fitter.isDiscrete) {
      var inputCdfString = this.domCache.generalInputs.cdfString,
        cdfString = inputCdfString.value;

      try {
        this.cdf = spimosimCore.HeadlessFit.toFunction(cdfString, vars, guess);
        this.cdfString = cdfString;

        inputCdfString.classList.remove('invalid');
        inputCdfString.removeAttribute('title');
      } catch (e) {
        inputCdfString.classList.add('invalid');
        inputCdfString.title = e;
      }
    }

    this.fitter.triggerSettingsChanged();
  };


  function listFeatures(objectName) {
    var O = spimosimUi[objectName];
    if (O === undefined) {
      throw 'Cannot list features of Unknown object ' + objectName
    }
    if (O.prototype.availableFeatures === undefined) {
      throw objectName + ' has no activatable features'
    }

    var list = [];
    for (var layerName in O.prototype.availableFeatures) {
      if (O.prototype.availableFeatures.hasOwnProperty(layerName)) {
        var layer = O.prototype.availableFeatures[layerName];
        for (var i = 0, len = layer.length; i < len; i++) {
          list.push(layer[i].name);
        }
      }
    }

    return list;
  }

  return {
    EventAttacher: EventAttacher,
    
    Initializer: Initializer,
    Simulation: Simulation,
    Clock: Clock,
    
    Controls: Controls,
    VarInitializer: VarInitializer,
    ControlsAddOn: ControlsAddOn,
    
    Video: Video,
    DynamicVideo: DynamicVideo,
    
    BasicPlotter: BasicPlotter,
    Plotter: Plotter,
    PlotDisplay: PlotDisplay,
    TimePlotDisplay: TimePlotDisplay,
    MultiSeriesTimePlotDisplay: MultiSeriesTimePlotDisplay,
    
    listFeatures: listFeatures,
    
    Fitter: Fitter,
    Fit: Fit,
    
    IntColorSet: IntColorSet,
    
    ModelInfo: ModelInfo,
    Help: Help,
    Downloader: Downloader,
    
    imageSaver: imageSaver,
    colorSet: colorSet,
  };
}());
