/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

spimosimCore.TypedProtocolVar = (function () {
  var ObjectProtocolVar = spimosimCore.ObjectProtocolVar;
  var ProtocolVar = spimosimCore.ProtocolVar;

  function TypedProtocolVar(tMin) {
    ProtocolVar.call(this, tMin);
  }
  TypedProtocolVar.prototype = Object.create(ProtocolVar.prototype);

  TypedProtocolVar.prototype.set = function(t, val) {
    if (t > this.tMax) {
      this.enlarge(t);
    }
    this.data[t - this.tMin] = val;
  };

  TypedProtocolVar.prototype.setAll = function(t, vals) {
    var tMax = t + vals.length -1;
    if (tMax > this.tMax) {
      this.enlarge(tMax);
    }
    this.data.set(vals, t - this.tMin);
  };

  TypedProtocolVar.prototype.getPerStepBytes = function () {
    return this.data.BYTES_PER_ELEMENT;
  };

  TypedProtocolVar.prototype.makeTransferable = function () {
    this.data = this.data.buffer;
    return [ this.data ];
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
    var TA = self[typeStr + 'Array'];

    function PV(tMin) {
      TypedProtocolVar.call(this, tMin);
      this.data = new TA(0);
    }
    PV.prototype = Object.create(TypedProtocolVar.prototype);

    PV.prototype.getBytesPerStep = function () {
      return TA.BYTES_PER_ELEMENT;
    };

    PV.prototype.enlarge = function (t) {
      var data = new TA(t - this.tMin + 1);
      data.set(this.data);
      this.data = data;
      this.tMax = t;
    };

    PV.prototype.join = function(protocolVar) {
      TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin, new TA(protocolVar.data));
    };

    PV.prototype.type = typeStr;
    
    spimosimCore.modules.add('ProtocolVar', {
      name: typeStr,
      files: [ 'lib/modules/ProtocolVar/typed.js' ],
      depends: [],
      version: '1.0',
      author: 'Pascal Grafe',
      description: 'A ' + typeStr,
      date: '2020-03-26'
    }, PV);
  });

  return TypedProtocolVar;
}());
