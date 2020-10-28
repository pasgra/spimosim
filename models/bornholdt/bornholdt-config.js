'use strict';

spimosimCore.modules.add("ModelConfig", "Bornholdt", {
  info: {
    title: 'Bornholdt Model',
    compactName: 'Bornholdt',
    url: 'bornholdt/bornholdt-info.html'
  },
  controls: {
    features: [
      'changeEndlessMode', 'deleteOldData', 'saveVarCheckboxes', 'uploadInitialState'
    ],
    network: {
      types: [
        '2d-lattice', '1d-lattice', 'nd-lattice'
      ],
    },
    stateVariables: {
      s: {
        type: 'SpinArray',
        name: 's spins',
        initialValue: {
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
    parameters: {
      beta: {
        labelText: 'β',
        key: 'b',
        min: 0,
        value: 1,
        max: 10,
        step: .01
      },
      alpha: {
        labelText: 'α',
        key: 'a',
        min: 0,
        value: 4,
        max: 40,
        step: .01
      },
      j: {
        labelText: 'j',
        key: 'j',
        min: 0,
        value: 1,
        max: 20,
        step: .01
      }
    },
    updateAlgorithms: {
      'random-sequential-update': 'Random sequential update',
      'random-serial-update': 'Random serial update',
    },
  },
  simulation: {
    backend: {
      type: 'webworker',
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      urls: [
        '../../../lib/spimosimNetwork/networkCore.js',
        '../../../lib/modules/Network/1d-lattice.js',
        '../../../lib/modules/Network/2d-lattice.js',
        '../../../lib/modules/Network/nd-lattice.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../lib/modules/ProtocolVar/spin-array.js',
        '../../../models/bornholdt/bornholdt-model.js'
      ],
      name: 'bornholdt'
    }
  },
  plotter: {
    features: true,
    backend: {
      type: 'webworker',
      workerUrl: '../lib/modules/PlotBackend/webworker.worker.js',
      urls: [
        '../../../lib/modules/PlotComputer/auto-correlation.js',
        '../../../lib/modules/PlotComputer/mean-value.js',
        '../../../lib/modules/PlotComputer/distribution.js',
        '../../../lib/modules/PlotComputer/cumulated.js',
        '../../../models/bornholdt/plots/ising-market-plot-computers.js'
      ]
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
      'euclid site-by-site correlation',
      'site-by-site correlation',
      'per spin time correlation',
      'per spin flip time correlation'
    ]
  },
  video: {
    features: true,
    drawModes: {
      type: 'spins and flips',
      names: [ 's' ]
    }
  }
});
