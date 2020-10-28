'use strict';

var IntModel = (function() {
  function IntModel(settings) {
    this.changeSettings(settings);
  }

  IntModel.prototype.changeSettings = function (settings) {
    var sameNetworkSettings = (this.settings !== undefined &&
      spimosimNetwork.networkRegister.sameSettings(this.settings.network, settings.network));

    if (!this.settings || !sameNetworkSettings) {
      this.adjacencyLists = spimosimNetwork.networkRegister
        .generateAdjacencyLists(settings.network);
    }

    this.settings = settings;

    //Get the number of agents from the length of s
    var n = this.adjacencyLists.length;
    this.n = n;

    //The state of every agent
    this.vals = settings.initialState.vals;

    //parameters
    this.beta  = settings.parameters.beta;
    this.numberOfStates = settings.parameters.numberOfStates

    this.energy = tools.sum(this.vals);
  };

  IntModel.prototype.updateSI = function (i) {
    var neighbors = this.adjacencyLists[i];
    var vals = this.vals;

    var localSum = 0;
    for (var j = 0, len = neighbors.length; j < len; j++) {
      localSum += vals[neighbors[j]];
    }

    vals[i] = (vals[i] + ~~(Math.random() / this.beta * (localSum - len * vals[i]) / len) % this.numberOfStates + this.numberOfStates) % this.numberOfStates;
  };

  /*
   * Updates s spins of n random agents.
   */
  IntModel.prototype.step = function () {
    var n = this.n,//number of spins
      k;

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      this.updateSI(Math.floor(n * Math.random()));
    }

    this.energy = tools.sum(this.vals);
  };

  return IntModel;
})();

spimosimCore.modules.add('Model', 'int', IntModel);//register model as 'bornholdt'
