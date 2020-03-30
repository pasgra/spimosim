/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.TypedArrayProtocolVar = (function () {
  var ObjectProtocolVar = spimosimCore.ObjectProtocolVar;

  function TypedArrayProtocolVar(tMin) {
    ObjectProtocolVar.call(this, tMin);
  }
  TypedArrayProtocolVar.prototype = Object.create(ObjectProtocolVar.prototype);

  TypedArrayProtocolVar.prototype.getBytesPerStep = function () {
    if (this.data[0] === undefined) {
      return 10;
    } else {
      return this.data[0].byteLength;
    }
  };

  TypedArrayProtocolVar.prototype.getTransferable = function (t) {
    if (t < this.tMin) {
      return undefined;
    } else {
      var value = this.data[t - this.tMin];

      if (value !== undefined) {
        value = value.buffer;
      }

      return value;
    }
  };

  TypedArrayProtocolVar.prototype.makeTransferable = function () {
    var transferables = [];
    for (var i = 0, len = this.data.length; i < len; i++) {
      if (this.data[i] !== undefined) {
        this.data[i] = this.data[i].buffer;
        transferables.push(this.data[i]);
      }
    }

    return transferables;
  };

  TypedArrayProtocolVar.fromString = function (str) {
    var array = str.split(',');
    for (var i = 0, len = array.length; i < len; i++) {
      array[i] = parseFloat(array[i], 10);
    }

    return array;
  };

  TypedArrayProtocolVar.prototype.getBytesPerStep = function () {
    var entry = this.data[0];
    if (entry !== undefined) {
      return entry.byteLength + 10;
    } else {
      return 10;
    }
  };

  TypedArrayProtocolVar.prototype.getAsJsonString = function (t) {
    return '[' + this.data[t - this.tMin].join(',') + ']';
  };

  TypedArrayProtocolVar.prototype.join = function(protocolVar) {
    var tMin = protocolVar.tMin,
      tMax = protocolVar.tMax;

    for (var t = tMin; t <= tMax; t++) {
      this.set(t, protocolVar.data[t - tMin]);
    }
  };

  [
    'Int8', 
    'Uint8', 
    'Int16', 
    'Uint16', 
    'Int32', 
    'Uint32', 
    'Int64', 
    'Uint64', 
    'Float32', 
    'Float64', 
  ].forEach(function (typeStr) {
    typeStr += 'Array';
    var TA = self[typeStr];
    
    function PV(tMin) {
      TypedArrayProtocolVar.call(this, tMin);
    }
    PV.prototype = Object.create(TypedArrayProtocolVar.prototype);

    PV.prototype.set = function(t, value) {
      if (value !== undefined) {
        value = new TA(value);
      }

      ObjectProtocolVar.prototype.set.call(this, t, value);
    };

    PV.prototype.parsedJson2Value = function (obj) {
      return new TA(obj);
    };

    PV.prototype.type = typeStr;
    
    spimosimCore.modules.add('ProtocolVar', {
      name: typeStr,
      files: [ 'lib/modules/ProtocolVar/typed-array.js' ],
      depends: [],
      version: '1.0',
      author: 'Pascal Grafe',
      description: 'A typed ' + typeStr,
      date: '2020-03-26'
    }, PV);
  });


  return TypedArrayProtocolVar;
}());
