/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  //Shortcuts to functions
  var modules = spimosimCore.modules,
    PlotDisplay = spimosimUi.PlotDisplay,
    MultiSeriesTimePlotDisplay = spimosimUi.MultiSeriesTimePlotDisplay,
    TimePlotDisplay = spimosimUi.TimePlotDisplay,
    AutoCorrelationPlotDisplay = spimosimCore.modules.get("PlotDisplay", "auto correlation"),
    barChartPlotter = AutoCorrelationPlotDisplay.barChartPlotter;

  modules.add('PlotDisplay', 
    'magnetisation',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Magnetisation ⟨s⟩',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ],
        };
      },
      description: 'The average of all spins for each time step'
    },
    {
      optionText: 'Magnetization ⟨s⟩'
    }
  );

  modules.add('PlotDisplay', 
    'abs magnetisation',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Absolute per spin magnetisation |⟨s⟩|',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ],
        };
      },
      description: 'The absolute value of the average of all spins for each time step'
    },
    {
      optionText: 'Absolute per spin magnetization |⟨s⟩|'
    }
  );

  modules.add('PlotDisplay', 
    'cMean',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Mean strategy ⟨c⟩',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ],
        };
      },
      description: 'The average of all c spins for each time step'
    },
    {
      optionText: 'Mean strategy ⟨c⟩'
    }
  );

  modules.add('PlotDisplay', 
    'log returns',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Log returns (Δ⟨s⟩)',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ]
        };
      },
      description: 'The change in the average magnetisation of all spins for two consecutive time steps is interpreted as log returns.'
    },
    {
      optionText: 'Log returns (Δ⟨s⟩)'
    }
  );

  modules.add('PlotDisplay', 
    'abs log returns',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Absolute log returns |Δ⟨s⟩|',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ]
        };
      },
      description: 'The change in the average of all spins for two consecutive time steps is interpreted as log returns.'
    },
    {
      optionText: 'Absolute log returns (|Δ⟨s⟩|)',
    }
  );

  modules.add('PlotDisplay', 
    's flips',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Spin flips',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ]
        };
      },
      description: 'The proportion of spins that just flipped.'
    },
    {
      optionText: 'Flips'
    }
  );

  modules.add('PlotDisplay', 
    'delta cMean',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Strategy change Δ⟨c⟩',
          xlabel: 't',
          labels: [
            'X',
            'Y'
          ]
        };
      },
      description: 'The change in the average of all c spins for two consecutive time steps'
    },
    {
      optionText: 'Strategy change Δ⟨c⟩',
    }
  );

  modules.add('PlotDisplay', 
    'duration',
    PlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Bull/bear market duration',
          xlabel: 'Bull/bear market duration',
          ylabel: 'Count',
          labels: this.getSeriesLabels(true),
          drawPoints: true,
          pointSize: 2,
          strokeWidth: 0
        };
      },

      seriesLabels: [ 'duration', 'count' ],

      defaultLogScaleMode: 'xy',

      fittable: true,

      initGui: function () {
        var box = PlotDisplay.prototype.initGui.call(this),
          divFitResults = document.createElement('div');

        box.appendChild(divFitResults);

        this.domCache.divFitResults = divFitResults;

        return box;
      },
      description: 'Distribution of bull/bear market duration. The duration is defined as the number of consecutive time steps that the magnetisation ⟨s⟩ keeps its sign. Phases of ⟨s⟩=0 end the bull/bear market but are futher ignored.'
    },
    {
      optionText: 'Bull/bear market duration',
    }
  );


  modules.add('PlotDisplay', 
    'neighbors',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Neighbors with the same spin',
          xlabel: 't',
          labels: this.getSeriesLabels(true)
        };
      },

      seriesLabels: [ 'time', 'neighbors' ],
      description: 'Proportion of neighbors that have the same spin averaged over all spins.'
    },
    {
      optionText: 'Number of neighbors with same spin'
    }
  );

  modules.add('PlotDisplay', 
    'coupling ratio',
    TimePlotDisplay,
    {
      getPlotOptions: function () {
        return {
          title: 'Ratio of global and local coupling',
          xlabel: 't',
          labels: this.getSeriesLabels(true)
        };
      },

      seriesLabels: [ 'time', 'neighbors' ],
      description: 'The global absolute value of the α term over the absolute value of the local j term averaged over all spins.'
    },
    {
      optionText: 'Ratio of global and local coupling'
    }
  );

  modules.add('PlotDisplay', 
    'euclid site-by-site correlation',
    AutoCorrelationPlotDisplay,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimePlotDisplay.call(this, plotter, settings, 2);
      },

      getSeriesLabels: function (withFits) {
        this.n = this.dataAggregator.n;
        return AutoCorrelationPlotDisplay.prototype.getSeriesLabels.call(this, withFits);
      },

      getPlotOptionsHistogram: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram.call(this);

        plotOptions.title = 'Site-by-site correlation using Euclidian metric';
        plotOptions.xlabel = 'Distance';
        plotOptions.plotter = null;
        plotOptions.dateWindow = null;

        return plotOptions;
      },

      seriesLabels: [ 'Correlation length' , 'Correlation for distance' ],

      getPlotOptionsStacked: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked.call(this);

        plotOptions.title = 'Site-by-site correlation with Euclidian metric';
        plotOptions.xlabel = 'Distance';

        return plotOptions;
      },

      getPlotOptionsFit: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit.call(this);

        plotOptions.title = 'Correlation length with Euclidian metric';
        plotOptions.xlabel = 'Distance';

        return plotOptions;
      },

      drawModeConfig: {
        'histogram': 'Current site-by-site correlation histogram',
        'stacked': 'Stacked site-by-site correlations',
        'fit': 'Correlation length',
      },
      description: 'Site-by-site correlation of spins. The correlation is calculated for distances x on a 2d lattice. The correlation length ξ is estimated by fitting an exponential function ~exp(-x/ξ)'
    },
    {
      optionText: 'Site-by-site correlation using Euclidian metric'
    }
  );

  modules.add('PlotDisplay', 
    'site-by-site correlation',
    AutoCorrelationPlotDisplay,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimePlotDisplay.call(this, plotter, settings, settings.maxDistance + 1);
      },

      getPlotOptionsHistogram: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram.call(this);

        plotOptions.title = 'Site-by-site correlation';
        plotOptions.xlabel = 'Distance';
        plotOptions.dateWindow =
          [ .5, this.dataAggregator.settings.maxDistance + .5];

        return plotOptions;
      },

      seriesLabels: [ 'Correlation length', 'Correlation for distance' ],

      getPlotOptionsStacked: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked.call(this);

        plotOptions.title = 'Site-by-site correlation';
        plotOptions.xlabel = 'Distance';

        return plotOptions;
      },

      getPlotOptionsFit: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit.call(this);

        plotOptions.title = 'Correlation length';
        plotOptions.xlabel = 'Distance';

        return plotOptions;
      },

      drawModeConfig: {
        'histogram': 'Current site-by-site correlation histogram',
        'stacked': 'Stacked site-by-site correlations',
        'fit': 'Correlation length'
      },
      description: 'Site-by-site correlation of spins. The correlation is calculated for distances x (shortest path on network) with x∈[1, x<sub>max</sub>]. The correlation length ξ is estimated by fitting an exponential function ~exp(-x/ξ)',
    },
    {
      optionText: 'Site-by-site correlation',
      getSettingsConfig: function () {
        return {
          maxDistance: {
            labelText: 'Max distance x<sub>max</sub>',
            inputName: 'maxDistance',
            min: 1,
            value: 16,
            max: 2048,
            step: 1
          }
        };
      }
    }
  );

  modules.add('PlotDisplay', 
    'per spin time correlation',
    AutoCorrelationPlotDisplay,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimePlotDisplay.call(this, plotter, settings, settings.maxTimeStep + 1);
      },

      getPlotOptionsHistogram: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram.call(this);

        plotOptions.title = 'Time correlation';
        plotOptions.xlabel = 'Δt';
        plotOptions.dateWindow =
          [ .5, this.dataAggregator.settings.maxTimeStep + .5];

        return plotOptions;
      },

      seriesLabels: [ 'Correlation time', 'Correlation for Δt =' ],

      getPlotOptionsStacked: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked.call(this);

        plotOptions.title = 'Time correlation';
        plotOptions.xlabel = 'Δt';

        return plotOptions;
      },

      getPlotOptionsFit: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit.call(this);

        plotOptions.title = 'Correlation time';
        plotOptions.xlabel = 'Δt';

        return plotOptions;
      },

      drawModeConfig: {
        'histogram': 'Time correlation histogram',
        'stacked': 'Stacked per spin time correlations',
        'fit': 'Correlation time'
      },
      description: 'Time correlation of spins. The correlation is calculated for time distances Δ with Δ∈[1, Δ<sub>max</sub>] over m or all (much faster calculation) previous time steps. The correlation time τ is estimated by fitting an exponential function ~exp(-Δ/τ)'
    },
    {
      optionText: 'Time correlation',
      getSettingsConfig: function () {
        return {
          maxTimeStep: {
            labelText: 'Max time step',
            inputName: 'maxTimeStep',
            min: 1,
            value: 16,
            max: 100,
            step: 1
          }
        };
      }
    }
  );

  modules.add('PlotDisplay', 
    'per spin flip time correlation',
    AutoCorrelationPlotDisplay,
    {
      customConstructor: function (plotter, settings) {
        MultiSeriesTimePlotDisplay.call(this, plotter, settings, settings.maxTimeStep + 1);
      },

      getPlotOptionsHistogram: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram.call(this);

        plotOptions.title = 'Correlation';
        plotOptions.xlabel = 'Δt';
        plotOptions.dateWindow =
          [ .5, this.dataAggregator.settings.maxTimeStep + .5];

        return plotOptions;
      },

      seriesLabels: [ 'Flip correlation time',
        'Correlation for Δt =' ],

      getPlotOptionsStacked: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked.call(this);

        plotOptions.title = 'Flip time correlation';
        plotOptions.xlabel = 'Δt';

        return plotOptions;
      },

      getPlotOptionsFit: function () {
        var plotOptions =
          AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit.call(this);

        plotOptions.title = 'Flip correlation time';
        plotOptions.xlabel = 'Δt';

        return plotOptions;
      },

      drawModeConfig: {
        'histogram': 'Flip time correlation histogram',
        'stacked': 'Stacked per spin flip time correlations',
        'fit': 'Flip correlation time'
      },
      description: 'Time correlation of spin flips. Flips from up to down und down to up are NOT differentiated. The correlation is calculated for time distances Δ with Δ∈[1, Δ<sub>max</sub>] over m or all (much faster calculation) previous time steps. The correlation time τ is estimated by fitting an exponential function ~exp(-Δ/τ)'
    },
    {
      optionText: 'Flip time correlation',
      getSettingsConfig: function () {
        return {
          maxTimeStep: {
            labelText: 'Max time step Δ<sub>max</sub>',
            inputName: 'maxTimeStep',
            min: 1,
            value: 16,
            max: 100,
            step: 1
          }
        };
      }
    }
  );
}());
