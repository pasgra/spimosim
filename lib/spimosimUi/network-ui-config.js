/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

/*
* Defines the input elements of the predefined network types of spimosimUi.
*/

(function () {
  var MAX_NODES = spimosimUi.MAX_NODES || 16*(1<<16),
    modules = spimosimCore.modules;

  modules.add('NetworkUi', 'random undirected', {
    labelText: 'Random undirected network',//The shown label text
    getVideoSettings: function (modelSettings) {
      return {
        type: 'network',
      };
    },
    //Config for inputs created video graphicTools.createSetting. See there for
    //documentation.
    //Their parsed values will be passed to the simulation to define the network
    parameters: {
      n: {
        labelText: 'n',
        key: 'n',//Use key 'n' as a shortcut to increase/decrease the value
        min: 1,
        value: 128,
        max: 1024,
        step: 1,
        logScale: true
      },
      p: {
        labelText: 'Proportion of egdes created',
        value: '.1',
        min: 0.0000001,
        max: 1,
        step: 'any',
        key: 'p',
        logScale: true
      }
    }
  });

  modules.add('NetworkUi', '1d-lattice', {
    labelText: '1D lattice',//The shown label text
    getVideoSettings: function (modelSettings) {
      return {
        type: '1d-lattice',
        width: modelSettings.network.width
      };
    },
    //Config for inputs created video graphicTools.createSetting. See there for
    //documentation.
    //Their parsed values will be passed to the simulation to define the network
    parameters: {
      n: {
        labelText: 'n',
        key: 'n',//Use key 'n' as a shortcut to increase/decrease the value
        min: 1,
        value: 128,
        max: Math.sqrt(MAX_NODES),
        step: 1
      },
      periodic: {
        type: 'checkbox',
        labelText: 'Periodic boundary conditions',
        value: true,
      }
    }
  });

  modules.add('NetworkUi', '2d-lattice', {//2d lattice with von Neumann neighbor hood
    labelText: '2D lattice',
    getVideoSettings: function (modelSettings) {
      return {
        type: '2d-lattice',
        width: modelSettings.network.width,
        height: modelSettings.network.height
      };
    },
    parameters: {
      width: {
        labelText: 'width',
        key: 'w',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      },
      height: {
        labelText: 'height',
        key: 'h',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      },
      periodic: {
        type: 'checkbox',
        labelText: 'Periodic boundary conditions',
        value: true,
      }
    }
  });
  
  modules.add('NetworkUi', 'spimosim', {
    labelText: 'SpiMoSim!',
    getVideoSettings: function (modelSettings) {
      return {
        type: '2d-lattice',
        width: 200,
        height: 30
      };
    }
  });

  modules.add('NetworkUi', 'moore-2d-lattice', {
    labelText: '2D lattice with Moore neighborhood',
    getVideoSettings: function (modelSettings) {
      return {
        type: '2d-lattice',
        width: modelSettings.network.width,
        height: modelSettings.network.height
      };
    },
    parameters: {
      width: {
        labelText: 'width',
        key: 'w',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      },
      height: {
        labelText: 'height',
        key: 'w',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      }
    }
  });

  modules.add('NetworkUi', 'quadratic', {
    labelText: 'L×L lattice',
    getVideoSettings: function (modelSettings) {
      return {
        type: '2d-lattice',
        width: modelSettings.network.L,
        height: modelSettings.network.L
      };
    },
    parameters: {
      L: {
        labelText: 'L',
        key: 'l',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      }
    }
  });

  modules.add('NetworkUi', 'moore-quadratic', {
    labelText: 'L×L lattice with Moore neighborhood',
    getVideoSettings: function (modelSettings) {
      return {
        type: '2d-lattice',
        width: modelSettings.network.L,
        height: modelSettings.network.L
      };
    },
    parameters: {
      L: {
        labelText: 'L',
        key: 'l',
        min: 1,
        value: 32,
        max: Math.sqrt(MAX_NODES),
        step: 1
      }
    }
  });

  modules.add('NetworkUi', 'nd-lattice', {//n dimensional lattice with von Neumann neighbor hood
    labelText: 'n dimensional lattice',
    getVideoSettings: function (modelSettings) {
      return {
        type: 'nd-lattice',
        L: modelSettings.network.L,
        dims: modelSettings.network.dims
      };
    },
    parameters: {
      dims: {
        labelText: 'dims',
        key: 'd',
        min: 2,
        value: 3,
        max: Math.floor(Math.log(MAX_NODES) / Math.log(5)),//At least 5 nodes per dimension
        step: 1
      },
      L: {
        labelText: 'L',
        key: 'l',
        min: 1,
        value: 16,
        max: 2000,
        step: 1
      },
      periodic: {
        type: 'checkbox',
        labelText: 'Periodic boundary conditions',
        value: true,
      }
    },
    addEventListeners: function (parser) {
      //Shrink the interval of L to prevent the user from using too large
      //networks

      var inputDims = parser.domCache.inputsNetworkParameters.dims,
        inputL = parser.domCache.inputsNetworkParameters.L;
      function changeLMax(e) {
        var dims = parseInt(inputDims.value, 10),
          maxL = Math.floor(Math.pow(MAX_NODES, 1 / dims));//The largest L that is possible while still keeping the network smaller than MAX_NODS

        if (parseInt(inputL.value, 10) > maxL) {//The value of L is too large: decrease
          inputL.value = maxL;
          inputL.dispatchEvent('change');
        }

        inputL.max = maxL;
      }

      inputDims.addEventListener('change', changeLMax);
      changeLMax();
    }
  });

  modules.add('NetworkUi', 'barabasi-albert', {
    labelText: 'Barabási–Albert',
    getVideoSettings: function (modelSettings) {
      return {
        type: 'network'
      };
    },
    parameters: {
      m: {
        labelText: 'm',
        key: 'm',
        min: 1,
        value: 2,
        max: 50,
        step: 1
      },
      n: {
        labelText: 'n',
        key: 'n',
        min: 1,
        value: 32,
        max: 1024,
        step: 1
      }
    }
  });

  modules.add('NetworkUi', 'dynamic-directed', {
    labelText: 'Dynamic directed network',
    getVideoSettings: function (modelSettings) {
      return {
        type: 'dynamic directed network'
      };
    },
    parameters: {
      n: {
        labelText: 'n',
        key: 'n',
        min: 1,
        value: 32,
        max: 1024,
        step: 1
      }
    }
  });
}());
