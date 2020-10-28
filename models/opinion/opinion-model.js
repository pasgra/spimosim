'use strict';

var OpinionModel = (function() {
  var sum = tools.sum,
    fisherYatesShuffle = tools.fisherYatesShuffle,
    createSeries = tools.createSeries;

  function OpinionModel(settings) {
    this.changeSettings(settings);
  }

  OpinionModel.prototype.changeSettings = function (settings) {
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

    //parameters
    this.alpha = settings.parameters.alpha;
    this.mf = settings.parameters.mf;
    this.temp0 = settings.parameters.temp0;
    this.tempMin = settings.parameters.tempMin;
    this.tempMax = settings.parameters.tempMax;

    this.sSum = sum(this.s);

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

  //Calculates the probability of agent i to choose s=1
  OpinionModel.prototype.p = function (i) {
    var upSpinNeighbors = 0,
      neighbors = this.adjacencyLists[i],
      sI = this.s[i];

    for (var j = 0, len = neighbors.length; j < len; j++) {
      if (this.s[neighbors[j]] === 1) {
        upSpinNeighbors++;
      }
    }

    switch (upSpinNeighbors) {
      case 0:
        return 0;
      case 1:
        return 1 / (1 + Math.exp(4 / this.t()));
      case 2:
        return .5;
      case 3:
        return 1 / (1 + Math.exp(-4 / this.t()));
      case 4:
        return 1;
    }
  };

  OpinionModel.prototype.t = function () {
    var sMean = Math.abs(this.sSum / this.n);
    if (sMean < this.mf) {
      return this.temp0 * (this.tempMin + this.alpha * sMean);
    } else {
      return this.temp0 * this.tempMax;
    }
  };

  OpinionModel.prototype.getNumberOfSpins = function () {
    return this.n;
  };

  //Returns a randomly choosen new s value for agent i
  OpinionModel.prototype.updateSI = function (i) {
    if (Math.random() < this.p(i)) {
      return 1;//probability p
    } else {
      return -1;//probality 1-p
    }
  };

  /*
   * Updates all agents S spin in a random order. C does not get updated.
   */
  OpinionModel.prototype.step = function () {
    var n = this.n;

    //All agents indizes. They might be ordered or shuffled from the last step.
    var series = this.series;
    //Shuffle the array
    fisherYatesShuffle(series);

    //Update in random order
    for (var k = 0; k < n; k++) {
      //Update agent i
      var i = series[k];

      var sINew = this.updateSI(i);

      this.sSum += -this.s[i] + sINew;

      this.s[i] = sINew;
    }
  };

  /*
   * Functions to replace those in OpinionModel
   */

  /*
   * Updates all agents s spins in a random order.
   */
  function randomSequentialStep() {
    var n = this.n,//number of spins
      series = this.series,//All agents indizes. They might be ordered or shuffled from the last step.
      i, k,
      sINew;//new s spin for agent i

    fisherYatesShuffle(series);//Shuffle the array

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      //Update agent i
      i = series[k];

      sINew = this.updateSI(i);

      this.sSum += -this.s[i] + sINew;

      this.s[i] = sINew;
    }
  };

  /*
   * Updates s spins of n random agents.
   */
  function randomSerialStep() {
    var n = this.n,//number of spins
      i, k,
      sINew;//new s spin for agent i

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      i = Math.floor(n * Math.random());//A random agent

      sINew = this.updateSI(i);

      this.sSum += -this.s[i] + sINew;

      this.s[i] = sINew;
    }
  };

  spimosimCore.modules.add('Model', 'opinion', OpinionModel);
})();
