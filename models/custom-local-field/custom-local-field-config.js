'use strict';

spimosimCore.modules.add("ModelConfig", "custom local field", {
  info: {
    title: 'Custom Local Field Model',
    compactName: 'CustomLocalField',
    url: 'custom-local-field/custom-local-field-model.html'
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
      hString: {
        type: 'string',
        labelText: 'h(s, l, M)',
        inputName: 'h',
        key: 'h',
        value: '4*l-20*s*abs(M)',
      },
      beta: {
        labelText: 'β',
        inputName: 'beta',
        key: 'b',
        min: 0,
        value: 1,
        max: 5,
        step: .01
      },
    },
    updateAlgorithms: {
      'random-sequential-update': 'Random sequential update',
      'random-serial-update': 'Random serial update',
      'instant-update': 'Simultaneous update',
    },
    network: {
      types: [
        '2d-lattice',
        '1d-lattice',
        'moore-2d-lattice',
        'nd-lattice',
        'barabasi-albert'
      ]
    }
  },
  simulation: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      urls: [
        '../../../lib/spimosimNetwork/networkCore.js',
        '../../../lib/modules/Network/1d-lattice.js',
        '../../../lib/modules/Network/2d-lattice.js',
        '../../../lib/modules/Network/moore2d-lattice.js',
        '../../../lib/modules/Network/nd-lattice.js',
        '../../../lib/modules/Network/barabasi-albert.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../lib/modules/ProtocolVar/spin-array.js',
        '../../../models/custom-local-field/custom-local-field-model.js'
      ],
      name: 'customLocalField'
    }
  },
  plotter: {
    features: true,
    backend: {
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
