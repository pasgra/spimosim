spimosimCore.modules.add("creator-module-templates", "PlotDisplay", {
  labelText: "PlotDisplay",
  templates: {
    "PlotDisplay": {
      object: 'MyPlotDisplay',
      template: `
function MyPlotDisplay(plotter, settings) {
  spimosimUi.PlotDisplay.call(this, plotter, settings);
}
MyPlotDisplay.prototype = Object.create(spimosimUi.PlotDisplay.prototype);

/*
 * These options are passed to Dygraph. See there
 */
MyPlotDisplay.prototype.getPlotOptions = function () {
  return {
    title: '<Title>',
    xlabel: '<x label>',
    ylabel: '<y label>',
    labels: this.getSeriesLabels(true),
    //drawPoints: true,
    //pointSize: 2,
    //strokeWidth: 0
  };
}

MyPlotDisplay.prototype.seriesLabels = [ 'x label', 'y label' ];

/*
 * Options are 'none', 'x', 'y' and 'xy'
 */
MyPlotDisplay.prototype.defaultLogScaleMode = 'none';

/*
 * Activates the option to fit functions to the plot in the plot menu.
 */
MyPlotDisplay.prototype.fittable = true;

/*
 * Return the main GUI element
 */
MyPlotDisplay.prototype.initGui = function () {
  var box = spimosimUi.PlotDisplay.prototype.initGui.call(this),
  
  /*
  var extraElement = document.createElement('div');
  extraElement.textContent = "customized text";
  box.appendChild(extraElement);
  */
  
  return box;
}

MyPlotDisplay.prototype.description = 'Plot description under plot';
MyPlotDisplay.optionText = 'Plot description in menu';
  
      `
    },
    "TimePlotDisplay": {
      object: 'MyTimePlotDisplay',
      template: `
function MyTimePlotDisplay(plotter, settings) {
  spimosimCore.TimePlotDisplay.call(this, plotter, settings);
}
MyTimePlotDisplay.prototype = Object.create(spimosimCore.TimePlotDisplay.prototype);
      
MyTimePlotDisplay.prototype.getPlotOptions = function () {
  return {
    title: '<title>',
    xlabel: 't',
    labels: [
      'X',
      'Y'
    ]
  };
};

MyPlotDisplay.prototype.description = 'Plot description under plot';
MyPlotDisplay.optionText = 'Plot description in menu':
      `
    },
    "MultiSeriesTimePlotDisplay": {
      object: 'MyMultiSeriesTimePlotDisplay',
      template: `
function MyMultiSeriesTimePlotDisplay(plotter, settings) {
  spimosimCore.MultiSeriesTimePlotDisplay.call(this, plotter, settings);
}
MyMultiSeriesTimePlotDisplay.prototype = Object.create(spimosimCore.MultiSeriesTimePlotDisplay.prototype);
      `
    },
    "AutoCorrelationPlotDisplay": {
      object: 'MyAutoCorrelationPlotDisplay',
      template: `
function MyAutoCorrelationPlotDisplay(plotter, settings) {
  AutoCorrelationPlotDisplay.call(this, plotter, settings);
}
MyAutoCorrelationPlotDisplay.prototype = Object.create(AutoCorrelationPlotDisplay.prototype);
      `
    }
  }
});
