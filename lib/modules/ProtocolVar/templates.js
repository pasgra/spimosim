spimosimCore.modules.add("creator-module-templates", "ProtocolVar", {
  labelText: "ProtocolVar",
  description: `A ProtocolVar handles the efficient storing of a variable type
in the protocol. It also provides functions for slicing and proparing the
transfer from or to a webworker.`,
  templates: {
    "ProtocolVar": {
      object: 'MyProtocolVar',
      template: `
function MyProtocolVar(tMin) {
  spimosimCore.ProtocolVar.call(this, tMin);
}
MyProtocolVar.prototype = Object.create(spimosimCore.ProtocolVar.prototype);

// store the value <val> for time step <t>
MyProtocolVar.prototype.set = function(t, val) {
}

// Return the stored value of time step <t> or undefined if nothing is stored.
MyProtocolVar.prototype.get = function (t) {
  var value = "value at <t>";
  return value;
}

// Return a string representation that can be included in JSON like:
// '{ "foo": ' + <return value of this function> + '}'
MyProtocolVar.prototype.getAsJsonString = function (t) {
  return JSON.stringify(this.get(t));
}

// Combine two instances into one
MyProtocolVar.prototype.join = function(protocolVar) {
  
}

// Undo the conversion done by getAsJsonString and return the result
MyProtocolVar.prototype.parsedJson2Value = function (obj) {
  return obj;
}

// Return an estimate how much bytes are needed per step. This is needed to
// detect that too much RAM is used.
MyProtocolVar.prototype.getBytesPerStep = function () {
  return 1000;
}

// Delete everything before time step <t>
MyProtocolVar.prototype.deleteOldData = function (t) {
}

// Prepares the ProtocolVar to be send from or to a webworker. Returns
// all internal transferable objects like ArrayBuffers.
MyProtocolVar.prototype.makeTransferable = function () {
  // Do nothing if automatic conversion from and to JSON works fine.
  return [];
}
      `
    },
    "ObjectProtocolVar": {
      object: 'MyObjectProtocolVar',
      template: `function MyObjectProtocolVar(tMin) {
  ObjectProtocolVar.call(this, tMin);
}
MyObjectProtocolVar.prototype = Object.create(spimosimCore.ObjectProtocolVar.prototype);

// Return a string representation that can be included in JSON like:
// '{ "foo": ' + <return value of this function> + '}'
MyObjectProtocolVar.prototype.getAsJsonString = function (t) {
  return JSON.stringify(this.get(t));
}

// Return an estimate how much bytes are needed per step. This is needed to
// detect that too much RAM is used.
MyObjectProtocolVar.prototype.getBytesPerStep = function () {
  return 1000;
}

MyObjectProtocolVar.prototype.type = 'a type';
      `
    }
  }
});
