'use strict';

spimosimCore.modules.add("ModelConfig", "int", {
  info: {
    title: 'Integer Test Model',
    compactName: 'int',
    url: 'int/int-info.html'
  },
  controls: {
    features: [
      'changeEndlessMode', 'deleteOldData', 'saveVarCheckboxes', 'uploadInitialState'
    ],
    network:{
      types: [
        '2d-lattice', '1d-lattice', 'nd-lattice'
      ],
    },
    stateVariables: {
      vals: {
        type: 'Int32Array',
        name: 'vals',
        initialValue: {
          'int range': {
            min: 0,
            numberVarName: 'numberOfStates'
          }
        }
      },
      energy: {
        type: 'Float64',
        name: 'energy'
      }
    },
    parameters: {
      numberOfStates: {
        labelText: 'Number of states',
        key: 'n',
        min: 2,
        value: 5,
        max: 100,
        step: 1
      },
      beta: {
        labelText: 'β',
        key: 'b',
        min: 0,
        value: 1,
        max: 10,
        step: .01
      }
    },
    updateAlgorithms: {
      default: 'default'
    }
  },
  simulation: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      type: 'webworker',
      urls: [
        '../../../lib/spimosimNetwork/networkCore.js',
        '../../../lib/modules/Network/1d-lattice.js',
        '../../../lib/modules/Network/2d-lattice.js',
        '../../../lib/modules/Network/nd-lattice.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../models/int/int-model.js'
      ],
      name: 'int'
    }
  },
  plotter: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      type: 'webworker',
      urls: [
        '../../../lib/modules/PlotComputer/auto-correlation.js',
        '../../../lib/modules/PlotComputer/mean-value.js',
        '../../../lib/modules/PlotComputer/distribution.js',
        '../../../lib/modules/PlotComputer/cumulated.js',
      ],
    },
    plotTypes: [
      'energy'
    ]
  },
  video: {
    drawModes: {
      type: 'int map',
      names: [ 'vals' ],
      minValues: [ 0 ]
    }
  }
});
