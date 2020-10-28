'use strict';

var ConwaysGameOfLifeModel = (function() {
  var sum = tools.sum;

  function ConwaysGameOfLifeModel(settings) {
    this.changeSettings(settings);
  }

  ConwaysGameOfLifeModel.prototype.changeSettings = function (settings) {
    if (!this.settings ||
        !spimosimNetwork.networkRegister.sameSettings(this.settings.network, settings.network)) {
      this.adjacencyLists = spimosimNetwork.networkRegister
        .generateAdjacencyLists(settings.network);
    }

    this.settings = settings;

    //Get the number of agents from the length of s
    var n = this.adjacencyLists.length;
    this.n = n;

    //The state of every agent
    this.s = settings.initialState.s;
    this.bufferS = new Int8Array(n);

    this.sSum = sum(this.s);
  };

  ConwaysGameOfLifeModel.prototype.getNumberOfSpins = function () {
    return this.n;
  };

  ConwaysGameOfLifeModel.prototype.step = function (varsToSave) {
    var n = this.n,//number of spins
      sNew = this.bufferS;

    //Write the new values for S in SConwaysGameOfLife
    for (var i = 0; i < n; i++) {
      var neighborSpins = 0,
        neighbors = this.adjacencyLists[i],
        len = neighbors.length;
      for (var j = 0; j < len; j++) {
        neighborSpins += this.s[neighbors[j]];
      }

      var upSpins = (neighborSpins + len) / 2;
      if (this.s[i] === 1) {
        if (upSpins === 2 || upSpins === 3) {
          sNew[i] = 1;
        } else {
          sNew[i] = -1;
        }
      } else {
        if (upSpins === 3) {
          sNew[i] = 1;
        } else {
          sNew[i] = -1;
        }
      }
    }

    this.bufferS = this.s;

    this.s = sNew;

    if (varsToSave.sSum) {
      this.sSum = sum(this.s);
    }
  };

  return ConwaysGameOfLifeModel;
})();

spimosimCore.modules.add('Model', 'conwaysGameOfLife', ConwaysGameOfLifeModel);
