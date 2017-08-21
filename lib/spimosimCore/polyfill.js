// Reference: http://es5.github.io/#x15.4.4.
var reduce = function (callback /*, initialValue*/) {
  'use strict';
  if (this == null) {
    throw new TypeError('Called on null or undefined');
  }
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function');
  }
  var t = Object(this), len = t.length >>> 0, k = 0, value;
  if (arguments.length == 2) {
    value = arguments[1];
  } else {
    while (k < len && !(k in t)) {
      k++;
    }
    if (k >= len) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    value = t[k++];
  }
  for (; k < len; k++) {
    if (k in t) {
      value = callback(value, t[k], k, t);
    }
  }
  return value;
};


[
  Uint8Array,
  Uint16Array,
  Uint32Array,
  Int8Array,
  Int16Array,
  Int32Array,
  Float32Array,
  Float64Array
].forEach(function (A) {
  if (!A.prototype.reduce) {
    A.prototype.reduce = reduce;
  }

  if (!A.prototype.slice) {
    A.prototype.slice = A.prototype.subarray;
  }
});
