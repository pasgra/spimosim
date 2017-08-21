'use strict';

var EpidemicsModel = (function() {
  var sum = tools.sum,
    fisherYatesShuffle = tools.fisherYatesShuffle,
    createSeries = tools.createSeries;

  function EpidemicsModel(settings) {
    this.changeSettings(settings, true);
  }

  EpidemicsModel.prototype.changeSettings = function (settings, restart) {
    if (this.adjacencyLists === undefined || !settings.network.settingsUnchanged) {
      this.adjacencyLists = spimosimCore.networkRegister.generateAdjacencyLists(settings.network);
      
      //Get the number of agents
      this.n = this.adjacencyLists.length;
    }
    
    //parameters
    this.alpha = settings.parameters.alpha;
    var differentOpinions = settings.parameters.differentOpinions;

    if (restart) {
      //The state of every agent
      this.s = new Int32Array(this.n);
      for (var i = 0; i < this.n; i++) {
        this.s[i] = Math.floor(Math.random() * differentOpinions);
      }

      //How often an opinion appears
      this.count = new Uint16Array(this.n);
      for (var i = 0; i < this.n; i++) {
        this.count[this.s[i]]++;
      }

      this.known = [];
      var len = (this.n + 7) >> 3;//1 bit agent rounded to next whole byte
      this.zeros = new Uint8Array(len);
      for (var i = 0; i < this.n; i++) {
        this.known[i] = new Uint8Array(len);
      }
      
      for (var i = 0; i < this.n; i++) {
        this.known[this.s[i]][i >> 3] |= (1 << (i % 8));
      }
      
      this.lastOpinion = differentOpinions; 
    }

    switch (settings.updateAlgorithm) {
      case 'random-sequential-update':
        this.step = randomSequentialStep;

        this.series = createSeries(this.n);
        break;
      case 'random-serial-update':
        this.step = randomSerialStep;

        break;
      default:
        throw 'Unknown update algorithm.';
    }
  };

  //Returns the smallest unused integer or j if everything is in use.
  EpidemicsModel.prototype.getUnusedOpinion = function (j) {
    var count = this.count,
      n = this.n;
    var stop = this.lastOpinion;
    this.lastOpinion = (this.lastOpinion + 1) % this.n;
    for (; this.lastOpinion !== stop; this.lastOpinion = (this.lastOpinion + 1) % this.n) {
      if (count[this.lastOpinion] === 0) {
        return this.lastOpinion;
      }
    }
    return j;
  }

  //Returns a randomly choosen new s value for agent i
  EpidemicsModel.prototype.updateSI = function (i) {
    var n = this.n;
    
    var neighbors = this.adjacencyLists[i];
    var opinion = this.s[neighbors[~~(Math.random() * neighbors.length)]];//opinion of a random neighbor agent

    if (!this.hadOpinion(i, opinion)) {
      this.setOpinion(i, opinion);
    }
   
    if (Math.random() < this.alpha) {
      var k = ~~(Math.random() * this.n);//a random agent
      var newOpinion = this.getUnusedOpinion(this.s[k]);
      this.setOpinion(k, newOpinion);
    }
  };

  EpidemicsModel.prototype.setOpinion = function (i, newOpinion) {
    var oldOpinion = this.s[i];
    if (--this.count[oldOpinion] === 0) {
      this.known[oldOpinion].set(this.zeros);
    }
    this.s[i] = newOpinion;
    ++this.count[newOpinion];
    this.known[newOpinion][i >> 3] |= (1 << (i % 8));
  }

  EpidemicsModel.prototype.hadOpinion = function (i, newOpinion) {
    return (this.known[newOpinion][i >> 3] >> (i % 8)) & 1 === 1;
  }

  /*
   * Functions to replace those in EpidemicsModel
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

  return EpidemicsModel;
})();

spimosimCore.modules.add('Model', 'epidemics', EpidemicsModel);//register model as 'epidemics'
