/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  var ProtocolVar = spimosimCore.ProtocolVar;
  var ObjectProtocolVar = spimosimCore.ObjectProtocolVar;

  function StringProtocolVar(tMin) {
    ObjectProtocolVar.call(this, tMin);
  }
  StringProtocolVar.prototype = Object.create(ObjectProtocolVar.prototype);

  StringProtocolVar.prototype.getBytesPerStep = function () {
    //Guess size by averaging length of 8 random entries
    var sum = 0,
      len = this.data.length;
    for (var i = 0; i < 8; i++) {
      var str = this.data[~~(Math.random() * len)];
      if (str !== undefined) {
        sum += str.length;
      }
    }

    //Return average + 10 bytes overhead for js array
    return sum / 8 + 10;
  };

  StringProtocolVar.prototype.getAsJsonString = function (t) {
    return '"' + this.data[t - this.tMin].replace('\\', '\\\\').replace('"', '\\"')+'"';
  };

  StringProtocolVar.prototype.type = 'String';

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

  TypedArrayProtocolVar.prototype.type = 'TypedArray';

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

  function Uint8ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Uint8ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Uint8ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Uint8Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Uint8ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Uint8Array(obj);
  };

  Uint8ArrayProtocolVar.prototype.type = 'Uint8Array';


  function Uint16ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Uint16ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Uint16ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Uint16Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Uint16ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Uint16Array(obj);
  };

  Uint16ArrayProtocolVar.prototype.type = 'Uint16Array';


  function Uint32ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Uint32ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Uint32ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Uint32Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Uint32ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Uint32Array(obj);
  };

  Uint32ArrayProtocolVar.prototype.type = 'Uint32Array';


  function Uint64ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Uint64ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Uint64ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Uint64Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Uint64ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Uint64Array(obj);
  };

  Uint64ArrayProtocolVar.prototype.type = 'Uint64Array';


  function Int8ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Int8ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Int8ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Int8Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Int8ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Int8Array(obj);
  };

  Int8ArrayProtocolVar.prototype.type = 'Int8Array';


  function Int16ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Int16ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Int16ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Int16Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Int16ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Int16Array(obj);
  };

  Int16ArrayProtocolVar.prototype.type = 'Int16Array';


  function Int32ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Int32ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Int32ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Int32Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Int32ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Int32Array(obj);
  };

  Int32ArrayProtocolVar.prototype.type = 'Int32Array';


  function Int64ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Int64ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Int64ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Int64Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Int64ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Int64Array(obj);
  };

  Int64ArrayProtocolVar.prototype.type = 'Int64Array';


  function Float32ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Float32ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Float32ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Float32Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Float32ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Float32Array(obj);
  };

  Float32ArrayProtocolVar.prototype.type = 'Float32Array';


  function Float64ArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  Float64ArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  Float64ArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new Float64Array(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  Float64ArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return new Float64Array(obj);
  };

  Float64ArrayProtocolVar.prototype.type = 'Float64Array';


  /*
   * Saves time step of one variable in a typed array
   */
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

  function Float32ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Float32Array(0);
  }
  Float32ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Float32ProtocolVar.prototype.getBytesPerStep = function () {
    return 4;
  };

  Float32ProtocolVar.prototype.enlarge = function (t) {
    var data = new Float32Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Float32ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Float32Array(protocolVar.data));
  };

  Float32ProtocolVar.prototype.type = 'Float32';

  function Float64ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Float64Array(0);
  }
  Float64ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Float64ProtocolVar.prototype.getBytesPerStep = function () {
    return 8;
  };

  Float64ProtocolVar.prototype.enlarge = function (t) {
    var data = new Float64Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Float64ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Float64Array(protocolVar.data));
  };

  Float64ProtocolVar.prototype.type = 'Float64';

  function Int8ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Int8Array(0);
  }
  Int8ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Int8ProtocolVar.prototype.getBytesPerStep = function () {
    return 1;
  };

  Int8ProtocolVar.prototype.enlarge = function (t) {
    var data = new Int8Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Int8ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Int8Array(protocolVar.data));
  };

  Int8ProtocolVar.prototype.type = 'Int8';

  function Uint8ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Uint8Array(0);
  }
  Uint8ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Uint8ProtocolVar.prototype.getBytesPerStep = function () {
    return 1;
  };

  Uint8ProtocolVar.prototype.enlarge = function (t) {
    var data = new Uint8Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Uint8ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Uint8Array(protocolVar.data));
  };

  Uint8ProtocolVar.prototype.type = 'Uint8';

  function Int16ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Int16Array(0);
  }
  Int16ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Int16ProtocolVar.prototype.getBytesPerStep = function () {
    return 2;
  };

  Int16ProtocolVar.prototype.enlarge = function (t) {
    var data = new Int16Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Int16ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Int16Array(protocolVar.data));
  };

  Int16ProtocolVar.prototype.type = 'Int16';

  function Uint16ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Uint16Array(0);
  }
  Uint16ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Uint16ProtocolVar.prototype.getBytesPerStep = function () {
    return 2;
  };

  Uint16ProtocolVar.prototype.enlarge = function (t) {
    var data = new Uint16Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Uint16ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Uint16Array(protocolVar.data));
  };

  Uint16ProtocolVar.prototype.type = 'Uint16';

  function Int32ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Int32Array(0);
  }
  Int32ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Int32ProtocolVar.prototype.getBytesPerStep = function () {
    return 4;
  };

  Int32ProtocolVar.prototype.enlarge = function (t) {
    var data = new Int32Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Int32ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Int32Array(protocolVar.data));
  };

  Int32ProtocolVar.prototype.type = 'Int32';

  function Uint32ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Uint32Array(0);
  }
  Uint32ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Uint32ProtocolVar.prototype.getBytesPerStep = function () {
    return 4;
  };

  Uint32ProtocolVar.prototype.enlarge = function (t) {
    var data = new Uint32Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Uint32ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Uint32Array(protocolVar.data));
  };

  Uint32ProtocolVar.prototype.type = 'Uint32';

  function Int64ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Int64Array(0);
  }
  Int64ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Int64ProtocolVar.prototype.getBytesPerStep = function () {
    return 8;
  };

  Int64ProtocolVar.prototype.enlarge = function (t) {
    var data = new Int64Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Int64ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Int64Array(protocolVar.data));
  };

  Int64ProtocolVar.prototype.type = 'Int64';

  function Uint64ProtocolVar(tMin) {
    TypedProtocolVar.call(this, tMin);
    this.data = new Uint64Array(0);
  }
  Uint64ProtocolVar.prototype = Object.create(TypedProtocolVar.prototype);

  Uint64ProtocolVar.prototype.getBytesPerStep = function () {
    return 8;
  };

  Uint64ProtocolVar.prototype.enlarge = function (t) {
    var data = new Uint64Array(t - this.tMin + 1);
    data.set(this.data);
    this.data = data;
    this.tMax = t;
  };

  Uint64ProtocolVar.prototype.join = function(protocolVar) {
    TypedProtocolVar.prototype.setAll.call(this, protocolVar.tMin,
      new Uint64Array(protocolVar.data));
  };

  Uint64ProtocolVar.prototype.type = 'Uint64';

  function SpinArrayProtocolVar(tMin) {
    TypedArrayProtocolVar.call(this, tMin);
  }
  SpinArrayProtocolVar.prototype = Object.create(TypedArrayProtocolVar.prototype);

  SpinArrayProtocolVar.prototype.set = function(t, value) {
    if (value !== undefined) {
      value = new BoolArray(value);
    }

    ObjectProtocolVar.prototype.set.call(this, t, value);
  };

  SpinArrayProtocolVar.prototype.parsedJson2Value = function (obj) {
    return (new BoolArray(obj)).toSpins();
  };

  SpinArrayProtocolVar.prototype.type = 'SpinArray';


  [ 
    StringProtocolVar,
    Int8ProtocolVar, 
    Uint8ProtocolVar, 
    Int16ProtocolVar, 
    Uint16ProtocolVar, 
    Int32ProtocolVar, 
    Uint32ProtocolVar, 
    Int64ProtocolVar, 
    Uint64ProtocolVar, 
    Float32ProtocolVar, 
    Float64ProtocolVar, 
    Uint8ArrayProtocolVar, 
    Uint16ArrayProtocolVar, 
    Uint32ArrayProtocolVar, 
    Uint64ArrayProtocolVar, 
    Int8ArrayProtocolVar, 
    Int16ArrayProtocolVar, 
    Int32ArrayProtocolVar, 
    Int64ArrayProtocolVar, 
    Float32ArrayProtocolVar, 
    Float64ArrayProtocolVar, 
    SpinArrayProtocolVar,
  ].forEach(function (Var) {
    spimosimCore.modules.add('ProtocolVar', Var.prototype.type, Var);
  });
}());
