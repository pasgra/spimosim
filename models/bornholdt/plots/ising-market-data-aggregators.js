/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  //Shortcuts to functions
  var modules = spimosimCore.modules,
    DataAggregator = spimosimCore.DataAggregator,
    TimeDataAggregator = spimosimCore.TimeDataAggregator,
    MultiSeriesTimeDataAggregator = spimosimCore.MultiSeriesTimeDataAggregator,
    AutoCorrelationDataAggregator = spimosimCore.modules.get("DataAggregator", "auto correlation");

  modules.add('DataAggregator', 
    'magnetisation',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        return {
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'abs magnetisation',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        return {
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'cMean',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        return {
          cSum: this.plotter.dataSource.protocol.getAllTransferable('cSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'log returns',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - 1);

        return {
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'abs log returns',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - 1);

        return {
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    's flips',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - 1);

        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'delta cMean',
    TimeDataAggregator,
    {
      getConsts: function () {
        return {
          n: this.plotter.dataSource.modelSettings.network.size
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - 1);

        return {
          cSum: this.plotter.dataSource.protocol.getAllTransferable('cSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'duration',
    DataAggregator,
    {
      getConsts: function () {
        return {};
      },

      getVars: function (from, to) {
        return {
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      },

      isPdf: true,
      isDiscrete: true
    }
  );

  modules.add('DataAggregator', 
    'neighbors',
    TimeDataAggregator,
    {
      getConsts: function () {
        var dataSource = this.plotter.dataSource;
        if (dataSource.backendObjects.adjacencyLists === undefined) {
          if (!this.requestedAdjacencyLists) {
            dataSource.requestBackendObjects([ 'adjacencyLists' ]);
            this.requestedAdjacencyLists = true;
          }

          throw 'Consts not ready';
        }

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          adjacencyLists: dataSource.backendObjects.adjacencyLists,
        };
      },

      getVars: function (from, to) {
        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'coupling ratio',
    TimeDataAggregator,
    {
      getConsts: function () {
        var dataSource = this.plotter.dataSource;
        if (dataSource.backendObjects.adjacencyLists === undefined) {
          if (!this.requestedAdjacencyLists) {
            dataSource.requestBackendObjects([ 'adjacencyLists' ]);
            this.requestedAdjacencyLists = true;
          }

          throw 'Consts not ready';
        }

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          adjacencyLists: dataSource.backendObjects.adjacencyLists,
          modelSettings: dataSource.modelSettings
        };
      },

      getVars: function (from, to) {
        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'euclid site-by-site correlation',
    AutoCorrelationDataAggregator,
    {
      customConstructor: function (plotter, settings) {
        var modelSettings = plotter.dataSource.modelSettings,
          width = modelSettings.network.width,
          height = modelSettings.network.height,
          max = Math.min(width, height) >> 1,
          compMax = max * Math.sqrt(2) + 2,
          x, y,
          dist;//distance squared

        this.distances = [];
        for (var i = 1; i <= compMax; i++) {
          for (var j = 0; j <= compMax; j++) {
            dist = Math.sqrt(i * i + j * j);
            if (this.distances.indexOf(dist) === -1 && dist <= max) {;
              this.distances.push(dist);
            }
          }
        }

        this.distances = this.distances.sort(function (a, b) {
          return a - b;
        });

        MultiSeriesTimeDataAggregator.call(this, plotter, settings, this.distances.length + 1);
      },

      getStepCsv: function (t) {
        var dataY = this.dataY,
          distances = this.distances,
          str = '';

        for (var i = 1; i < this.n; i++) {
          str += distances[i - 1] + ' ' + dataY[i][t - this.tMin] + '\n';
        }

        return str;
      },

      getSingleStepData: function (t) {
        var dataY = this.dataY,
          n = this.n,
          data = [];

        if (dataY[0][t - this.tMin] === undefined) {
          throw 'Unknown frame';
        }

        for (var i = 1; i < n; i++) {
          data.push([
            this.distances[i - 1],
            dataY[i][t - this.tMin]
          ]);
        }

        return data;
      },

      getConsts: function () {
        var dataSource = this.plotter.dataSource,
          modelSettings = dataSource.modelSettings,
          networkType = modelSettings.network.type,
          periodic = modelSettings.network.periodic;

        if (!(
            (networkType === '2d-lattice' && periodic) ||
            (networkType === 'moore-2d-lattice') ||
            (networkType === 'nd-lattice' && modelSettings.network.dims === 2
              && periodic))) {
          this.unsupportedSettings = true;

          throw 'Unsupported settings for plot';
        }

        var width, height;
        if (networkType === 'nd-lattice') {
          height = width = modelSettings.network.L;
        } else {
          width = modelSettings.network.width;
          height = modelSettings.network.height;
        }

        this.unsupportedSettings = false;

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          width: width,
          height: height,
          periodic: modelSettings.network.periodic,
          distances: this.distances
        };
      },

      addData: function (dataX, dataY, meta) {
        AutoCorrelationDataAggregator.prototype.addData.call(this, dataX,
          dataY, meta);

      },

      getVars: function (from, to) {
        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'site-by-site correlation',
    AutoCorrelationDataAggregator,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimeDataAggregator.call(this, plotter, settings, settings.maxDistance + 1);
      },

      getConsts: function () {
        var dataSource = this.plotter.dataSource;
        if (dataSource.backendObjects.adjacencyLists === undefined) {
          if (!this.requestedAdjacencyLists) {
            dataSource.requestBackendObjects([ 'adjacencyLists' ]);
            this.requestedAdjacencyLists = true;
          }

          throw 'Consts not ready';
        }

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          adjacencyLists: dataSource.backendObjects.adjacencyLists,
          maxDistance: this.settings.maxDistance
        };
      },

      getVars: function (from, to) {
        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'per spin time correlation',
    AutoCorrelationDataAggregator,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimeDataAggregator.call(this, plotter, settings, settings.maxTimeStep + 1);
      },

      getConsts: function () {
        var dataSource = this.plotter.dataSource;

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          maxTimeStep: this.settings.maxTimeStep
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - this.settings.maxTimeStep);

        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          sSum: this.plotter.dataSource.protocol.getAllTransferable('sSum', from, to),
          offset: from
        };
      }
    }
  );

  modules.add('DataAggregator', 
    'per spin flip time correlation',
    AutoCorrelationDataAggregator,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimeDataAggregator.call(this, plotter, settings, settings.maxTimeStep + 1);
      },

      getConsts: function () {
        var dataSource = this.plotter.dataSource;

        return {
          n: this.plotter.dataSource.modelSettings.network.size,
          maxTimeStep: this.settings.maxTimeStep
        };
      },

      getVars: function (from, to) {
        from = Math.max(0, from - this.settings.maxTimeStep - 1);

        return {
          s: this.plotter.dataSource.protocol.getAllTransferable('s', from, to),
          offset: from
        };
      }
    }
  );
}());
