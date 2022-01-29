'use strict';

(function () {
  function cE(name) {
    return document.createElement(name);
  }

  function AutoCorrelationPlotDisplay(plotter, settings) {
    spimosimUi.MultiSeriesTimePlotDisplay.call(this, plotter, settings, settings.maxTimeStep + 1);
  }
  AutoCorrelationPlotDisplay.prototype = Object.create(spimosimUi.MultiSeriesTimePlotDisplay.prototype);

  AutoCorrelationPlotDisplay.optionText = 'Auto correlation / correlation time';

  AutoCorrelationPlotDisplay.prototype.description =
    'Auto correlation of y(t) and y(t - Δ) with Δ∈[1, Δ<sub>max</sub>]. The correlation is calculated for each Δ and averaged over m or all (much faster calculation) previous time steps. The correlation time τ is estimated by fitting an exponential function ~exp(-Δ/τ)';

  AutoCorrelationPlotDisplay.getSettingsConfig = function () {
    return {
      absValues: {
        type: 'checkbox',
        value: false,
        name: 'absValues',
        labelText: 'Use absolute values'
      },
      maxTimeStep: {
        min: 0,
        max: 1000,
        value: 16,
        step: 1,
        name: 'maxTimeStep',
        labelText: 'Time steps Δ<sub>max</sub>'
      },
      perStepMode : {
        labelText: 'Use only recent data for every step.',
        value: false,
        type: 'checkbox',
        name: 'perStepName',
      },
      intervalLength: {
        min: 0,
        max: 1000,
        value: 50,
        step: 1,
        parent: 'perStepMode',
        name: 'intervalLength',
        labelText: 'Interval length m'
      }
    };
  };

  AutoCorrelationPlotDisplay.prototype.drawModeConfig = {
    'histogram': 'Current auto correlation histogram',
    'stacked': 'Stacked auto correlations',
    'fit': 'Correlation Time'
  };

  AutoCorrelationPlotDisplay.prototype.downloadCurrentCsv = function () {
    var t = this.intializer.clock.getT();
    var csvString = this.dataAggregator.getStepCsv(t),
      blob = new Blob([ csvString ], {type: 'text/csv'}),
      url = URL.createObjectURL(blob);//Convert blob to URL

    graphicTools.startDownload(url, this.getCsvFileName());
  };


  AutoCorrelationPlotDisplay.prototype.initGui = function () {
    var box = spimosimUi.MultiSeriesTimePlotDisplay.prototype.initGui.call(this),
      plot = this;


    var buttonDownloadCurrentCsv = cE('button');
    buttonDownloadCurrentCsv.className = 'plot-download-csv';
    buttonDownloadCurrentCsv.textContent = 'Download CSV for this step';
    this.domCache.divMenuButtons.appendChild(buttonDownloadCurrentCsv);

    this.attachEventListener({
      dispatcher: buttonDownloadCurrentCsv,
      type: 'click',
      callback: function () {
        plot.downloadCurrentCsv();
      }
    });

    var divDrawModes = cE('div');

    function boundChangeDrawMode(e) {
      plot.closeMenu();
      plot.changeDrawMode(e.target.value);
    }

    var drawModeInputs = {},
      drawModeInputDivs = {};

    var config = this.drawModeConfig;
    for (var type in config) {
      if (config.hasOwnProperty(type)) {
        var tmp = graphicTools.createLabeledRadioButton('draw-mode', 'drawMode', type, config[type]),
          surroundingDiv = tmp.surroundingDiv,
          radioButton = tmp.radioButton;

        divDrawModes.appendChild(surroundingDiv);

        drawModeInputs[type] = radioButton;
        drawModeInputDivs[type] = surroundingDiv;

        this.attachEventListener({
          dispatcher: radioButton,
          type: 'change',
          callback: boundChangeDrawMode
        });
      }
    }

    var drawMode = 'histogram';

    this.domCache.drawModeInputs = drawModeInputs;
    this.domCache.drawModeInputDivs = drawModeInputDivs;
    this.domCache.menu.insertBefore(divDrawModes, this.domCache.liveOptions);
    this.domCache.buttonDownloadCurrentCsv = buttonDownloadCurrentCsv;

    drawModeInputs[drawMode].checked = true;
    this.changeDrawMode(drawMode);

    return box;
  };

  AutoCorrelationPlotDisplay.barChartPlotter = function (e) {
    var ctx = e.drawingContext,
      points = e.points,
      yBottom = e.dygraph.toDomYCoord(0),
      xUnitWidth = e.dygraph.toDomXCoord(1) - e.dygraph.toDomXCoord(0);

    ctx.fillStyle = e.color;
    // Do the actual plotting.
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var center_x = p.canvasx;  // center of the bar

      ctx.globalAlpha = .5;
      ctx.fillRect(p.canvasx - .5 * xUnitWidth, p.canvasy,
          xUnitWidth, yBottom - p.canvasy);
      ctx.globalAlpha = 1;

      ctx.strokeRect(p.canvasx - .5 * xUnitWidth, p.canvasy,
          xUnitWidth, yBottom - p.canvasy);
    }
  };

  AutoCorrelationPlotDisplay.prototype.changeDrawMode = function (drawMode) {
    this.drawMode = drawMode;
    this.destroyGraph();
    this.drawState.initialized = false;
  }

  AutoCorrelationPlotDisplay.prototype.makePlotOld = function () {
    if (this.drawMode === 'histogram') {
      this.domCache.drawModeInputs.stacked.click();
    }
    this.domCache.drawModeInputDivs.histogram.remove();

    spimosimUi.MultiSeriesTimePlotDisplay.prototype.makePlotOld.call(this);
  }

  AutoCorrelationPlotDisplay.prototype.getPlotOptions = function () {
    var options;
    switch (this.drawMode) {
      case 'histogram':
        options = this.getPlotOptionsHistogram();
        options.clickCallback = null;
        break;
      case 'stacked':
        options = this.getPlotOptionsStacked();
        options.clickCallback = function (e, t) {
          plot.plotter.initializer.clock.setT(t);
        };
        break;
      case 'fit':
        options = this.getPlotOptionsFit();
        options.clickCallback = function (e, t) {
          plot.plotter.initializer.clock.setT(t);
        };
        break;
    }

    return options;
  };

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsHistogram = function () {
    return {
      title: 'Auto correlation',
      digitsAfterDecimal: 10,
      plotter: AutoCorrelationPlotDisplay.barChartPlotter,
      color: this.plotter.getColor(),
      dateWindow: [ .5, this.dataAggregator.settings.maxTimeStep + .5 ],
      axes: {
        x: {
          drawGrid: false
        }
      },
      labels: [ 'Δt', 'correlation' ],
      xlabel: 'Δt',
      clickCallback: null
    };
  };

  AutoCorrelationPlotDisplay.prototype.seriesLabels = [
    'Correlation time', 'Correlation for Δt ='
  ];

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsStacked = function () {
    var labels = this.getSeriesLabels();
    labels[0] = 'Δt';

    return {
      title: 'Auto correlation',
      digitsAfterDecimal: 10,
      xlabel: 't',
      labels: labels,
      fillGraph: true,
      strokeWidth: .1,
      fillAlpha: 1 - Math.pow(.3, 1 / this.n),
    };
  }

  AutoCorrelationPlotDisplay.prototype.getPlotOptionsFit = function () {
    return {
      title: 'Correlation time',
      digitsAfterDecimal: 10,
      xlabel: 't',
      labels: [ 't', 'correlation time'],
    };
  }

  AutoCorrelationPlotDisplay.prototype.getData = function (tStart, tEnd) {
    if (this.drawMode === 'histogram') {
      return this.dataAggregator.getSingleStepData(this.plotter.initializer.clock.getT());
    }

    if (tStart === undefined && tEnd === undefined) {
      var interval = this.getIntervalToShow();
    } else {
      interval = [ tStart, tEnd ];
    }
    switch (this.drawMode) {
      case 'stacked':
        return this.dataAggregator.getData(interval[0], interval[1]);
      case 'fit':
        return this.dataAggregator.getDataFit(interval[0], interval[1]);
    }
  };

  spimosimUi.TimePlotDisplay.deducedPlotTypeRegister.add("auto correlation", AutoCorrelationPlotDisplay);

  spimosimCore.modules.add('PlotDisplay', {
    name: 'auto correlation',
    files: [ 'lib/modules/PlotDisplay/auto-correlation.js' ],
    depends: [ 'module:DataAggregator/auto correlation' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot display.',
    date: '2020-03-26'
  }, AutoCorrelationPlotDisplay);
})();
