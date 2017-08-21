'use strict';

/* Copyright 2017 Pascal Grafe - MIT License
 *
 * GUI elements for the spimosimCore.js library
 *
 * depends on:
 *   spimosimCore.js ( + tools.js)
 *   graphicTools.js
 *   network-config.js (or your user defined file to define network inputs)
 *   video.js (or your user defined file to define video players)
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
 *       An IntColorSet with predefined colors for spin models
 *
 * - Init GUI
 *    * Initializer
 *       Manages the simulation, controls, videos, plotters and downloader
 *
 * - Controls
 *    * Controls
 *       A GUI element with the model settings and simulation controls.
 *       It is highly configurable, so it should not be nessecary to extend
 *       the code as long as you only use spin models.
 *
 * - Display of current state / Video
 *    * Video
 *       A GUI element, containing an canvas, drawing and download options.
 *       This is an abstract Object that needs to be extended.
 *    * DynamicVideo
 *       Extends Video to an actual video player with a time bar, a play button
 *       and more. This is an abstract object that needs to be extended.
 *    These two Objects can be used to implement different ways to represent
 *    the simulated data. The following objects are predefined:
 *    * Video1d (external file 'video.js')
 *       Extends Video to displays multiple time steps of an simulation on an
 *       1d-lattice.
 *    * Video2d (external file 'video.js')
 *       Extends DynamicVideo to displays time steps of an simulation on an
 *       2d-lattice.
 *    * VideoNd (external file 'video.js')
 *       Extends Video2d to displays to work with lattices of more dimensions.
 *       The visual representation stays the same, but you can select which
 *       layer to display
 *    * VideoNetwork
 *       Extends DynamicVideo to display other networks using the library
 *       vis.js.
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
 *   The following plots can be deduced from existing plots:
 *    * MeanValuePlotDisplay
 *       Calculates mean values and standard deviations. Uses
 *       spimosimCore.MeanValueDataAggregator.
 *    * DistributionPlotDisplay
 *       Calculates the distribution of y values. Uses
 *       spimosimCore.DistributionDataAggregator.
 *    * CumulatedDistributionPlotDisplay
 *       Calculates the distribution of y values and cumulates them. Uses
 *       spimosimCore.CumulatedDistributionDataAggregator.
 *    * AutoCorrelationPlotDisplay
 *       Calculated auto correlations of time plots. Uses
 *       spimosimCore.AutoCorrelationDataAggregator.
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
 *       A simple GUI element that displays information about the current model.
 *  spimosimCore.modules gets expanded by:
 *   * PlotDisplay
 *      You must register your plots to this object.
 *   * Video
 *      Video1d, Video2d, VideoNd and VideoLattice are registered here.
 *      You must register your custom video player to this object.
 *   * NetworkUi
 *      You must register the configuration of GUI elements for your
 *      custom networks to this object. The general network config must
 *      be registered to spimosimCore.networkRegister.
 */

self.spimosimUi = (function () {
  var modules = spimosimCore.modules,
    EventDispatcher = tools.EventDispatcher,
    EventAttacher = tools.EventAttacher,
    FeatureActivatable = tools.FeatureActivatable,
    ENDIAN;

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

    /*this.addEventListener('backend settings changed', function (e) {
      //Start the simulation when the backend received new settings since
      //tMax might have changed.
      if (!simulation.isRunning()) {
        simulation.resume();
      }
    });*/

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
    return Math.max(this.controls.getTMax(), this.tMaxCalculated);
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

  function Clock(initializer, config, smallDefaultBuffer) {
    EventDispatcher.call(this, [ 'fps change', 'endless mode change', 'retard', 'slow down', 'ignore', 'stop', 'start', 'end' ]);
    var defaultBuffer;
    if (smallDefaultBuffer) {
      defaultBuffer = 1.5;//1.5 seconds
    } else {
      defaultBuffer = 20;//20 seconds
    }
    
    this.config = tools.copyInto(config, {
      endlessMode: true,
      fps: {
        min: 1,
        max: 4000,
        step: 1,
        value: 30,
        disabled: false,
        shown: false,
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
          steps: smallDefaultBuffer ? 1 : undefined
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

  Clock.prototype.getTMin = function () {
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
      this.initializer.controls.setTMax(t + bufferSteps);
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


  function cE(type) {
    return document.createElement(type);
  }


  var IntColorSet = (function () {
    function str2IntLittleEndian(str) {
      var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str),
        red = parseInt(components[1], 16),
        green = parseInt(components[2], 16),
        blue = parseInt(components[3], 16),
        alpha = 255;

      return (alpha << 24) + (blue << 16) + (green << 8) + red;
    };

    function str2IntBigEndian(str) {
      var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str),
        red = parseInt(components[1], 16),
        green = parseInt(components[2], 16),
        blue = parseInt(components[3], 16),
        alpha = 255;

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

    var uint32Array = new Uint32Array(1),
      uint8Array = new Uint8Array(uint32Array.buffer);

    uint8Array[0] = 1;
    uint8Array[1] = 2;
    uint8Array[2] = 3;
    uint8Array[3] = 4;

    var str2Int, int2Str;

    if (uint32Array[0] === 0x01020304) {
      ENDIAN = 'big';
      str2Int = str2IntBigEndian;
      int2Str = int2StrBigEndian;
    } else if (uint32Array[0] === 0x04030201) {
      ENDIAN = 'little';
      str2Int = str2IntLittleEndian;
      int2Str = int2StrLittleEndian;
    } else {
      throw 'Unknown endianess.';
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


  function Initializer(sections) {
    this.sections = sections;
    this.videos = [];
    this.plotters = [];
    this.createInfo();

    if (sections.controlsSection === undefined) {
      sections.controlsSection = cE('div');//dummy element
    }

    if (sections.plotterSections && sections.plotterSections.length > 0) {
      BasicPlotter.generateFallbackColors(sections.plotterSections[0]);
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
    this.modelConfig = modelConfig;
    if (modelConfig.video && modelConfig.video.colorSet) {
      throw 'Defining color sets in the video section is no longer supported. Use top level configuration instead.';
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
        modules.add('PlotDisplay',
          name,
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
            getPlotOptions: function () {
              return {
                title: name,
                xlabel: 't',
                labels: this.getSeriesLabels(true)
              };
            },
          },
          {
            optionText: varsConfig[name].plot.optionText || name,
          }
        );
        this.stateVariablePlotTypes.push(name);
      }
    }
  };

  Initializer.prototype.createClock = function () {
    this.clock = new Clock(this, this.modelConfig.clock, this.modelConfig.simulation.continuableWithNewSettings);
  };

  Initializer.prototype.createControls = function () {
    var controlsSection = this.sections.controlsSection;
    this.controls = new Controls(this, this.modelConfig, controlsSection);
  };

  Initializer.prototype.destroyPlotters = function () {
    this.plotters.forEach(function (plotter) {
      plotter.destroy();
    });
    this.plotters = [];
  };

  Initializer.prototype.createPlotters = function () {
    var plotterSections = this.sections.plotterSections;

    if (plotterSections) {
      var config = this.modelConfig.plotter;

      var fitBackendConfig = this.modelConfig.fitter !== undefined ?
        this.modelConfig.fitter.backend : undefined;

      if (config.backend === undefined) {
        throw 'Error in config: plotter.backend is undefined';
      }

      for (var i = 0, len = plotterSections.length; i < len; i++) {
        var thisConfig = config;
        if (Array.isArray(config)) {
          thisConfig = config[i % config.length];
        }
        thisConfig = tools.copyInto(thisConfig, {});
        thisConfig.plotTypes = thisConfig.plotTypes.concat(this.stateVariablePlotTypes);
        var plotter = new Plotter(this, thisConfig, plotterSections[i], this.colorSet, fitBackendConfig, this.simulation);
        this.plotters.push(plotter);
      }
    }
  };

  Initializer.prototype.createDownloader = function () {
    var downloadsSection = this.sections.downloadsSection;

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
    var videoSections = this.sections.videoSections;

    if (videoSections) {
      this.currentVideoType = this.controls.getVideoType();
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
    var helpSection = this.sections.helpSection;

    if (helpSection && !this.help) {
      this.help = new Help(helpSection, this.modelConfig.info.helpTextId, this.modelConfig.info.iconPath);
    }
  };

  Initializer.prototype.createInfo = function () {
    var infoSection = this.sections.infoSection;

    if (infoSection) {
      this.modelInfo = new ModelInfo(infoSection);
    }
  };

  Initializer.prototype.setInfo = function () {
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


    if (this.currentVideoType !== this.controls.getVideoType()) {
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

    this.destroyVideos();
    this.destroyPlotters();
  };

  Initializer.prototype.changeModel = function (modelConfig) {
    this.destroyModel();

    this.initModel(modelConfig);
  }


  function Controls(initializer, modelConfig, controlsSection) {
    EventAttacher.call(this);
    FeatureActivatable.call(this, modelConfig.controls.features, 'Controls');

    this.modelConfig = modelConfig;
    this.initializer = initializer;
    this.lastValidTMax = Controls.DEFAULT_T_MAX;
    this.isApplyCountdownShown = false;
    this.nextApplyT = -1;

    if (!modelConfig.controls.preprocess) {
      modelConfig.controls.preprocess = {
        'Network': {},
        'NetworkUi': {}
      };
    }
    
    this.settingsPreprocessors = [];
    for (var name in modelConfig.controls.preprocess) {
      if (modelConfig.controls.preprocess.hasOwnProperty(name)) {
        this.settingsPreprocessors.push(spimosimCore.modules.get('SettingsPreprocessor', name));
      }
    }

    this.keyMap = {};
    this.varInitializers = {};

    var div = this.initGui();
    div.classList.add('controls-container');
    controlsSection.appendChild(div);

    this.invalidParameters = [];

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

  Controls.prototype.getVideoType = function () {
    return this.initializer.simulation.modelSettings.video.type;
  }

  Controls.prototype.initGui = function () {
    var modelConfig = this.modelConfig;

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
            controls.updateEndlessModeButton(clock);
          }
        },
      ]);
    }

    var buttonTimePlus = cE('button');
    buttonTimePlus.className = 'time-plus';
    buttonTimePlus.title = '+' + Controls.DEFAULT_T_PLUS + ' steps';
    if (this.initializer.clock.endlessMode) {
      buttonTimePlus.style.display = 'none';
    }
    cornerMenuSimulation.appendChild(buttonTimePlus);
    this.keyMap['+'] = buttonTimePlus;
    this.attachEventListener({
      dispatcher: buttonTimePlus,
      type: 'click',
      callback: function () {
        var input = controls.domCache.inputTMax;
        controls.setTMax(parseInt(input.value, 10) + Controls.DEFAULT_T_PLUS);
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

      var varsConfig = modelConfig.controls.stateVariables;
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

    var divSpinMemory = cE('div');
    var inputSpinMemory = graphicTools.createSetting({
      type: 'select',
      labelText: 'Memory to save time steps: ',
      name: 'spin-memory',
      value: localStorage.getItem('spin-memory') || (50 << 20).toString(),
      texts: [
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
        'unlimited'
        ],
      values: [
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
        'Infinity'
      ]
    });

    divSpinMemory.appendChild(inputSpinMemory.domElement);
    divPerformanceOptimizations.appendChild(divSpinMemory);

    formSimulation.appendChild(divPerformanceOptimizations);

    divSimulation.appendChild(formSimulation);

    cornerMenuSimulation.appendChild(divSimulation);

    var controls = this;
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
        dispatcher: inputSpinMemory,
        type: 'change',
        callback: function (){
          controls.setSpinMemorySize();
        }
      }
    ]);

    /* Settings for the network and the model */

    var modelSettings = cE('form');
    modelSettings.action = 'javascript:void(0)';
    modelSettings.className = 'model-settings settings';
 
    var submitButton = cE('button');
    submitButton.type = 'submit';
    submitButton.style.display = 'none';
    modelSettings.appendChild(submitButton);
    
    this.attachEventListener({
      dispatcher: modelSettings,
      type: 'submit',
      callback: function (){
        controls.restartOrUpdateSettings('submit')
      }
    });

    /* Settings for the network */

    var networkDiv = cE('div');
    networkDiv.className = 'network-settings';

    var networkHeading = cE('h3');
    networkHeading.textContent = 'Network';
    networkDiv.appendChild(networkHeading);


    var networkSettings = cE('div');

    var networkTypeSetting;
    var networkTypes = this.modelConfig.controls.networkTypes;
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

      config = modules.get('NetworkUi', name);

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
        
      this.attachEventListener({
        dispatcher: networkTypeSetting,
        type: 'change',
        callback: function (e) {
          controls.networkType = networkTypeSetting.getValue();
          graphicTools.removeAllChildNodes(divNetworkParameters);
          controls.updateNetworkType();
          controls.restartOrUpdateSettings('settings');
        }
      });
    }

    var divNetworkParameters = cE('div');
    networkSettings.appendChild(divNetworkParameters);
    networkDiv.appendChild(networkSettings);
    modelSettings.appendChild(networkDiv);

    /* Settings for the model */

    var initialValuesDiv = cE('div');
    initialValuesDiv.className = 'initial-values-settings';

    var initialValuesHeading = cE('h3');
    initialValuesHeading.textContent = 'Initial state';
    initialValuesDiv.appendChild(initialValuesHeading);

    if (this.features.uploadInitialState) {
      var inputInitialState = graphicTools.createSetting({
        type: 'file',
        labelText: 'Upload initial state',
        name: 'upload-init-state',
      });

      var container = cE('div');
      container.appendChild(inputInitialState.domElement);

      initialValuesDiv.appendChild(container);
      modelSettings.appendChild(initialValuesDiv);

      this.attachEventListener({
        dispatcher: inputInitialState,
        type: 'change',
        callback: function (e) {
          var input = this;
          if (this.files.length === 0) {
            controls.invalidFile(false);
            return;
          }

          var file = this.files[0],
            reader = new FileReader();

          reader.onload = function (e) {
            var str = e.target.result;

            if (!str.startsWith(MAGIC_STR)) {
              controls.setFileMsg('Invalid file!');
              controls.invalidFile(true);
              return;
            }

            var obj = JSON.parse(str.slice(MAGIC_STR.length));

            controls.initialState = {
              settings: obj[0],
              values: spimosimCore.Protocol.parsedJson2Values(obj[1], controls.modelConfig.controls.stateVariabels)
            };

            controls.validFile();
            controls.restartOrUpdateSettings('settings')
          };

          reader.readAsText(file);
        }
      });
    }

    var varsConfig = modelConfig.controls.stateVariables;
    for (var varName in varsConfig) {
      if (varsConfig.hasOwnProperty(varName)) {
        this.varInitializers[varName] = [];

        var varConfig = varsConfig[varName],
          initialValueConfigs = varConfig.initialValue;

        if (initialValueConfigs !== undefined)  {
          var heading = cE('h4'),
            headingBar = cE('span'),
            spanVarName = cE('span'),
            settingsDiv = cE('div'),
            container = cE('div');

          settingsDiv.className = 'initial-values-settings';
          container.className = 'initializer';

          headingBar.className = 'bar';
          spanVarName.textContent = varName; 

          heading.appendChild(headingBar);
          heading.appendChild(spanVarName);

          settingsDiv.appendChild(heading);
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
              
              var keyMap = varInitializer.getKeyMap()
              for (var name in keyMap) {
                if (keyMap.hasOwnProperty(name)) {
                  this.keyMap[name] = keyMap[name];
                }
              }
            }
          }

          if (container.childElementCount > 0) {
            modelSettings.appendChild(initialValuesDiv);
            modelSettings.appendChild(settingsDiv);
          }
        }
      }
    }


    /* Update algorithm settings */
    var updateAlgorithms = this.modelConfig.controls.updateAlgorithms;

    if (updateAlgorithms !== undefined) {
      var texts = [];
      var values = [];
      for (var name in updateAlgorithms) {
        if (updateAlgorithms.hasOwnProperty(name)) {
          texts.push(updateAlgorithms[name]);
          values.push(name);
        }
      }

      if (values.length > 1) {
        var updateAlgorithmDiv = cE('div');

        var updateAlgorithmHeading = cE('h3');
        updateAlgorithmHeading.textContent = 'Update algorithm';
        updateAlgorithmDiv.appendChild(updateAlgorithmHeading);
        
        var updateAlgorithmSetting = graphicTools.createSetting({
          type: 'radio',
          texts: texts,
          values: values,
          syncURI: true,

        });
        
        this.keyMap['*'] = updateAlgorithmSetting;

        var controls = this;
        this.attachEventListener({
          dispatcher: updateAlgorithmSetting,
          type: 'change',
          callback: function () {
            controls.updateAlgorithm = updateAlgorithmSetting.getValue();
            controls.restartOrUpdateSettings('settings')
          }
        });

        updateAlgorithmDiv.appendChild(updateAlgorithmSetting.domElement);

        modelSettings.appendChild(updateAlgorithmDiv);

        this.updateAlgorithm = updateAlgorithmSetting.getValue();
      } else {
        this.updateAlgorithm = values[0];
      }
    }
    
    /* Model parameter settings */

    var parameterDiv = cE('div');
    parameterDiv.className = 'parameters';

    var parameterHeading = cE('h3');
    parameterHeading.textContent = 'Parameters';
    parameterDiv.appendChild(parameterHeading);


    var parameterSettings = cE('div');
    parameterSettings.className = 'parameter-inputs';
    parameterDiv.appendChild(parameterSettings);

    modelSettings.appendChild(parameterDiv);

    var inputsModelParameters =
      this.createSettings(modelConfig.controls.parameters, parameterSettings);

    if (Object.keys(inputsModelParameters).length === 0) {
      parameterDiv.style.display= 'none';
    }

    for (var name in inputsModelParameters) {
      if (inputsModelParameters.hasOwnProperty(name)) {
        var input = inputsModelParameters[name];
        this.attachEventListener({
          dispatcher: input,
          type: 'change',
          callback: function (e) {
            controls.restartOrUpdateSettings('settings');
          }
        });
      }
    }

    /* Putting all together */

    var box = cE('div');

    box.appendChild(cornerMenuSimulation);
    box.appendChild(modelSettings);

    this.domCache = {
      selectActionOnChangingSettings: selectActionOnChangingSettings,
      divSaveVarCheckboxes: divSaveVarCheckboxes,
      progressBarSimulation: progressBarSimulation,
      inputTMax: inputTMax,
      inputSpinMemory: inputSpinMemory,
      buttonRestart: buttonRestart,
      buttonTimePlus: buttonTimePlus,
      buttonSimulationMenu: buttonSimulationMenu,
      buttonEndlessMode: buttonEndlessMode,
      buttonDeleteOldData: buttonDeleteOldData,
      cornerMenuSimulation: cornerMenuSimulation,
      spanApplyCountdown: spanApplyCountdown,
      spanApplyCountdownSteps: spanApplyCountdownSteps,
      simulatedSteps: simulatedSteps,
      parameterSettings: parameterSettings,
      checkboxesSaveVar: checkboxesSaveVar,
      inputInitialState: inputInitialState,
      updateAlgorithmSetting: updateAlgorithmSetting,
      divNetworkParameters: divNetworkParameters,
      networkTypeSetting: networkTypeSetting,
      inputsModelParameters: inputsModelParameters,
      modelSettings: modelSettings,
      box: box
    };
    
    if (this.features.changeEndlessMode) {
      this.updateEndlessModeButton(this.initializer.clock);
    }
    
    this.updateNetworkType();
    
    return box;
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

  Controls.prototype.updateEndlessModeButton = function (clock) {
    var buttonEndlessMode = this.domCache.buttonEndlessMode;
    if (clock.endlessMode) {
      buttonEndlessMode.className = 'endless-mode';
      buttonEndlessMode.title = 'Simulate fixed interval';
      $(this.domCache.buttonTimePlus).fadeOut(300);
    } else {
      buttonEndlessMode.className = 'ending-mode';
      buttonEndlessMode.title = 'Simulate more steps automatically';
      $(this.domCache.buttonTimePlus).fadeIn(300);
    }
  };

  Controls.prototype.setTMax = function (tMax) {
    if (tMax > this.lastValidTMax) {
      this.lastValidTMax = tMax;
      this.domCache.inputTMax.value = tMax;
      this.initializer.simulation.changeBackendSettings(undefined, true);
    }
  };

  Controls.prototype.createSettings = function (parameters, container) {
    var inputElements = {};
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name)) {
        var parameterConfig = tools.copyInto(parameters[name], {});
        parameterConfig.name = name;
        parameterConfig.syncURI = true;

        var setting = graphicTools.createSetting(parameterConfig);
        inputElements[name] = setting;
        container.appendChild(setting.domElement);

        if (parameterConfig.key) {
          this.keyMap[parameterConfig.key] = setting;
        }
      }
    }

    return inputElements;
  };

  Controls.prototype.markAllParametersAsValid = function () {
    for (var i = 0, len = this.invalidParameters.length; i < len; i++) {
      var name = this.invalidParameters[i],
        input = this.domCache.inputsModelParameters[name];
      input.classList.remove('invalid');
      input.removeAttribute('title');
    }

    this.invalidParameters = [];
  };

  Controls.prototype.markParameterAsInvalid = function (invalidParameter, invalidParameterMsg) {
    var input = this.domCache.inputsModelParameters[invalidParameter];
    input.classList.add('invalid');
    input.title = invalidParameterMsg;

    this.invalidParameters.push(invalidParameter);
  };

  Controls.prototype.setFileMsg = function (msg) {
    this.domCache.inputInitialState.setMsg(msg);
  };

  Controls.prototype.validFile = function () {
    this.domCache.inputInitialState.setValid();
    this.setFileMsg('');
  };

  Controls.prototype.invalidFile = function (deleteFile) {
    this.domCache.inputInitialState.setInvalid();
    this.initialState = undefined;
    if (deleteFile) {
      this.domCache.inputInitialState.value = '';
      this.domCache.inputInitialState.dispatchEvent('change');
    }
  };

  Controls.prototype.setSpinMemorySize = function () {
    var spinMemory = this.domCache.inputSpinMemory.getValue();
    var protocol = this.initializer.simulation.protocol;

    localStorage.setItem('spin-memory', spinMemory);
    protocol.maxBytes = spinMemory;
    protocol.deleteOldData();
  };

  Controls.prototype.updateNetworkType = function () {
    var parameters = this.networkParameterConfig[this.networkType].parameters;
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name)) {
        graphicTools.removeUriQuery(name);
      }
    }

    var inputsNetworkParameters = this.createSettings(
          this.networkParameterConfig[this.networkType].parameters,
          this.domCache.divNetworkParameters);

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

    var controls = this;
    for (var name in inputsNetworkParameters) {
      if (inputsNetworkParameters.hasOwnProperty(name)) {
        inputsNetworkParameters[name].addEventListener('change', function (e) {
          controls.restartOrUpdateSettings('settings');
        });
      }
    }
  }

  Controls.prototype.attachSimulationListeners = function (simulation) {
    var controls = this;
    this.invalidParameterListener = {
      dispatcher: simulation,
      type: 'invalid parameter',
      callback: function (e) {
        controls.markParameterAsInvalid(e.parameter, e.msg);
      }
    };

    this.attachEventListener(this.invalidParameterListener);

    this.setSpinMemorySize();
  };

  /*
   * Starts the simulation when changing settings
   */
  Controls.prototype.restartOrUpdateSettings = function (action) {
    this.markAllParametersAsValid();
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
      updateAlgorithm: this.updateAlgorithm,
      parameters: {},
      initialState: {},
      continuable: true
    };
    
    for (var name in this.domCache.inputsModelParameters) {
      if (this.domCache.inputsModelParameters.hasOwnProperty(name)) {
        var value = this.domCache.inputsModelParameters[name].getValue();
        settings[name] = value;
        settings.parameters[name] = value;
      }
    }

    settings.networkType = this.networkType;
    settings.network = {
      type: this.networkType
    };

    for (var name in this.domCache.inputsNetworkParameters) {
      if (this.domCache.inputsNetworkParameters.hasOwnProperty(name)) {
        var value = this.domCache.inputsNetworkParameters[name].getValue();
        settings[name] = value;
        settings.network[name] = value;
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
        this.setFileMsg('');
        tools.copyInto(values, settings);
        tools.copyInto(values, settings.initialState);
      } else {
        this.setFileMsg('Error: ' + mismatch + '≠' + usedSettings[mismatch]);
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

    var tMax = this.getTMax();
    if (this.simulation) {
      tMax = Math.max(this.simulation.tMaxCalculated, this.getTMax());
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

  Controls.prototype.getTMax = function () {
    var val = parseInt(this.domCache.inputTMax.value);
    if (isFinite(val)) {
      this.lastValidTMax = val;
    } else {
      val = this.lastValidTMax;
    }

    return val;
  };

  Controls.prototype.destroy = function () {
    EventAttacher.prototype.destroy.call(this);
    
    var names = [ 'update-algorithm' ];
    var parameters = this.modelConfig.parameters;
    for (var name in parameters) {
      if (parameters.hasOwnProperty(name)) {
        names.push(name);
      }
    }
    graphicTools.removeUriQueries(names);

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

  SettingsSection.prototype.getKeyMap = function () {
    return this.keyMap;
  };


  function VarInitializer(config, controls, varName) {
    this.varName = varName;
    SettingsSection.call(this, config, controls);
  }
  VarInitializer.prototype = Object.create(SettingsSection.prototype);


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

    this.ctx = this.domCache.videoCanvas.getContext('2d');
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

  Video.prototype.getSpimosimSpinsFrameFileName = function (t) {
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
          var buttonSaveFrameAsSpimosimSpins= cE('button');
          buttonSaveFrameAsSpimosimSpins.className = 'save-frame-as-json';
          buttonSaveFrameAsSpimosimSpins.textContent = 'Frame as JSON';
          downloadMenu.appendChild(buttonSaveFrameAsSpimosimSpins);

          divMenuContent.appendChild(downloadMenu);
          this.attachEventListener({
            dispatcher: buttonSaveFrameAsSpimosimSpins,
            type: 'click',
            callback: function () {
              var t = video.initializer.clock.getT(),
                fileName = video.getSpimosimSpinsFrameFileName(t);
              if (t) {
                imageSaver.saveFrameAsSpimosimSpins(video.simulation, t, fileName);
              }
            }
          });
          domCache.buttonSaveFrameAsSpimosimSpins = buttonSaveFrameAsSpimosimSpins;
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
    this.domCache.box.remove();
    EventAttacher.prototype.destroy.call(this);
  };

  Video.prototype.drawFrameInImageData = function (pixels, protocol, t,
      drawMode) {
    this.drawModes[drawMode].draw.call(this, pixels, protocol, t, 0);
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
    videoTextNotSaved.textContent = 'The spins of this time step are not saved.';
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
            var value = graphicTools.promtRangeValue(inputT, 'Set time');
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
        this.keyMap['t'] = inputT;

        playbackControl.appendChild(divTimeProgress);
        
        this.domCache.inputT = inputT;
        
        this.attachEventListeners([
          {
            dispatcher: inputT,
            type: 'input',
            callback: function () {
              video.pause();
              video.updateT();
            }
          },
          {
            dispatcher: $(inputT),
            type: 'mousewheel',
            callback: function (e) {
              video.domCache.inputT.value = graphicTools.getValueAfterScroll(video.domCache.inputT, e);
              video.pause();
              video.updateT();
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
        type: 'keypress',
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
              case 'k':
              case ' ':
                if (video.features['playPauseButton']) {
                  video.playPause();
                }
                break;
              case 'ArrowLeft':
                if (video.features['timeProgressBar'] && e.target.nodeName !== 'input' && e.target.type !== 'range') {
                  var steps = -(e.shiftKey ? 10 : 1) * (e.altKey || e.ctrlKey ? 10 : 1);
                  video.initializer.clock.setT(graphicTools.getValueAfterSteps(video.domCache.inputT, steps));
                }
                break;
              case 'ArrowRight':
                if (video.features['timeProgressBar'] && e.target.nodeName !== 'input' && e.target.type !== 'range') {
                  var steps = (e.shiftKey ? 10 : 1) * (e.altKey || e.ctrlKey ? 10 : 1);
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

  DynamicVideo.prototype.updateT = function () {
    this.initializer.clock.setT(parseInt(this.domCache.inputT.value, 10));
  };




  var MAGIC_STR = 'spimosimSpins:';//Start sequence for files storing spin state

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
        drawMode = video.drawMode,//which spins should be drawn
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
          try {
            video.drawFrameInImageData(pixels, protocol, t, drawMode);//Fill the pixels with colored spins
          } catch (e) {
            showErrorAndRemove(e);
          }
          ctx.putImageData(imageData, 0, 0);//Draw the imageData

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
      var width = video.getFrameWidth(),//width for 2d, n for 1d
        height = video.getFrameHeight(),//height for 2d, 1 for 1d
        drawMode = video.drawMode,//which spins should be drawn
        ctx = imageSaver.createContext(width, height),//insible context
        imageData = video.createImageData(ctx),//for caching purposes
        pixels = new Int32Array(imageData.data.buffer),//for caching purposes
        protocol = simulation.protocol;

      video.drawFrameInImageData(pixels, protocol, t, drawMode);//Fill the pixels of data with colored spins
      ctx.putImageData(imageData, 0, 0);//draw the imageData

      ctx.canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);//Convert blob to URL
        graphicTools.startDownload(url, fileName);//Download from the url
      }, 'image/png', 1);
    },

    /*
     * Saves the frame t as a json file
     */
    saveFrameAsSpimosimSpins: function (simulation, t, fileName) {
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
    this.domCache.infoContent.textContent = 'No additionally information available';
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
    var buttonHideInfo = cE('button');
    buttonHideInfo.className = 'ok';
    buttonHideInfo.textContent = 'OK';
    infoSection.appendChild(buttonHideInfo);

    var infoContent = cE('div');
    infoContent.className = 'info-content';
    infoSection.appendChild(infoContent);

    infoSection.classList.add('info');

    this.domCache = {
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

  ModelInfo.prototype.isShown = function () {
    return !this.domCache.infoSection.classList.contains('hidden-main-info');
  };


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
    var buttonHideHelp = cE('button');
    buttonHideHelp.className = 'ok';
    buttonHideHelp.textContent = 'OK';
    helpSection.appendChild(buttonHideHelp);

    var help = this;
    buttonHideHelp.addEventListener('click', function () {
      help.hide();
    });

    var container = cE('div');
    container.innerHTML = this.generateHelpText();

    this.domCache = {
      helpSection: helpSection
    };

    helpSection.classList.add('help');
    helpSection.classList.add('info');
    helpSection.classList.add('main-info');
    if (this.isShown()) {
      helpSection.classList.add('shown-main-info');
    } else {
      helpSection.classList.add('hidden-main-info');
    }

    helpSection.appendChild(container);
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
      '  In the "controls" section you can change parameters of the model and' +
      '  the network and more. Click' +
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


  var startDownload = graphicTools.startDownload;

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

  /*
  * Sets the progress of task id to value
  */
  Downloader.prototype.setProgress = function(id, value) {
    this.downloads[id].progress.value = value;
  };

  /*
  * Sets the maximum progress of task id to maxValue
  */
  Downloader.prototype.setProgressMax = function(id, maxValue) {
    this.downloads[id].progress.max = maxValue;
  };

  /*
  * Show the progress bar of task id
  */
  Downloader.prototype.showProgress = function(id) {
    $(this.downloads[id].progress).show();
  };

  /*
  * Show the progress bar of task id
  */
  Downloader.prototype.hideProgress = function(id) {
    $(this.downloads[id].progress).hide();
  };


  function BasicPlotter(initializer, config, plotSection, colorSet, fitBackendConfig, dataSource) {
    EventAttacher.call(this);
    FeatureActivatable.call(this, config.features, 'BasicPlotter');
    spimosimCore.PlotterFrontend.call(this, BasicPlotter.createPlotTypes(config.plotTypes), config.backend);
    this.initializer = initializer;
    this.config = config;
    this.fitBackendConfig = fitBackendConfig;
    this.colorSet = colorSet;

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
      this.domCache.inputsNewPlotSettings = {};
      this.domCache.pDescription.innerHTML = this.plotTypes[type].prototype.description;

      var getSettingsConfig = this.plotTypes[type].getSettingsConfig;
      if (getSettingsConfig !== undefined) {
        var config = getSettingsConfig(this);

        for (var name in config) {
          if (config.hasOwnProperty(name)) {
            var setting = graphicTools.createSetting(config[name]);
            this.domCache.divNewPlotSettings.appendChild(setting.domElement);
            this.domCache.inputsNewPlotSettings[name] = setting;
          }
        }
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

    graphicTools.enableDragAndDropMove('#' + this.domCache.divCurrentPlots.id,
      '#' + plot.domCache.box.id, '.dygraph-title');

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
    
    if (this.features['deletable plots']) {
      this.attachEventListeners([
        {
          dispatcher: $(document),
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

    graphicTools.enableDragAndDropMove('#' + this.domCache.divOldPlots.id, '#' + plot.domCache.box.id, '.dygraph-title');
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
    startDownload(url, this.getCsvFileName());
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
          $(divFitMenu).slideToggle(300);
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
            $(menu).slideUp(300);
          }
        },
        dispatcher: document
      },
      {
        type: 'click',
        callback: function () {
          $(menu).slideToggle(300);
        },
        dispatcher: buttonTools
      },
      {
        type: 'change',
        callback: function () {
          plot.dataAggregator.settings.logScaleMode = this.value;
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

  PlotDisplay.prototype.getDeducedPlotTypes = function () {
    return [ 'distribution', 'cumulated' ];
  };

  PlotDisplay.prototype.closeMenu = function () {
    if ($(this.domCache.menu).stop(true, true).is(':visible')) {
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

  TimePlotDisplay.prototype.getDeducedPlotTypes = function () {
    return [ 'mean value', 'distribution', 'cumulated', 'auto correlation' ];
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

  MultiSeriesTimePlotDisplay.prototype.getDeducedPlotTypes = function () {
    return {
      'multi series mean value': MultiSeriesMeanValuePlotDisplay,
      'multi series distribution': MultiSeriesDistributionPlotDisplay,
      'multi series cumulated': MultiSeriesCumulatedPlotDisplay,
      'multi series auto correlation': MultiSeriesAutoCorrelationPlotDisplay
    };
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

  function MeanValuePlotDisplay(plotter, settings) {
    MultiSeriesTimePlotDisplay.call(this, plotter, settings, 2);
  }
  MeanValuePlotDisplay.prototype =
    Object.create(MultiSeriesTimePlotDisplay.prototype);

  MeanValuePlotDisplay.prototype.description = 'The mean value over all or n previous values and the their standard deviation';
  MeanValuePlotDisplay.optionText = 'Mean value';

  MeanValuePlotDisplay.prototype.seriesLabels = [ 'Mean value', 'Standard deviation' ];

  MeanValuePlotDisplay.getSettingsConfig = function (plotter) {
    return {
      perStepMode : {
        labelText: 'Use only recent data for every step.',
        value: false,
        type: 'checkbox',
        name: 'perStepName',
        enables: [ 'intervalLength' ]
      },
      intervalLength: {
        min: 0,
        max: 1000,
        value: 50,
        step: 1,
        disabled: true,
        name: 'intervalLength',
        labelText: 'Interval length'
      }
    };
  };

  MeanValuePlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Mean value',
      xlabel: 't',
      labels: this.getSeriesLabels(true),
      errorBars: true
    };
  };

  function MultiSeriesMeanValuePlotDisplay(plotter, settings) {
    MultiSeriesTimePlotDisplay.call(this, plotter,
      settings, 2);
  }
  MultiSeriesMeanValuePlotDisplay.prototype =
    Object.create(MeanValuePlotDisplay.prototype);

  MultiSeriesMeanValuePlotDisplay.optionText = MeanValuePlotDisplay.optionText;
  MultiSeriesMeanValuePlotDisplay.prototype.description = MeanValuePlotDisplay.description;

  MultiSeriesMeanValuePlotDisplay.getSettingsConfig = function (plotter) {
    var config = MeanValuePlotDisplay.getSettingsConfig.call(plotter);

    var plot = plotter.dataSource.owner;

    var values = [];
    for (var i = 0, len = plot.n; i < len; i++) {
      values.push(i);
    }

    config.seriesNo = {
      name: 'seriesNo',
      labelText: 'Time series',
      values: values,
      texts: plot.getSeriesLabels(),
      type: 'select'
    };

    return config;
  };


  function DistributionPlotDisplay(plotter, settings) {
    PlotDisplay.call(this, plotter, settings);
  }
  DistributionPlotDisplay.prototype =
    Object.create(PlotDisplay.prototype);

  DistributionPlotDisplay.optionText = 'Distribution';
  DistributionPlotDisplay.prototype.description = 'Distribution of y-values';

  DistributionPlotDisplay.prototype.fittable = true;

  DistributionPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      absValues : {
        labelText: 'Use absolute values',
        value: false,
        type: 'checkbox'
      }
    };
  };

  DistributionPlotDisplay.prototype.seriesLabels = [ 'value', 'count' ];

  DistributionPlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Distribution',
      labels: this.getSeriesLabels(true)
    };
  };

  function MultiSeriesDistributionPlotDisplay(plotter, settings) {
    PlotDisplay.call(this, plotter, settings);
  }
  MultiSeriesDistributionPlotDisplay.prototype =
    Object.create(DistributionPlotDisplay.prototype);

  MultiSeriesDistributionPlotDisplay.optionText = DistributionPlotDisplay.optionText;
  MultiSeriesDistributionPlotDisplay.prototype.description = DistributionPlotDisplay.description;

  MultiSeriesDistributionPlotDisplay.getSettingsConfig = function (plotter) {
    var config = DistributionPlotDisplay.getSettingsConfig.call(plotter);

    var plot = plotter.dataSource.owner;

    var values = [];
    for (var i = 0, len = plot.n; i < len; i++) {
      values.push(i);
    }

    config.seriesNo = {
      name: 'seriesNo',
      labelText: 'Time series',
      values: values,
      texts: plot.getSeriesLabels(),
      type: 'select'
    };

    return config;
  };



  function CumulatedPlotDisplay(plotter, settings) {
    PlotDisplay.call(this, plotter, settings);
  }
  CumulatedPlotDisplay.prototype =
    Object.create(PlotDisplay.prototype);

  CumulatedPlotDisplay.optionText = 'Cumulated distribution';
  CumulatedPlotDisplay.prototype.description = 'Cumulated distribution of y values';

  CumulatedPlotDisplay.prototype.fittable = true;

  CumulatedPlotDisplay.getSettingsConfig = function (plotter) {
    return {
      absValues : {
        labelText: 'Use absolute values',
        value: false,
        type: 'checkbox'
      }
    };
  };

  CumulatedPlotDisplay.prototype.seriesLabels = [ 'value', 'cumulated value' ];

  CumulatedPlotDisplay.prototype.getPlotOptions = function () {
    return {
      title: 'Cumulated Distribution',
      labels: this.getSeriesLabels(true)
    };
  };

  function MultiSeriesCumulatedPlotDisplay(plotter, settings) {
    PlotDisplay.call(this, plotter, settings);
  }
  MultiSeriesCumulatedPlotDisplay.prototype =
    Object.create(CumulatedPlotDisplay.prototype);

  MultiSeriesCumulatedPlotDisplay.optionText = CumulatedPlotDisplay.optionText;
  MultiSeriesCumulatedPlotDisplay.prototype.description = CumulatedPlotDisplay.description;

  MultiSeriesCumulatedPlotDisplay.getSettingsConfig = function (plotter) {
    var config = CumulatedPlotDisplay.getSettingsConfig.call(plotter);

    var plot = plotter.dataSource.owner;

    var values = [];
    for (var i = 0, len = plot.n; i < len; i++) {
      values.push(i);
    }

    config.seriesNo = {
      name: 'seriesNo',
      labelText: 'Time series',
      values: values,
      texts: plot.getSeriesLabels(),
      type: 'select'
    };

    return config;
  };


  function AutoCorrelationPlotDisplay(plotter, settings) {
    MultiSeriesTimePlotDisplay.call(this, plotter, settings,
      settings.maxTimeStep + 1);
  }
  AutoCorrelationPlotDisplay.prototype =
    Object.create(MultiSeriesTimePlotDisplay.prototype);

  AutoCorrelationPlotDisplay.optionText =
    'Auto correlation / correlation time';

  AutoCorrelationPlotDisplay.prototype.description =
    'Auto correlation of y(t) and y(t - Δ) with Δ∈[1, Δ<sub>max</sub>]. The correlation is calculated for each Δ and averaged over m or all (much faster calculation) previous time steps. The correlation time τ is estimated by fitting an exponential function ~exp(-Δ/τ)';

  AutoCorrelationPlotDisplay.getSettingsConfig = function () {
    return {
      absValues: {
        type: 'checkbox',
        value: false,
        name: 'absValues',
        labelText: 'Use absolute values'
      },
      maxTimeStep: {
        min: 0,
        max: 1000,
        value: 16,
        step: 1,
        name: 'maxTimeStep',
        labelText: 'Time steps Δ<sub>max</sub>'
      },
      perStepMode : {
        labelText: 'Use only recent data for every step.',
        value: false,
        type: 'checkbox',
        name: 'perStepName',
        enables: [ 'intervalLength' ]
      },
      intervalLength: {
        min: 0,
        max: 1000,
        value: 50,
        step: 1,
        disabled: true,
        name: 'intervalLength',
        labelText: 'Interval length m'
      }
    };
  };

  AutoCorrelationPlotDisplay.prototype.drawModeConfig = {
    'histogram': 'Current auto correlation histogram',
    'stacked': 'Stacked auto correlations',
    'fit': 'Correlation Time'
  };

  AutoCorrelationPlotDisplay.prototype.downloadCurrentCsv = function () {
    var t = this.intializer.clock.getT();
    var csvString = this.dataAggregator.getStepCsv(t),
      blob = new Blob([ csvString ], {type: 'text/csv'}),
      url = URL.createObjectURL(blob);//Convert blob to URL

    startDownload(url, this.getCsvFileName());
  };


  AutoCorrelationPlotDisplay.prototype.initGui = function () {
    var box = MultiSeriesTimePlotDisplay.prototype.initGui.call(this),
      plot = this;


    var buttonDownloadCurrentCsv = cE('button');
    buttonDownloadCurrentCsv.className = 'plot-download-csv';
    buttonDownloadCurrentCsv.textContent = 'Download CSV for this step';
    this.domCache.divMenuButtons.appendChild(buttonDownloadCurrentCsv);

    this.attachEventListener({
      dispatcher: buttonDownloadCurrentCsv,
      type: 'click',
      callback: function () {
        plot.downloadCurrentCsv();
      }
    });

    var divDrawModes = cE('div');

    function boundChangeDrawMode(e) {
      plot.closeMenu();
      plot.changeDrawMode(e.target.value);
    }

    var drawModeInputs = {},
      drawModeInputDivs = {};

    var config = this.drawModeConfig;
    for (var type in config) {
      if (config.hasOwnProperty(type)) {
        var tmp = graphicTools.createLabeledRadioButton('draw-mode', 'drawMode', type, config[type]),
          surroundingDiv = tmp.surroundingDiv,
          radioButton = tmp.radioButton;

        divDrawModes.appendChild(surroundingDiv);

        drawModeInputs[type] = radioButton;
        drawModeInputDivs[type] = surroundingDiv;

        this.attachEventListener({
          dispatcher: radioButton,
          type: 'change',
          callback: boundChangeDrawMode
        });
      }
    }

    var drawMode = 'histogram';

    this.domCache.drawModeInputs = drawModeInputs;
    this.domCache.drawModeInputDivs = drawModeInputDivs;
    this.domCache.menu.insertBefore(divDrawModes, this.domCache.liveOptions);
    this.domCache.buttonDownloadCurrentCsv = buttonDownloadCurrentCsv;

    drawModeInputs[drawMode].checked = true;
    this.changeDrawMode(drawMode);

    return box;
  };

  AutoCorrelationPlotDisplay.barChartPlotter = function (e) {
    var ctx = e.drawingContext,
      points = e.points,
      yBottom = e.dygraph.toDomYCoord(0),
      xUnitWidth = e.dygraph.toDomXCoord(1) - e.dygraph.toDomXCoord(0);

    ctx.fillStyle = e.color;
    // Do the actual plotting.
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var center_x = p.canvasx;  // center of the bar

      ctx.globalAlpha = .5;
      ctx.fillRect(p.canvasx - .5 * xUnitWidth, p.canvasy,
          xUnitWidth, yBottom - p.canvasy);
      ctx.globalAlpha = 1;

      ctx.strokeRect(p.canvasx - .5 * xUnitWidth, p.canvasy,
          xUnitWidth, yBottom - p.canvasy);
    }
  };

  AutoCorrelationPlotDisplay.prototype.changeDrawMode = function (drawMode) {
    this.drawMode = drawMode;
    this.destroyGraph();
    this.drawState.initialized = false;
  }

  AutoCorrelationPlotDisplay.prototype.makePlotOld = function () {
    if (this.drawMode === 'histogram') {
      this.domCache.drawModeInputs.stacked.click();
    }
    this.domCache.drawModeInputDivs.histogram.remove();

    MultiSeriesTimePlotDisplay.prototype.makePlotOld.call(this);
  }

  AutoCorrelationPlotDisplay.prototype.getPlotOptions = function () {
    var options;
    switch (this.drawMode) {
      case 'histogram':
        options = this.getPlotOptionsHistogram();
        options.clickCallback = null;
        break;
      case 'stacked':
        options = this.getPlotOptionsStacked();
        options.clickCallback = function (e, t) {
          plot.plotter.initializer.clock.setT(t);
        };
        break;
      case 'fit':
        options = this.getPlotOptionsFit();
        options.clickCallback = function (e, t) {
          plot.plotter.initializer.clock.setT(t);
        };
        break;
    }

    return options;
  };

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram = function () {
    return {
      title: 'Auto correlation',
      plotter: AutoCorrelationPlotDisplay.barChartPlotter,
      color: this.plotter.getColor(),
      dateWindow: [ .5, this.dataAggregator.settings.maxTimeStep + .5 ],
      axes: {
        x: {
          drawGrid: false
        }
      },
      labels: [ 'Δt', 'correlation' ],
      xlabel: 'Δt',
      clickCallback: null
    };
  };

  AutoCorrelationPlotDisplay.prototype.seriesLabels = [
    'Correlation time', 'Correlation for Δt ='
  ];

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked = function () {
    var labels = this.getSeriesLabels();
    labels[0] = 'Δt';

    return {
      title: 'Auto correlation',
      xlabel: 't',
      labels: labels,
      fillGraph: true,
      strokeWidth: .1,
      fillAlpha: 1 - Math.pow(.3, 1 / this.n),
    };
  }

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit = function () {
    return {
      title: 'Correlation time',
      xlabel: 't',
      labels: [ 't', 'correlation time'],
    };
  }

  AutoCorrelationPlotDisplay.prototype.getData = function (tStart, tEnd) {
    if (this.drawMode === 'histogram') {
      return this.dataAggregator.getSingleStepData(this.plotter.initializer.clock.getT());
    }

    if (tStart === undefined && tEnd === undefined) {
      var interval = this.getIntervalToShow();
    } else {
      interval = [ tStart, tEnd ];
    }
    switch (this.drawMode) {
      case 'stacked':
        return this.dataAggregator.getData(interval[0], interval[1]);
      case 'fit':
        return this.dataAggregator.getDataFit(interval[0], interval[1]);
    }
  };

  AutoCorrelationPlotDisplay.prototype.draw = function (clock) {
    switch (this.drawMode) {
      case 'histogram':
        AutoCorrelationPlotDisplay.prototype.setTHistogram.call(this, clock);
        break;
      default:
        MultiSeriesTimePlotDisplay.prototype.setT.call(this, clock);
        break;
    }
  };

  AutoCorrelationPlotDisplay.prototype.setTHistogram = function (t) {
    if (t !== this.shownT && this.drawState.initialized) {
      this.shownT = t;

      try {
        this.updateGraph();
      } catch (e) {
        this.shownT = undefined;
        if (e === 'Unknown frame') {
          this.destroyGraph();
        } else {
          throw e;
        }
      }
    }
  };


  AutoCorrelationPlotDisplay.prototype.setTFit = TimePlotDisplay.prototype.setT;

  function MultiSeriesAutoCorrelationPlotDisplay(plotter, settings) {
    MultiSeriesTimePlotDisplay.call(this, plotter,
      settings, settings.maxTimeStep + 1);
  }
  MultiSeriesAutoCorrelationPlotDisplay.prototype =
    Object.create(AutoCorrelationPlotDisplay.prototype);

  MultiSeriesAutoCorrelationPlotDisplay.optionText = AutoCorrelationPlotDisplay.optionText;
  MultiSeriesAutoCorrelationPlotDisplay.prototype.description = AutoCorrelationPlotDisplay.description;

  MultiSeriesAutoCorrelationPlotDisplay.getSettingsConfig = function (plotter) {
    var config = AutoCorrelationPlotDisplay.getSettingsConfig(plotter);
    var plot = plotter.dataSource.owner;

    var values = [];
    for (var i = 0, len = plot.n; i < len; i++) {
      values.push(i);
    }

    config.seriesNo = {
      name: 'seriesNo',
      labelText: 'Time series',
      values: values,
      texts: plot.getSeriesLabels(),
      type: 'select'
    };

    return config;
  };


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
        enables: [ 'xMin'],
        labelText: 'Lower interval limit',
      },
      'xMin': {
        value: this.xMin,
        step: 'any',
        type: 'number',
        disabled: (this.xMin === undefined),
        name: 'xMin',
        labelText: 'x<sub>min</sub>'
      },
      'useXMax': {
        value: (this.xMax !== undefined),
        type: 'checkbox',
        name: 'useXMax',
        enables: [ 'xMax' ],
        labelText: 'Upper interval limit',
      },
      'xMax': {
        value: this.xMax || 1000,
        step: 'any',
        type: 'number',
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

    for (var name in fitInputsConfig) {
      if (fitInputsConfig.hasOwnProperty(name)
          && fitInputsConfig[name] !== undefined) {
        var config = fitInputsConfig[name],
          setting = graphicTools.createSetting(config);

        generalInputs[name] = setting;

        fitForm.appendChild(setting.domElement);
      }
    }

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


  var plotDisplayRegister = modules.newRegister('PlotDisplay');
  modules.newRegister('VarInitializer');
  modules.newRegister('Video');
  modules.newRegister('NetworkUi');
  modules.newRegister('createDrawModes');
  modules.newRegister('HelpTextGenerator');
  modules.newRegister('ModelConfig');

  plotDisplayRegister.add = function (type, Constructor, prototypeFns, fns) {
    var C = tools.Register.prototype.add.call(this, type, Constructor, prototypeFns, fns);
    C.prototype.plotType = type;
    return C;
  };

  modules.add('PlotDisplay', 
    'energy',
    TimePlotDisplay,
    {
      description: 'Average energy per spin',
      customConstructor: function (plotter, settings) {
        TimePlotDisplay.call(this, plotter, settings);
      },

      getPlotOptions: function () {
        return {
          title: 'Energy per spin',
          xlabel: 't',
          labels: this.getSeriesLabels(true)
        };
      },
    },
    {
      optionText: 'Per spin energy ⟨e⟩',
    }
  );

  modules.add('PlotDisplay', 'mean value', MeanValuePlotDisplay);
  modules.add('PlotDisplay', 'multi series mean value', MultiSeriesMeanValuePlotDisplay);
  modules.add('PlotDisplay', 'distribution', DistributionPlotDisplay);
  modules.add('PlotDisplay', 'multi series distribution', MultiSeriesDistributionPlotDisplay);
  modules.add('PlotDisplay', 'cumulated', CumulatedPlotDisplay);
  modules.add('PlotDisplay', 'multi series cumulated', MultiSeriesCumulatedPlotDisplay);
  modules.add('PlotDisplay', 'auto correlation', AutoCorrelationPlotDisplay);
  modules.add('PlotDisplay', 'multi series auto correlation',
    MultiSeriesAutoCorrelationPlotDisplay);

  modules.add('SettingsPreprocessor', 'NetworkUi', function (oldModelSettings, newModelSettings) {
    newModelSettings.video = modules.get('NetworkUi', newModelSettings.network.type).getVideoSettings(newModelSettings);
  });

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
    Controls: Controls,
    Simulation: Simulation,
    Clock: Clock,
    Video: Video,
    DynamicVideo: DynamicVideo,
    BasicPlotter: BasicPlotter,
    Plotter: Plotter,
    PlotDisplay: PlotDisplay,
    TimePlotDisplay: TimePlotDisplay,
    VarInitializer: VarInitializer,
    MultiSeriesTimePlotDisplay: MultiSeriesTimePlotDisplay,
    MeanValuePlotDisplay: MeanValuePlotDisplay,
    MultiSeriesMeanValuePlotDisplay: MultiSeriesMeanValuePlotDisplay,
    AutoCorrelationPlotDisplay: AutoCorrelationPlotDisplay,
    MultiSeriesAutoCorrelationPlotDisplay: MultiSeriesAutoCorrelationPlotDisplay,
    listFeatures: listFeatures,
    Fitter: Fitter,
    Fit: Fit,
    IntColorSet: IntColorSet,
    ModelInfo: ModelInfo,
    Help: Help,
    Downloader: Downloader,
    imageSaver: imageSaver,
    colorSet: colorSet,
    Initializer: Initializer,
    ENDIAN: ENDIAN
  };
}());
