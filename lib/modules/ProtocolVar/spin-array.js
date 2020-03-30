'use strict';

(function () {
  var ObjectProtocolVar = spimosimCore.ObjectProtocolVar;
  
  function SpinArrayProtocolVar(tMin) {
    spimosimCore.TypedArrayProtocolVar.call(this, tMin);
  }
  SpinArrayProtocolVar.prototype = Object.create(spimosimCore.TypedArrayProtocolVar.prototype);

  SpinArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined && !value.toSpins) {
      value = new BoolArray(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  SpinArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return (new BoolArray(obj)).toSpins();
  };

  SpinArrayProtocolVar.prototype.type = 'SpinArray';

  spimosimCore.modules.add('ProtocolVar', {
    name: 'SpinArray',
    files: [ 'lib/modules/ProtocolVar/spin-array.js' ],
    depends: [ 'module:ProtocolVar/Uint8Array' ],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'An array of booleans/spins.',
    date: '2020-03-26'
  }, SpinArrayProtocolVar);
}());
