/* CENTRAL MODEL CONFIGURATION FILE */

var modelName = 'Ising Model';// The name of the model


/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Define the state variables here.                                           *
 * State variables are saved after every time step of the simulation.         *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */

var stateVariables = {
  
  sigma: {                    // Internal variable name

    type: 'Int8Array',       // An array of 8 bit integers with one
                              // entry per spin. The length of this array will
                              // depend on the choosen network size and does
                              // not need to be specified here.

    labelText: 'σ'            // Name of the variable that will appear on the
                              // user interface
  },

// A minimal version of the Ising model just needs the state variable σ.
// Uncomment the following section the enhance the application by defining
// the magnetisation as a state variable.
  /*
  magnetisation: {

    type: 'Float64',          // A 64 bit floating point number.

                              // No different labelText needed. The internal
                              // name 'magnetisation' is just fine.
    
    plot: {                   // The variable can be plotted
      description: 'The magnatisation is defined as the arithmetic mean ' +
        'of all spins. It is the order parameter of the Ising model.',
      optionText: 'Magnetisation (mean spin orientation)'
    }
  }
  */

};

// Ihe state variable shown in the video player (internal name).
var stateVariableToShow = 'sigma';




/*                      °°°Oo...oO°Oo......oO°Oo...oO°°°                      *
 * Define the model parameters here.                                          *
 * The values for these parameters are chosen by the user and than passed     *
 * to the simulation.                                                         *
 *                      ...oO°°°Oo.oO°°°°°°Oo.oO°°°Oo...                      */

var parameters = {
  
  beta: {                     // The inverse temperature
    labelText: 'inverse temperature β',
    
    value: 1,                 // Default value
    min: 0,                   // Lowest possible value
    max: 10,                  // Highest possible value
    step: .01,                // Set beta to a precision of .01 (default: 1)

    key: 'b',                 // Pressing the key [b] increases beta by the step
                              // choosen above, [SHIFT] + [b] decreases beta,
                              // [ALT] + [b] increases by 10 steps, 
                              // [ALT] + [SHIFT] + [b] decreases by 10 steps,
  },
  
  j: {                        // Coupling to the neighbors

    type: 'number',           // The default range input is nice to input a
                              // number from a given range. Since 'min' and
                              // 'max' shall not be defined, a number input is
                              // the better alternative here.

    value: 1,                 // Defaults to 0 if removed.
    step: 'any',              // Allow arbitary presicion
    labelText: 'coupling j',
    key: 'j',
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

    network: {                // Use extra library: spimosimNetwork
      types: [                // Some networks types are predefined.
                              // Set which types are available for the model.

        'quadratic',          // A quadratic LxL lattice
//        '1d-lattice',       // 1d-lattice
//        '2d-lattice',       // A lattice with a width and a height
//        'nd-lattice',       // A LxLx...xL lattice with dimension n
        'spimosim',           // SpiMoSim!!!
//        'barabasi-albert'   // A scale free network generated by the
                              // Barabasi-Albert algorithm
      ]
    },

    features: [
      'changeEndlessMode', 'deleteOldSteps', 'checkboxStartAutomatically'
    ],                        // 
    
    updateAlgorithms: {       // A list of algorithms.

      'random-serial-update': 'Random serial update',
                              // The syntax is:
                              // 'internal name': 'Name shown to user'

//      'random-sequential-update': 'Random sequential update'
    },
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
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'Network/spimosim.js',
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'ProtocolVar/typed.js',
        "../" + ROOT_TO_MODULES + MODULES_TO_ROOT + 'ProtocolVar/typed-array.js',
                              // A javascript file defining network types
        "../" + ROOT_TO_MODULES + PAGE_TO_ROOT + 'model.js'
                              // A javascript file containing the code of
                              // the model (relative to webworker)
      ],

      name: modelName         // The name of the model to load in the webworker
    },
/*
    // Alternative backend written in python or other languages
    // See: PySpiMoSim repository
    backend: {
      type: "server",
      url: "ws://localhost:8090"
    },
*/

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
        type: 'magnetisation',// The magnetisation plot
        settings: {}          // If this plot had settings those could be
                              // defined here
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

    drawModes: {              // The algorithm to give the nodes/sites a color
      type: 'int map',        // chose algorithm: 'int map' colors nodes by
                              // mapping the integers of the state variable(s)
                              // in names:
      names: [ stateVariableToShow ],
                              // to the integers in colorMap.LIST starting with
      minValues: [ -1 ]       // the value(s) defined in minValues. The
                              // smallest value for a spin in the Ising model
                              // is -1
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
