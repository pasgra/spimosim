'use strict';

var spimosimNetwork = (function () {
  var networkRegister = spimosimCore.modules.newRegister('Network');

  networkRegister.generateAdjacencyLists = function (settings) {
    return this.get(settings.type || settings.network.type).generateAdjacencyLists(settings);
  }

  networkRegister.extractSettings = function (settings) {
    var networkType = settings.type,
      networkSettings = {
        type: networkType
      },
      parameters = this.get(networkType).parameters;

    for (var i = 0, len = parameters.length; i < len; i++) {
      var name = parameters[i];
      networkSettings[name] = settings[name];
    }

    return networkSettings;
  };

  networkRegister.sameSettings = function (settings1, settings2) {
    if (settings1.type !== settings2.type) {
      return false;
    }

    var networkType = settings1.type;

    var parameters = spimosimCore.modules.get('Network', networkType).parameters;
    for (var i = 0, len = parameters.length; i < len; i++) {
      var name = parameters[i];
      if (settings1[name] !== settings2[name]) {
        return false;
      }
    }

    return true;
  };

  networkRegister.calculateNetworkSize = function (modelSettings) {
    return this.get(modelSettings.network.type || modelSettings.type).calculateNetworkSize(modelSettings);
  };

  /*
   * Calculates indirect neighbors of different orders. Returns an array
   * of arrays of arrays. The index in the first array is the node number.
   * The index in the second array is the order of neighborhood. The third array
   * lists all neighbors of that order,
   */
  function getDistanceLists(adjacencyLists, rMax) {
    var distanceLists = [],
      n = adjacencyLists.length,
      nearestNeighbors,
      distanceMap,
      neighborsForLevel,
      neighborsForLastLevel,
      foundNeighbors = new Int8Array(n),
      j, k;

    if (rMax === undefined) {
      rMax = Infinity;
    }

    for (var i = 0; i < n; i++) {//Calculate distanceMap for every spin
      for (var j = 0; j < n; j++) {
        foundNeighbors[j] = 0;
      }
      foundNeighbors[i] = 1;//You are not your own neighbor

      distanceMap = [];
      distanceLists[i] = distanceMap;

      neighborsForLastLevel = [ i ];

      for (var r = 0; r < rMax; r++) {//Calculate neighbors for every distance
        neighborsForLevel = [];
        for (var indexJ = 0, lenJ = neighborsForLastLevel.length;
            indexJ < lenJ; indexJ++) {//Get neighbors of every spin of last distance
          j = neighborsForLastLevel[indexJ];

          nearestNeighbors = adjacencyLists[j];

          for (var indexK = 0, lenK = nearestNeighbors.length; indexK < lenK;
              indexK++) {
            k = nearestNeighbors[indexK];

            if (!foundNeighbors[k]) {
              neighborsForLevel.push(k);
              foundNeighbors[k] = 1;
            }
          }

        }

        if (neighborsForLevel.length > 0) {
          distanceMap.push(neighborsForLevel);

          neighborsForLastLevel = neighborsForLevel;
        } else {
          //No neighbors of this order means no neighbors of heigher orders.
          break;
        }
      }
    }

    return distanceLists;
  }


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

  spimosimCore.modules.add('SettingsPreprocessor', {
    name: 'Network',
    files: [],
    depends: [ 'lib:spimosimNetworkCore' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A settings preprocessor for the network config.',
    date: '2020-03-26'
  }, function (oldModelSettings, newModelSettings) {
    var settingsUnchanged = true;
    if (oldModelSettings !== undefined && oldModelSettings.network.type === newModelSettings.network.type) {
      for (var name in newModelSettings.network) {
        if (newModelSettings.network.hasOwnProperty(name)) {
          if (oldModelSettings.network[name] !== newModelSettings.network[name]) {
            settingsUnchanged = false;
            break;
          }
        }
      }
    } else {
      settingsUnchanged = false;
    }
    
    newModelSettings.network.size = spimosimCore.modules.get('Network', newModelSettings.network.type).calculateNetworkSize(newModelSettings);
    newModelSettings.network.settingsUnchanged = settingsUnchanged;
    newModelSettings.continuable = (newModelSettings.continuable !== false) && settingsUnchanged;
  });


  return {
    networkRegister: networkRegister,
    getDistanceLists: getDistanceLists,
    removeWrongNeighbors: removeWrongNeighbors,
    MAX_NODES: 16*(1<<16)
  };
}());

