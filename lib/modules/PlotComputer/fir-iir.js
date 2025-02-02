'use strict';

(function () {
  function FIRIIRPlotComputer(consts) {
    spimosimCore.TimePlotComputer.call(this, consts);
    this.initDone = false;

    this.xs = new Float64Array(consts.b.length);
    this.ys = new Float64Array(consts.a.length);
  }
  FIRIIRPlotComputer.prototype =
    Object.create(spimosimCore.TimePlotComputer.prototype);

  FIRIIRPlotComputer.prototype.init = function (x0) {
    let sumA = 0;
    let sumB = 0;
    for (let i = 1; i < this.consts.a.length; i++) {
      sumA += this.consts.a[i];
    }
    for (let i = 0; i < this.consts.b.length; i++) {
      sumB += this.consts.b[i];
    }
    let gainDC = sumB / (1 - sumA);
    let y0 = gainDC * x0;
    for (let i = 1; i < this.consts.a.length; i++) {
      this.xs[i] = x0;
    }
    for (let i = 0; i < this.consts.b.length; i++) {
      this.ys[i] = y0;
    }
    this.initDone = true;
  }

  FIRIIRPlotComputer.prototype.getYValue = function (t, vars) {
    if (!this.initDone) {
      this.init(vars.dataY[t - vars.offset])
    }
    for (let i = this.consts.b.length - 1; i > 0; i--) {
      this.xs[i] = this.xs[i-1];
    }
    this.xs[0] = vars.dataY[t - vars.offset];
    
    let y = 0;
    for (let i = 1; i < this.consts.a.length; i++) {
      y -= this.consts.a[i] * this.ys[i-1];
    }
    for (let i = 0; i < this.consts.b.length; i++) {
      y += this.consts.b[i] * this.xs[i];
    }
    y /= this.consts.a[0];

    for (let i = this.consts.a.length - 1; i > 0; i--) {
      this.ys[i] = this.ys[i-1];
    }
    this.ys[0] = y;
    return y;
  };

  spimosimCore.modules.add('PlotComputer', {
    name: 'fir-iir',
    files: [ 'lib/modules/PlotComputer/fir-iir.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A plot computer for fir-iir.',
    date: '2020-03-26'
  }, FIRIIRPlotComputer);
}());
