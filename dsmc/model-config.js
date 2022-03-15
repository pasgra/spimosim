/* CENTRAL MODEL CONFIGURATION FILE */

var modelName = 'Direct Simulation Monte Carlo';// The name of the model


/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Define the state variables here.                                           *
 * State variables are saved after every time step of the simulation.         *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */

var stateVariables = {
  x: {
    type: 'Float64Array',
    labelText: 'x'
  },
  y: {
    type: 'Float64Array',
    labelText: 'y'
  },
  z: {
    type: 'Float64Array',
    labelText: 'z'
  },
  vx: {
    type: 'Float64Array',
    labelText: 'v<sub>x</sub>'
  },
  vy: {
    type: 'Float64Array',
    labelText: 'v<sub>y</sub>'
  },
  vz: {
    type: 'Float64Array',
    labelText: 'v<sub>z</sub>'
  },

  cellCentersX: {
    type: 'Float64Array',
    labelText: 'cell centers x'
  },
  cellCentersY: {
    type: 'Float64Array',
    labelText: 'cell centers y'
  },
  cellCentersZ: {
    type: 'Float64Array',
    labelText: 'cell centers z'
  },

  status: {
    type: 'Int8Array',
  },

  meanFreePath: {
    type: 'Float64',
    plot: {
      description: 'Mean free path',
      optionText: 'Mean free path'
    }
  },

  vMean: {
    type: 'Float64',
    plot: {
      description: 'Mean velocity',
      optionText: 'Mean velocity'
    }
  }
};


/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Define the model parameters here.                                          *
 * The values for these parameters are chosen by the user and than passed     *
 * to the simulation.                                                         *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */

var parameters = {
  n: {
    labelText: 'Number of molecules',
    min: 1,
    max: 1e5,
    value: 1000,
    step: 1,
    key: 'n',
    logScale: true
  },
  d: {
    labelText: 'Particle diameter',
    min: 0,
    max: .001,
    value: 1e-5,
    step: 'any',
    key: 'd',
  },
  xMax: {
    labelText: 'x<sub>max</sub>',
    min: .1,
    max: 10,
    value: 2,
    step: 'any',
    key: 'x',
  },
  yMax: {
    labelText: 'y<sub>max</sub>',
    min: .1,
    max: 10,
    value: 2,
    step: 'any',
    key: 'y',
  },
  zMax: {
    labelText: 'z<sub>max</sub>',
    min: .1,
    max: 10,
    value: 2,
    step: 'any',
    key: 'z',
  },
  xMinOpen: {
    labelText: 'Open towards x<sub>min</sub>',
    type: 'checkbox',
    value: false
  },
  xMaxOpen: {
    labelText: 'Open towards x<sub>max</sub>',
    type: 'checkbox',
    value: true
  },
  yMinOpen: {
    labelText: 'Open towards y<sub>min</sub>',
    type: 'checkbox',
    value: false
  },
  yMaxOpen: {
    labelText: 'Open towards y<sub>max</sub>',
    type: 'checkbox',
    value: false
  },
  zMinOpen: {
    labelText: 'Open towards z<sub>min</sub>',
    type: 'checkbox',
    value: false
  },
  zMaxOpen: {
    labelText: 'Open towards z<sub>max</sub>',
    type: 'checkbox',
    value: false
  },
  boundariesX: {
    labelText: 'Boundaries: x(y,z);...',
    value: '(y-1)*(y-1)+(z-1)*(z-1)>0.25?0.2:NaN',
    type: 'text',
  },
  boundariesY: {
    labelText: 'Boundaries: y(z,x);...',
    value: '',
    type: 'text',
  },
  boundariesZ: {
    labelText: 'Boundaries: z(x,y);...',
    value: "x>0.2?(1+(0.5+x*x/8)*sqrt(1-((y-1)/(0.5+x*x/8))**2)):NaN\nx>0.2?(1-(0.5+x*x/8)*sqrt(1-((y-1)/(0.5+x*x/8))**2)):NaN",
    type: 'text',
  },
  dt: {
    labelText: 'Time step',
    min: .000001,
    max: 1,
    value: .01,
    step: 'any',
    key: 'd',
    logScale: true
  },
  mpc: {
    labelText: 'Molecules per cell',
    min: 1,
    max: 1000,
    value: 20,
    step: 1,
    key: 'm',
  },
  adaptCellCenterPositions: {
    labelText: 'Adapt cell center positions',
    type: 'checkbox',
  },
  cellCenterMoveInterval: {
    labelText: 'Cell centers move interval',
    type: 'range',
    logScale: true,
    parent: 'adaptCellCenterPositions',
    parentValue: true,
    step: 1,
    min: 1,
    max: 1e6,
    value: 10,
  }
};

















/*******************************************************************************
*                                                                              *
*   ~    ~~~    ~~~~~  !!!  ADVANCED  CONFIGURATION  !!!  ~~~~~    ~~~    ~    *
*                                                                              *
*******************************************************************************/



/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Relative paths of the following files/folders (with trailing slash):       *
 * - PAGE: The shown HTML file                                                *
 * - ROOT: The root directory containing the model and all libraries          *
 * - LIB_SPIMOSIM_UI: The DIRECTORY containing spimosimUi.                    *
 * - LIB_SPIMOSIM_CORE: The DIRECTORY containing spimosimUi.                  *
 * - LIB_GIF: The DIRECTORY containing GIF.js.                                *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */

var ROOT_TO_PAGE              = '../';
var PAGE_TO_ROOT              = location.pathname
                                        .replace(/\/$/, '')
                                        .replace(/^.*\//, '') + '/';

var LIB_SPIMOSIM_CORE_TO_ROOT = 'lib/spimosimCore/';
var ROOT_TO_LIB_SPIMOSIM_CORE = '../../';

var MODULES_TO_ROOT = 'lib/modules/';
var ROOT_TO_MODULES = '../../';

var LIB_SPIMOSIM_UI_TO_ROOT   = 'lib/spimosimUi/';
var ROOT_TO_LIB_SPIMOSIM_UI   = '../../';

var LIB_SPIMOSIM_NETWORK_TO_ROOT   = 'lib/spimosimNetwork/';
var ROOT_TO_LIB_SPIMOSIM_NETWORK   = '../../';

var LIB_GIF_TO_ROOT           = 'ext_lib/lib/gif.js/';







/*                      °°°Oo...                ...oO°°°                      *
 *                              °°°Oo......oO°°°                              *
 *            |    |   A   | |   |       /°\  /°\  |   | |°°° I  /°°°         *
 *            |\  /|  / \  | |\  |      |    |   | |\  | |    I |             *
 *            | \/ | |---| | | \ |      |    |   | | \ | |--  I |  -|         *
 *            |    | |   | | |  \|      |    |   | |  \| |    I |   |         *
 *            |    | |   | | |   |       \_/  \_/  |   | |    I  \__|         *
 *                              ...oO°°°°°°Oo...                              *
 *                      ...oO°°°                °°°Oo...                      */

var modelConfig = {

/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * General information about the model.                                       *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
  info: {
    title: modelName,         // The name of the model shown on the top

    url: ROOT_TO_PAGE + PAGE_TO_ROOT + 'model-info.html',
                              // Model info text file (relative to page)

    helpTextId: 'custom',
                              // Do not use default (full) help text, but a
                              // custom text defined in
                              // ../template/generateHelpText.js

    iconUrl: ROOT_TO_PAGE + LIB_SPIMOSIM_UI_TO_ROOT + 'icon/'
                              // Icons used in the help text.
  },





/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Relative paths of the following files/folders (with trailing slash):       *
 * - PAGE: The shown HTML file                                                *
 * - ROOT: The root directory containing the model and all libraries          *
 * - LIB_SPIMOSIM_UI: The DIRECTORY containing spimosimUi.                    *
 * - LIB_SPIMOSIM_CORE: The DIRECTORY containing spimosimUi.                  *
 * - LIB_GIF: The DIRECTORY containing GIF.js.                                *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
  controls: {

    stateVariables: stateVariables,
                              // The state variables as defined above 

    parameters: parameters,   // The parameters as defined above

    features: [
      'changeEndlessMode', 'deleteOldSteps', 'checkboxStartAutomatically'
    ],                        // 
  },

  
  


/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Technical details how the simulation is done.                              *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
  simulation: {

    backend: {
//    type: 'webworker',      // Default: webworker. The model is written in
                              // javascript and the simulation runs in a
                              // webworker
      
      workerUrl: ROOT_TO_PAGE + MODULES_TO_ROOT +
        'SimulationBackend/webworker.worker.js',
                              // The webworker script used in the backend

      urls: [
        "../" + ROOT_TO_MODULES + LIB_SPIMOSIM_NETWORK_TO_ROOT + 'networkCore.js',
                              // A javascript file containing the library
                              // spimosimNetwork (relative to webworker)
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'Network/2d-lattice.js',
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'Network/quadratic.js',
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'ProtocolVar/typed.js',
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'ProtocolVar/typed-array.js',
                              // A javascript file defining network types
        "../" + ROOT_TO_MODULES + PAGE_TO_ROOT + 'model.js'
                              // A javascript file containing the code of
                              // the model (relative to webworker)
      ],

      name: modelName         // The name of the model to load in the webworker
    },

    continuableWithNewSettings: true
                              // The simulation can be continued with new
                              // settings. Otherwise spimosim assumes
                              // that it has to be restarted.
  },


  
  
/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Plots.                                                                     *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
  plotter: {

    features: true,
                              // Activates all features. Remove option to
                              // deactivate all features, true for all features
                              // or to an array with some of the following
                              // entries:
                              // "deletable plots"
                              // "description under plots"
                              // "create plot menu"
                              // "old plot options"
                              // "keep plots"
                              // "delete on restart"

    backend: {
      type: 'webworker',
      workerUrl: ROOT_TO_PAGE + MODULES_TO_ROOT +
        'PlotBackend/webworker.worker.js',
      urls: [
        "../" + ROOT_TO_LIB_SPIMOSIM_CORE + MODULES_TO_ROOT + 'PlotComputer/mean-value.js',
        "../" + ROOT_TO_LIB_SPIMOSIM_CORE + MODULES_TO_ROOT + 'PlotComputer/auto-correlation.js',
        "../" + ROOT_TO_LIB_SPIMOSIM_CORE + MODULES_TO_ROOT + 'PlotComputer/distribution.js',
        "../" + ROOT_TO_LIB_SPIMOSIM_CORE + MODULES_TO_ROOT + 'PlotComputer/cumulated.js',
        "../" + ROOT_TO_LIB_SPIMOSIM_CORE + PAGE_TO_ROOT + 'plots/plot-computers.js'
      ]
    },
    
    plotTypes: [              // List of plots that were written for this model
                              // by defining a PlotDisplay, a DataAggregator
                              // and (assuming using a webworker backend) a
                              // PlotComputer.
    //'ising/magnetisation change'
                              // This plot needs the magnetisation to be saved.
                              // It is defined by the files plots/data-aggregators.js
                              // plots/plot-computers.js and plot-displays.js
    ],
    
    defaultPlots: [           // Plots that are created by default
      {
        type: 'meanFreePath',// The magnetisation plot
      },
    ]
  },





/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Display the state of the model in a video player.                          *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
  video: {
    features: true,           // Activate all general features (well, currrently
                              // there are no general features)

    dynamicVideo: {
      features: true          // Activate all playback features. Alternative:
                              // An array with some of the following entries:
                              // "playbackControls"
                              // "timeLabel"
                              // "timeProgressBar"
                              // "fpsControls"
                              // "playbackButtons"
                              // "playPauseButton"
                              // "skipToFirstButton"
                              // "skipToLastButton"
    },

    type: 'particles',

    drawModes: {
      type: 'particles',
      statusVar: 'status',
      velocityVars: [ 'vx', 'vy', 'vz' ],
      minValue: 0,
      maxValue: .16
    }
  },





/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Overwrite colors. The default colors are saved in spimosimUi.colorSet.     *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
/*
 colorSet: {
    LIST: [ '#FF0000', undefined, '#0000FF' ],
                              // How about red for -1 and blue for 1?
  }
*/





/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Clock:                           *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */
/*
  clock: {
//  endlessMode: false,       // Endless mode means that the simulation has no
                              // end but just continues as needed.

    fps: {                    // Default settings for all range inputs to
                              // control frames per seconds (like in
                              // video.dynamicPlayer.fps)
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

    buffer: {                 // The shown step is usually not the last one
                              // simulated.

      trigger: {              // Continue simulation when the shown time gets
                              // close to the last simulated step.
        seconds: 15,          // Buffer if buffer gets smaller than 15s
//      steps: 1500           // Or 1500 steps
      },
      
      internal: {             // When triggered try to buffer
        seconds: 20,          // 20 seconds
//      steps: 2000
      },

      shownFuture: {
        seconds: 10,          // Show 10 seconds of future in plots and progress
                              // bar of video
//      steps: 1000
      },

      shownHistory: {
        seconds: 10,          // Show 10 seconds of history in plots
//      steps: 1000
      },
    },

    onSlowSimulation: 'retard'// If the simulation runs to slow:
                              // - 'ignore': just show message
                              //     'frame not simulated, yet'.
                              // - 'retard': wait a little
                              // - 'slow down': wait and decrease
                              //    fps
  },
*/
};

spimosimCore.modules.add('ModelConfig', modelName, modelConfig);
