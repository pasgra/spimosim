'use strict';

spimosimCore.modules.add("ModelConfig", "opinion", {
  info: {
    title: 'Opinion Model',
    compactName: 'opinion',
    url: 'opinion/opinion-model-info.html',
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
      alpha: {
        labelText: 'α',
        inputName: 'alpha',
        key: 'a',
        min: 0,
        value: 10,
        max: 100,
        step: .01
      },
      mf: {
        labelText: 'mf',
        inputName: 'mf',
        min: 0,
        value: .04,
        max: 1,
        step: .01
      },
      temp0: {
        labelText: 'temp0',
        inputName: 'temp0',
        min: 0,
        value: 4 / Math.log(3),
        max: 10,
        step: 1e-4
      },
      tempMin: {
        labelText: 'tempMin',
        inputName: 'tempMin',
        min: 0,
        value: .2,
        max: 1,
        step: .01
      },
      tempMax: {
        labelText: 'tempMax',
        inputName: 'tempMax',
        min: 0,
        max: 1e4,
        value: 1e3,
        step: 10
      },
    },
    updateAlgorithms: {
      'random-sequential-update': 'Random sequential update',
      'random-serial-update': 'Random serial update'
    },
    network: {
      types: [
        '2d-lattice',
        '1d-lattice',
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
        '../../../lib/modules/Network/nd-lattice.js',
        '../../../lib/modules/Network/barabasi-albert.js',
        '../../../lib/modules/ProtocolVar/typed.js',
        '../../../lib/modules/ProtocolVar/typed-array.js',
        '../../../lib/modules/ProtocolVar/spin-array.js',
        '../../../models/opinion/opinion-model.js'
      ],
      name: 'opinion'
    }
  },
  plotter: {
    backend: {
      workerUrl: '../lib/modules/SimulationBackend/webworker.worker.js',
      urls: [
        '../../../lib/modules/PlotComputer/auto-correlation.js',
        '../../../lib/modules/PlotComputer/mean-value.js',
        '../../../lib/modules/PlotComputer/distribution.js',
        '../../../lib/modules/PlotComputer/cumulated.js',
        '../isingMarketPlots/ising-market-plot-computers.js'
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
