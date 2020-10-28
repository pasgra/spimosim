'use strict';

var CustomLocalFieldModel = (function() {
  var sum = tools.sum,
    fisherYatesShuffle = tools.fisherYatesShuffle,
    createSeries = tools.createSeries;

  function CustomLocalFieldModel(settings) {
    this.changeSettings(settings);
  }

  CustomLocalFieldModel.prototype.changeSettings = function (settings) {
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
    this.beta = settings.parameters.beta;
    this.hString = settings.parameters.hString;
    try {
      this.hI = new Function('s', 'l', 'M',
        '"use strict";' +
        tools.LOAD_MATH_IN_SCOPE +
        'return ' + settings.parameters.hString + ';');

      this.hI(1, 0, 0);
    } catch (e) {
      throw {
        invalidParameter: 'hString',
        invalidParameterMsg: e.toString()
      };
    }

    switch (settings.updateAlgorithms) {
      case 'instant-update':
        this.step = instantStep;

        this.bufferS = new Int8Array(n);
        break;
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

    this.sSum = sum(this.s);
  };

  //Calculates the probability of agent i to choose s=1
  CustomLocalFieldModel.prototype.p = function (i) {
    return 1 / (1 + Math.exp(-2 * this.beta * this.h(i)));
  };

  //The LocalField
  CustomLocalFieldModel.prototype.h = function (i) {
    //The coubling to the nearest neighbors
    var s = this.s[i],
      l = this.l(i),
      M = this.sSum / this.n;

    return this.hI(s, l, M);
  };

  CustomLocalFieldModel.prototype.getNumberOfSpins = function () {
    return this.n;
  };

  //Returns a randomly choosen new s value for agent i
  CustomLocalFieldModel.prototype.updateSI = function (i) {
    if (Math.random() < this.p(i)) {
      return 1;
    } else {
      return -1;
    }
  };

  //Mean spin of nearest neighbors
  CustomLocalFieldModel.prototype.l = function (i) {
    var neighborSpins = 0,
      neighbors = this.adjacencyLists[i],
      len = neighbors.length;
    for (var i = 0; i < len; i++) {
      neighborSpins += this.s[neighbors[i]];
    }

    return neighborSpins / len;
  };


  /*
   * Functions to replace those in CustomLocalFieldModel
   */

  /*
   * Updates all agents s spin at once.
   */
  function instantStep(varsToSave) {
    var n = this.n,//number of spins
      sCustomLocalField = this.bufferS;

    //Write the new values for S in SCustomLocalField
    for (var i = 0; i < n; i++) {
      sCustomLocalField[i] = this.updateSI(i);
    }

    //Use the old s array as the next buffers. The content does not matter.
    //This is done so there is no need to create a new array when using the
    //buffer again.
    this.bufferS = this.s;

    this.s = sCustomLocalField;

    //Since s has changed, its sum needs to be updated.
    this.sSum = sum(this.s);
  };

  /*
   * Updates all agents s spins in a random order.
   */
  function randomSequentialStep(varsToSave) {
    var n = this.n,//number of spins
      series = this.series,//All agents indizes. They might be ordered or shuffled from the last step.
      i, k,
      sICustomLocalField;//new s spin for agent i

    fisherYatesShuffle(series);//Shuffle the array

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      //Update agent i
      i = series[k];

      sICustomLocalField = this.updateSI(i);

      this.sSum += -this.s[i] + sICustomLocalField;

      this.s[i] = sICustomLocalField;
    }
  };

  /*
   * Updates s spins of n random agents.
   */
  function randomSerialStep(varsToSave) {
    var n = this.n,//number of spins
      i, k,
      sICustomLocalField;//new s spin for agent i

    //Update in the order defined in series
    for (k = 0; k < n; k++) {
      i = Math.floor(n * Math.random());//A random agent

      sICustomLocalField = this.updateSI(i);

      this.sSum += -this.s[i] + sICustomLocalField;

      this.s[i] = sICustomLocalField;
    }
  };

  return CustomLocalFieldModel;
})();

spimosimCore.modules.add('Model', 'customLocalField', CustomLocalFieldModel);
