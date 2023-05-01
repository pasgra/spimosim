spimosimCore.modules.add("creator-module-templates", "Network", {
  labelText: "Network",
  description: `SpimosimNetwork uses adjacency lists to represent networks
(https://en.wikipedia.org/wiki/Adjacency_list). A Network module generates
such adjacency lists from a custom set of parameters and also calculates
the number of nodes in the Network.

Hint: You probably want to create a NetworkUi module, too.`,
  templates: {
    "Network": {
      object: 'MyNetwork',
      template: `var MyNetwork = {
  generateAdjacencyLists: function (settings) {
    // see: https://en.wikipedia.org/wiki/Adjacency_list
    // Example: Ignore settings, return a 4 element chain
    return [[1], [0, 2], [1, 3], [2]];
  },
  // Returns the number of nodes in the network
  calculateNetworkSize: function (settings) {
    //Example: A 4 element chain
    return 4;
  }
};

// A list of the names of all custom parameters of the network.
// Example for the case of a lattice: ['width', 'height']
MyNetwork.parameters = [];`
    }
  }
});
