"use strict";
/*
 * The model defined in:
 *
 * S. Bornholdt, Expectation bubbles in a spin model of markets: Intermittency
 * from frustration across scales, Int. J. Mod. Phys. C, Vol. 12, No. 5 (2001)
 * 667-674.
 *
 * The model stores variables:
 *  - The number of agents N.
 *  - The current state which includes two arrays with n elements
 *    filled with 1 and -1:
 *     - s describing the current state of each agent. Its values can be
 *       interpreted as 1 for a buyer and -1 for a seller. The mean value of s
 *       is the global magnetization.
 *     - c desciibing the current strategy of each agent. Its values can be
 *       interpreted as 1 for a antiferromagnetic coupling to the global
 *       magnetization and -1 for ferromagnetic coupling.
 *  - The three parameters alpha, beta and j
 *  - The nearest neighbors of each agents. This means that the implementation
 *    does not restrict to multidimensional lattices at this point.
 */

var BornholdtWithCSpins = (function() {
  var sum = tools.sum,
    fisherYatesShuffle = tools.fisherYatesShuffle,
    createSeries = tools.createSeries;

  function BornholdtWithCSpins(settings) {
    this.changeSettings(settings);
  }

  BornholdtWithCSpins.prototype.changeSettings =
      function (settings) {
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
    this.sSum = sum(this.s);

    this.c = settings.initialState.c;
    this.cSum = sum(this.c);


    //parameters
    this.alpha = settings.parameters.alpha;
    this.beta  = settings.parameters.beta;
    this.j     = settings.parameters.j;


    switch (settings.updateAlgorithms) {
      case 'random-sequential-update' :
        this.step = randomSequentialStep;

        this.series = createSeries(n);
        break;
      case 'random-serial-update' :
        this.step = randomSerialStep;
        break;
      default:
        throw 'Unknown update algorithm.';
    }
  };

  //Returns a randomly choosen new s value for agent i
  BornholdtWithCSpins.prototype.updateSI = function (i) {
    var neighbors = this.adjacencyLists[i],
      s = this.s,
      c = this.c,
      cI = c[i];

    if (this.alpha * s[i] * cI * this.sSum < 0) {
      cI = -cI;
      c[i] = cI;
    }

    var localSum = 0;
    for (var j = 0, len = neighbors.length; j < len; j++) {
      localSum += s[neighbors[j]];
    }

    var p = 1 / (1 + Math.exp(-2 * this.beta * (this.j * localSum
        - this.alpha * cI * this.sSum / this.n)));

    var sINew;
    if (Math.random() < p) {
      sINew = 1;//probability p
    } else {
      sINew = -1;//probality 1-p
    }

    this.sSum += -s[i] + sINew;

    s[i] = sINew;
  };

  /*
   * Functions to replace those in BornholdtWithCSpins
   */

  /*
   * Updates all agents s spins in a random order.
   */
  function randomSequentialStep(varsToSave) {
    var n = this.n,//number of spins
      series = this.series,//All agents indizes. They might be ordered or shuffled from the last step.
      k;//new s spin for agent i

    fisherYatesShuffle(series);//Shuffle the array

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      this.updateSI(series[k]);
    }

    if (varsToSave.cSum) {
      this.cSum = sum(this.c);
    } 
  };

  /*
   * Updates s spins of n random agents.
   */
  function randomSerialStep(varsToSave) {
    var n = this.n,//number of spins
      k;

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      this.updateSI(Math.floor(n * Math.random()));
    }

    if (varsToSave.cSum) {
      this.cSum = sum(this.c);
    } 
  };

  return BornholdtWithCSpins;
})();

spimosimCore.modules.add('Model', 'bornholdtWithCSpins', BornholdtWithCSpins);
