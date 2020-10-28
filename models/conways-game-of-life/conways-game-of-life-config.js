'use strict';

spimosimCore.modules.add("ModelConfig", "Game of Life", {
  info: {
    title: "Conway's Game of Life",
    compactName: "ConwaysGameOfLife",
    url: 'conways-game-of-life/conways-game-of-life-model.html',
  },
  controls: {
    features: [
      'changeEndlessMode', 'deleteOldData', 'saveVarCheckboxes', 'uploadInitialState'
    ],
    stateVariables: {
      s: {
        type: 'SpinArray',
        name: 's spins',
        initialValue: {
          'spin image': {},
          'spin expectation value': {
            key: 's'
          }
        }
      },
      sSum: {
        type: 'Float64',
        name: 'sum of s spins'
      }
    },
    updateAlgorithms: {
      'instant-step': 'Simultaneous update',
    },
    network: {
      types: [
        'moore-2d-lattice',
      ]
    }
  },
  simulation: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      urls: [
        '../../../lib/spimosimNetwork/networkCore.js',
        '../../../lib/modules/Network/moore2d-lattice.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../lib/modules/ProtocolVar/spin-array.js',
        '../../../models/conways-game-of-life/conways-game-of-life-model.js'
      ],
      name: 'conwaysGameOfLife'
    }
  },
  plotter: {
    backend: {
      workerUrl: '../lib/modules/PlotBackend/webworker.worker.js',
      urls: [
        '../../../lib/modules/PlotComputer/auto-correlation.js',
        '../../../lib/modules/PlotComputer/mean-value.js',
        '../../../lib/modules/PlotComputer/distribution.js',
        '../../../lib/modules/PlotComputer/cumulated.js',
        '../../../models/bornholdt/plots/ising-market-plot-computers.js'
      ],
    },

    plotTypes: [
      'magnetisation',
      'abs magnetisation',
      'log returns',
      'abs log returns',
      's flips',
      'duration',
      'neighbors',
      'coupling ratio',
      'site-by-site correlation',
      'per spin time correlation',
      'per spin flip time correlation'
    ]
  },
  video: {
    drawModes: {
      type: 'spins and flips',
      names: [ 's' ]
    }
  }
});
