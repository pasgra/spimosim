/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.modules.add('NetworkUi', {
    name: 'nd-lattice',
    files: [ 'lib/modules/NetworkUi/nd-lattice.js' ],
    depends: [ 'module:Video/nd-lattice' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A n-dimensional lattice.',
    date: '2020-03-26'
  }, {//n dimensional lattice with von Neumann neighbor hood
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
      max: Math.floor(Math.log(spimosimNetwork.MAX_NODES) / Math.log(5)),//At least 5 nodes per dimension
      step: 1,
      syncURI: true
    },
    L: {
      labelText: 'L',
      key: 'l',
      min: 1,
      value: 16,
      max: 2000,
      step: 1,
      syncURI: true
    },
    periodic: {
      type: 'checkbox',
      labelText: 'Periodic boundary conditions',
      value: true,
      syncURI: true
    }
  },
  addEventListeners: function (parser) {
    //Shrink the interval of L to prevent the user from using too large
    //networks

    var inputDims = parser.domCache.inputsNetworkParameters.dims,
      inputL = parser.domCache.inputsNetworkParameters.L;
    function changeLMax(e) {
      var dims = parseInt(inputDims.value, 10),
        maxL = Math.floor(Math.pow(spimosimNetwork.MAX_NODES, 1 / dims));//The largest L that is possible while still keeping the network smaller than spimosimNetwork.MAX_NODS

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
