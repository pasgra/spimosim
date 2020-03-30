'use strict';

(function () {
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
  
  spimosimCore.modules.add('ProtocolVar', {
    name: 'String',
    files: [ 'lib/modules/ProtocolVar/string.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A string.',
    date: '2020-03-26'
  }, StringProtocolVar);
}());
