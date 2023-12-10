'use strict';

(function () {
  function DiffIntPlotComputer(consts) {
    spimosimCore.TimePlotComputer.call(this, consts);

    if (consts.operation === "diff") {
      this.lastValues = null;
    } else if (consts.operation === "int") {
      this.sums = [];
      for (let i = 0; i < this.consts.repeat; i++) {
        this.sums.push(0);
      }
    }
  }
  DiffIntPlotComputer.prototype =
    Object.create(spimosimCore.TimePlotComputer.prototype);

  DiffIntPlotComputer.prototype.getYValue = function (t, vars) {
    let value = vars.dataY[t - vars.offset];
    if (this.consts.operation === "diff") {
      if (this.lastValues === null) {
        this.lastValues = [];
        for (let i = 0; i < this.consts.repeat; i++) {
          this.lastValues.push(value);
        }
      }
      for (let i = 0; i < this.consts.repeat; i++) {
        let lastValue = this.lastValues[i];
        let newValue = value;
        value = (value - lastValue) / this.consts.timeStep;
        this.lastValues[i] = newValue;
      }
      return value;
    } else if (this.consts.operation === "int") {
      for (let i = 0; i < this.consts.repeat; i++) {
        this.sums[i] += value * this.consts.timeStep;
        value = this.sums[i];
      }
      return value;
    }
  };

  spimosimCore.modules.add('PlotComputer', {
    name: 'diff-int',
    files: [ 'lib/modules/PlotComputer/diff-int.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for diff-int.',
    date: '2020-03-26'
  }, DiffIntPlotComputer);
}());
