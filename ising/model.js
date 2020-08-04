'use strict';
/*
 * The Ising model implemented in 4 steps.
 */

/*
 * This code works with ajacency lists. Each adjacency list stores all
 * neighbors of a node.
 * .-------------------.
 * |         |         |    adjacencyLists = [
 * | node #0 | node #1 |      [ 1, 2 ],          //neighbors of node #0
 * |         |         |      [ 0, 3 ],          //neighbors of node #1
 * |---------|---------|      [ 0, 3 ],          //neighbors of node #2
 * |         |         |      [ 1, 2 ]           //neighbors of node #3
 * | node #2 | node #3 |    ];
 * |         |         |
 * '---------|---------'
 */
  
/*
 * 1st Step: Define a contructor.
 *
 * The contructor only receives the settings and passes them to the function
 * changeSettings (see step 2nd step).
 */
function IsingModel(settings) {
  this.changeSettings(settings, true); // second argument means this is the
                                       // start or restart of the simulation
};


/*
 * 2st Step: Define a function changeSettings that initializes the state
 * variables (sigma).
 */
IsingModel.prototype.changeSettings = function (settings, restart) {
  // Generate adjacency lists but only if necessary (no reuse from last
  // simulation possible)
  if (
    // no adjacency lists saved -or-
      this.adjacencyLists === undefined || 
    // different network settings than before
      !settings.network.settingsUnchanged
     ) {

    // Generate adjacency lists
    this.adjacencyLists = spimosimNetwork.networkRegister.generateAdjacencyLists(settings.network);
  
    // Number of nodes
    this.n = this.adjacencyLists.length;

  }

  // Save settings
  this.j = settings.parameters.j;
  this.beta = settings.parameters.beta;

  // Recreate sigma on restart
  if (restart) {
    // The state of every agent
    this.sigma = new Int8Array(this.n);
    // Initialize randomly
    for (var i = 0; i < this.n; i++) {
      if (Math.random() < .5) {
        this.sigma[i] = 1;
      } else {
        this.sigma[i] = -1;
      }
    }
  }
  
  // Uncomment to calculate the magnetisation
/*this.magnetisation = 0;
  for (var i = 0; i < this.n; i++) {
    this.magnetisation += this.sigma[i] / this.n;
  }*/

  //console.log(settings); // Log settings to web console
};


/*
 * 3rd Step: Define a function step that changes the state variables.
 * After each step all state variables are saved.
 */
IsingModel.prototype.step = function () { // n times updates a random spins
  for (var k = 0; k < this.n; k++) {
    var i = Math.floor(this.n * Math.random()); // A random agent
    
    // sum up neighbor spins
    var neighbors = this.adjacencyLists[i]; // The neighbors of i
    var sum = 0;
    for (var j = 0; j < neighbors.length; j++) {
      sum += this.sigma[neighbors[j]];
    }
    
    var energy = this.j * sum; // Energy of all connections to spin i

    // New value via heat bath algorithm
    var probability = 1 / (1 + Math.exp(-2 * this.beta * energy));
    if (Math.random() < probability) {
      this.sigma[i] = 1;
    } else {
      this.sigma[i] = -1;
    }
  }
    
  // Uncomment to calculate the magnetisation
  /*
  this.magnetisation = 0;
  for (var i = 0; i < this.n; i++) {
    this.magnetisation += this.sigma[i] / this.n;
  }
  */
};

/*
 * 4rd Step: Save the object IsingModel under the name
 * 'Ising Model'
 */
spimosimCore.modules.add('Model', 'Ising Model', IsingModel);

/*
 * That's it! Everything else is done automatically!
 */
