/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var modules = spimosimCore.modules;

  /*
   * Removes wrong entries in neighbors of agent i
   */
  function removeWrongNeighbors(i, neighbors) {
    return neighbors.filter(function(item, position) {
      return (
          //Is true the first time a neighbor is mentioned
          position === neighbors.indexOf(item) &&
          //You are not your own neighbor
          item !== i
      );
    });
  }

  modules.add('Network', 'random undirected', {
    parameters: [ 'n', 'p' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = [],
        n = settings.n,
        p = settings.p,
        edgesAvailable = n * (n - 1) / 2,
        edgesToAdd = Math.floor(p * edgesAvailable),
        currentP = edgesToAdd / edgesAvailable;

      for (var i = 0; i < n; i++) {
        adjacencyLists[i] = [];
      }
      
      for (var i = 0; i < n; i++) {
        for (var j = i; j < n; j++) {
          --edgesAvailable;
          if (Math.random() < currentP) {
            adjacencyLists[i].push(j);
            adjacencyLists[j].push(i);
            --edgesToAdd;
            currentP = edgesToAdd / edgesAvailable;
          }
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return settings.n;
    }
  });

  modules.add('Network', '1d-lattice', {
    parameters: [ 'n', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = [],
        n = settings.n,
        periodic = settings.periodic,
        neighbors, i;

      if (periodic) {
        //Periodic boundary conditions. The first and the last agent are neighbors
        for (i = 0; i < n; i++) {
          neighbors = [
            (n + i - 1) % n,//the left neighbor
            (i + 1) % n//the right neighbor
          ];

          //The periodic boundary conditions can cause the agent to be its own
          //neighbor and the left and right neighbor or the the lower and upper
          //neighbor to be the same agent
          neighbors = removeWrongNeighbors(i, neighbors);

          adjacencyLists[i] = neighbors;
        }
      } else {
        for (i = 0; i < n; i++) {
          neighbors = [];
          if (i !== 0) {
            neighbors.push(i - 1);//the left neighbor
          }
          if (i !== n - 1) {
            neighbors.push(i + 1);//the right neighbor
          }

          adjacencyLists[i] = neighbors;
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return settings.n;
    }
  });

  modules.add('Network', '2d-lattice', {//2d lattice with von Neumann neighbor hood
    parameters: [ 'width', 'height', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var width = settings.width,
        height = settings.height,
        periodic = settings.periodic,
        adjacencyLists = [],
        n = width * height,
        x, y, neighbors, i;

      if (periodic) {
        //periodic boundary conditions
        for (i = 0; i < n; i++) {
          //The index i in 1D represents the index (x,y) in 1D
          //i = x + y*width
          x = i % width;
          y = Math.floor(i / width);
          neighbors = [
            (width + x - 1) % width + y * width,//the left neighbor
            (x + 1) % width + y * width,//the right neighbor
            x + (height + y - 1) % height * width,//the upper neighbor
            x + (y + 1) % height * width,//the lower neighbor
          ];

          //The periodic boundary conditions can cause the agent to be its own
          //neighbor and the left and right neighbor or the the lower and upper
          //neighbor to be the same agent
          neighbors = removeWrongNeighbors(i, neighbors);

          adjacencyLists[i] = neighbors;
        }
      } else {
        for (i = 0; i < n; i++) {
          neighbors = [];
          if (i % width !== 0) {
            neighbors.push(i - 1);//the left neighbor
          }
          if ((i + 1) % width !== 0) {
            neighbors.push(i + 1);//the right neighbor
          }
          if (i - width >= 0) {
            neighbors.push(i - width);//the upper neighbor
          }
          if (i + width < n) {
            neighbors.push(i + width);//the upper neighbor
          }

          adjacencyLists[i] = neighbors;
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return settings.width * settings.height;
    }
  });
  
  modules.add('Network', 'spimosim', {
    parameters: [ 'width', 'height' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = spimosimCore.modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: 200,
        height: 30,
        periodic: true
      });

      var n = 6000;
      var binaryString = atob('cBcAAP///////////////////////////////////////////////////////////////////wD8AAA/AAbw/wP4D4D/D8APgAH8/wAe+H8A+AAAPAAG4P8B+AMA/weAD4AB+H8AHvw/MPAHB/yBP+D/Af8BAvwDA3/gD/h/wD/8H3zwBx/4wT/g/wH/wB/8wQd/8A/4f8A//B/+8Ac/+ME/wP+Af+A/+OEPf/AP8D/gP/wf/vAHf/DBP8D/gH/wf/DhD3/wD/A/4D/8H/7/B3/wwT+Cf4B/8H/w4f9/8I/gH+A//B/+/wd/8ME/gn+EP/h/8OH/f/CP4B/hP/wf/P8Hf/DBP4J/hD/4/+DB/3/wj+Af4T/8H/j/B3/wwT8GP4Q/+P/ggf9/8I/BD+E//D/g/wd/+ME/Bj+GP/j/4AP+f/CPwY/hP/w/gP8HP/jBPwY/hj/4/+AD+H/wj8GP4T/8fwD+Bx/4wT8OHoY/+P/gB+B/8I+Dh+E//P8B+AcB/ME/Dh6HP/j/4B+Af/CPg8fhP/z/B/AHAP7BPx4ehz/4/+B/AH/wj4fH4T/8/x/wB4D/wT8eDIc/+P/g/wF/8I8Hw+E//v9/4Af//8E/HoyHP/j/4P8HfvCPB+Phf/7//+AH///BPz6Mhz/4/+D/D37wjw/j4X/+///hB///wT8+gIc/+H/w/x9+8I8P4OH//x//4Qf//8E/PsCHf/B/8PEffvCPD/Dh//8P/+EH///BP37Ah3/wf/DwH37wjx/w4f//D/7gB///wT9+4Id/4D/44A9+8I8f+OE//A/+8Af//8E/fOAH/8Af/OAPf/APH/jBH/gfOPAH/v+BP/zgA/8BAvyBA3/gDz/4wB/4HwD4APA/AAbw8AD4AwD/AYAPgAE8PAAe+H8A/gDwPwAG8PEA+A+A/wfgD4ABfDwAPvz//////////////////////////////////////////////////////////////////w==');

      var len = binaryString.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++)        {
        bytes[i] = binaryString.charCodeAt(i);
      }
      var pixels = new BoolArray(bytes.buffer).toSpins();

      for (var i = 0; i < n; i++) {
        var isInText = pixels[i] !== 1,
          neighbors = adjacencyLists[i];
        
        for (var j = 0, len = neighbors.length; j < len; j++) {
          if ((pixels[neighbors[j]] !== 1) !== isInText) {
            neighbors.splice(j, 1);
            --j;
            --len;
          }
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return 6000;
    },
    fromText: function (x, y, width, height, text, font) {
      var adjacencyLists = spimosimCore.modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: width,
        height: height,
        periodic: true
      });
      var n = width * height;
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.font = font;
      ctx.fillText('SPIMOSIM!', x, y);
      var pixels = new Uint32Array(ctx.getImageData(0, 0, width, height).data.buffer);
      for (var i; i < n; i++) {
        pixels[i]++;
      }
      return btoa(String.fromCharCode.apply(null, new Uint8Array(new BoolArray(pixels).buffer)));
    }
  });

  modules.add('Network', 'moore-2d-lattice', {
    parameters: [ 'width', 'height' ],
    generateAdjacencyLists: function (settings) {
      var width = settings.width,
        height = settings.height,
        adjacencyLists = [],
        n = width * height,
        x, y, neighbors, i;

      for (i = 0; i < n; i++) {
        //The index i in 1D represents the index (x,y) in 1D
        //i = x + y*width
        x = i % width;
        y = Math.floor(i / width);
        neighbors = [
          (width + x - 1) % width + (height + y - 1) % height * width,//the upper left neighbor
          (width + x - 1) % width + y * width,//the left neighbor
          (width + x - 1) % width + (y + 1) % height * width,//the lower left neighbor
          x + (y + 1) % height * width,//the lower neighbor
          (x + 1) % width + (y + 1) % height * width,//the lower right neighbor
          (x + 1) % width + y * width,//the right neighbor
          (x + 1) % width + (height + y -  1) % height * width,//the upper right neighbor
          x + (height + y - 1) % height * width,//the upper neighbor
        ];

        //The periodic boundary conditions can cause the agent to be its own
        //neighbor and the left and right neighbor or the the lower and upper
        //neighbor to be the same agent
        neighbors = removeWrongNeighbors(i, neighbors);

        adjacencyLists[i] = neighbors;
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return settings.width * settings.height;
    }
  });

  modules.add('Network', 'quadratic', {//quadratic 2d lattice with von Neumann neighbor hood
    parameters: [ 'L' ],
    generateAdjacencyLists: function (settings) {
      return modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: settings.L,
        height: settings.L,
        periodic: true
      })
    },
    calculateNetworkSize: function (settings) {
      return settings.L * settings.L;
    }
  });

  modules.add('Network', 'moore-quadratic', {//quadratic 2d lattice with Moore neighbor hood
    parameters: [ 'L' ],
    generateAdjacencyLists: function (settings) {
      return modules.get('Network', 'moore-2d-lattice').generateAdjacencyLists({
        width: settings.L,
        height: settings.L
      })
    },
    calculateNetworkSize: function (settings) {
      return settings.L * settings.L;
    }
  });

  modules.add('Network', 'nd-lattice', {//n dimensional lattice with von Neumann neighbor hood
    parameters: [ 'dims', 'L', 'periodic' ],
    generateAdjacencyLists: function (settings) {
      var dims = settings.dims,
        L = settings.L,
        periodic = settings.periodic,
        n = Math.pow(L, dims),
        adjacencyLists = [],
        neighbors,
        L_k = 1,
        k, i;

      for (i = 0; i < n; i++) {
        adjacencyLists[i] = [];
      }

      for (k = 0; k < dims; k++) {
        for (i = 0; i < n; i++) {
          if ((~~(i / L_k)) % L === 0) {
            if (periodic) {
              adjacencyLists[i].push(i - L_k + L_k * L);
            }
          } else {
            adjacencyLists[i].push(i - L_k);
          }
          if ((~~(i / L_k + 1)) % L === 0) {
            if (periodic) {
              adjacencyLists[i].push(i + L_k - L_k * L);
            }
          } else {
            adjacencyLists[i].push(i + L_k);
          }
        }

        L_k *= L;
      }

      for (var i = 0; i < n; i++) {
        adjacencyLists[i] = removeWrongNeighbors(i, adjacencyLists[i]);
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {
      return Math.pow(settings.L, settings.dims);
    }
  });

  modules.add('Network', 'barabasi-albert', {
    parameters: [ 'n', 'm' ],
    calculateNetworkSize: function (settings) {
      return settings.n;
    },
    generateAdjacencyLists: function (settings) {
      var n = settings.n,
        m = settings.m,
        egdeCount = 0,
        neighbors,
        adjacencyLists = [],
        list = new Uint32Array(2 * (n - 1) * m),//The list will contains every node one time for every of its egdes
        len = 0;//The number of used entries of list.

      //Create a complete network of m nodes.
      for (var i = 0; i < m; i++) {
        neighbors = [];
        for (var j = 0; j < i; j++) {
          neighbors.push(j);
          list[len++] = j;//save that node j to list because it got a new egde
        }
        for (var j = i + 1; j < m; j++) {
          neighbors.push(j);
          list[len++] = j;//save that node j to list because it got a new egde
        }

        adjacencyLists.push(neighbors);
      }

      //Create n - m new nodes with m edges.
      for (var i = m; i < n; i++) {
        neighbors = [];

        for (var k = 0; k < m;) {
          var j = list[Math.floor(Math.random() * len)];//Select a node with an probability proportional to its existing nodes.


          if (j !== i && neighbors.indexOf(j) === -1) {
            neighbors.push(j);
            adjacencyLists[j].push(i);

            list[len++] = i;//save that node i to list because it got a new egde
            list[len++] = j;//save that node j to list because it got a new egde

            k++;//move on to next node
          }
        }

        adjacencyLists.push(neighbors);
      }

      return adjacencyLists;
    }
  });

  modules.add('Network', 'dynamic-directed', {
    parameters: [ 'n' ],
    calculateNetworkSize: function (settings) {
      return settings.n;
    },
    generateAdjacencyLists: function (settings) {
      var n = settings.n,
        adjacencyLists = [];

      for (var i = 0; i < n; i++) {
        adjacencyLists.push([]);
      }

      if (settings.connections !== undefined) {
        var c = settings.connections;
        for (var i = 0; i < n; i++) {
          var neighbors = adjacencyLists[i];
          for (var j = 0; j < n; j++) {
            if (c[j * n + i] !== 0) {
              neighbors.push(j);
            }
          }
        }
      }

      return adjacencyLists;
    }
  });
}());
