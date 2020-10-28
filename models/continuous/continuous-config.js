'use strict';

spimosimCore.modules.add("ModelConfig", "continuous", {
  info: {
    title: "Continuous spins test",
    compactName: "ContTest",
    url: 'continuous/continuous-model.html',
  },
  controls: {
    features: [
      'changeEndlessMode', 'deleteOldData', 'saveVarCheckboxes', 'uploadInitialState'
    ],
    stateVariables: {
      s: {
        type: 'Float64Array',
        name: 's',
        initialValue: {
          'float expectation value': {
            min: -1,
            max: 1,
            step: .01,
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
      'random-sequential-update': 'Random sequential update',
      'random-serial-update': 'Random serial update',
    },
    network: {
      types: [
        '2d-lattice',
        '1d-lattice',
        'nd-lattice',
        'barabasi-albert'
      ]
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
      },
      gamma: {
        labelText: 'γ',
        key: 'g',
        min: .5,
        value: 1,
        max: 10,
        step: .1
      }
    }
  },
  simulation: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      urls: [
        '../../../lib/spimosimNetwork/networkCore.js',
        '../../../lib/modules/Network/1d-lattice.js',
        '../../../lib/modules/Network/2d-lattice.js',
        '../../../lib/modules/Network/nd-lattice.js',
        '../../../lib/modules/Network/barabasi-albert.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../models/continuous/continuous-model.js'
      ],
      name: 'continuous'
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
      'duration',
      'neighbors',
      'coupling ratio',
    ]
  },
  video: {
    features: true,
    drawModes:
      /*{
        type: 'grey scale spins',
        modes: [
          {
            name: 's',
            min: -1,
            max: 1,
            labelText: 's spins (greý)'
          }
        ]
      },*/
    {
      type: 'weighted spins',
      names: ['s'],
      labelTexts: ['s spins (color)']
    }
  }
});
