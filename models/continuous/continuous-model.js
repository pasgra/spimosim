'use strict';

var ContinuousModel = (function() {
  var sum = tools.sum,
    fisherYatesShuffle = tools.fisherYatesShuffle,
    createSeries = tools.createSeries;

  function ContinuousModel(settings) {
    this.changeSettings(settings);
  }

  ContinuousModel.prototype.changeSettings = function (settings) {
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
    this.s = settings.initialState.s;

    this.sSum = sum(this.s);

    //parameters
    this.alpha = settings.parameters.alpha;
    this.beta  = settings.parameters.beta;
    this.gamma = settings.parameters.gamma;
    this.j     = settings.parameters.j;

    switch (settings.updateAlgorithms) {
      case 'random-sequential-update':
        this.step = randomSequentialStep;

        this.series = createSeries(n);
        break;
      case 'random-serial-update':
        this.step = randomSerialStep;

        break;
      default:
        throw 'Unknown update algorithm.';
    }
  };

  //Returns a randomly choosen new s value for agent i
  ContinuousModel.prototype.updateSI = function (i) {
    var neighbors = this.adjacencyLists[i];
    var s = this.s;

    var localSum = 0;
    for (var j = 0, len = neighbors.length; j < len; j++) {
      localSum += s[neighbors[j]];
    }

    var p = 1 / (1 + Math.exp(-2 * this.beta * (this.j * localSum
        - this.alpha * Math.sign(this.s[i]) * Math.abs(this.sSum) / this.n)));

    var sINew;
    if (Math.random() < p) {
      sINew = Math.pow(p, this.gamma);//probability p
    } else {
      sINew = -Math.pow(1 - p, this.gamma);//probality 1-p
    }

    this.sSum += -this.s[i] + sINew;

    this.s[i] = sINew;
  };

  /*
   * Functions to replace those in ContinuousModel
   */

  /*
   * Updates all agents s spins in a random order.
   */
  function randomSequentialStep() {
    var n = this.n,//number of spins
      series = this.series,//All agents indizes. They might be ordered or shuffled from the last step.
      k;//new s spin for agent i

    fisherYatesShuffle(series);//Shuffle the array

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      this.updateSI(series[k]);
    }
  };

  /*
   * Updates s spins of n random agents.
   */
  function randomSerialStep() {
    var n = this.n,//number of spins
      k;

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      this.updateSI(Math.floor(n * Math.random()));
    }
  };

  return ContinuousModel;
})();

spimosimCore.modules.add('Model', 'continuous', ContinuousModel);//register model as 'continuous'
