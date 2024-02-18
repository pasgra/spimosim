/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

var BoolArray;
var tools = (function () {
  BoolArray = function (arg0) {
    switch (typeof arg0) {
      case 'number':
        this.length = arg0;
        this.byteLength = Math.ceil(this.length / 8);
        this.buffer = new ArrayBuffer(this.byteLength + 4);
        new Uint32Array(this.buffer, 0, 1)[0] = this.length;
        this.uint8Array = new Uint8Array(this.buffer, 4);
        break;
      default:
        if (arg0.constructor === ArrayBuffer) {
          this.length = new Uint32Array(arg0, 0, 1)[0];
          this.byteLength = Math.ceil(this.length / 8);
          this.buffer = arg0;
          this.uint8Array = new Uint8Array(this.buffer, 4);
        } else {
          var boolArray = BoolArray.from(arg0);
          this.length = boolArray.length;
          this.byteLength = boolArray.byteLength;
          this.buffer = boolArray.buffer;
          this.uint8Array = boolArray.uint8Array;
        }
        break;
    }
  }
  BoolArray.prototype.constructor = BoolArray;

  BoolArray.from = function (arr) {
    var length = arr.length,
      boolArray = new BoolArray(length),
      uint8Array = boolArray.uint8Array,
      byteLength = boolArray.byteLength,
      b,//current Byte
      l,//index of the last bit of the current byte
      byteIndex = 0,//index of the current byte
      bitIndex = 0;//index of the current bit in the whole array

    for (; byteIndex < byteLength; byteIndex++) {//loop over bytes
      b = 0;//All spins down

      l = Math.min(bitIndex + 8, length);//loop to the end of the byte or end of the array
      for (; bitIndex < l; bitIndex++) {//loop over bits in current byte
        if (arr[bitIndex] === 1) {//up spin
          b += 1 << (bitIndex % 8);//set bit to 1
        }
      }

      uint8Array[byteIndex] = b;//set byte
    }

    return boolArray;
  };

  BoolArray.prototype.toSpins = function (spinsArray) {
    var length = this.length,
      byteLength = this.byteLength,
      b,//current Byte
      l,//index of the last bit of the current byte
      byteIndex = 0,
      bitIndex = 0;

    if (!spinsArray) {
      //initialize a new array to save the spins.
      spinsArray = new Int8Array(length);
    }

    for (; byteIndex < byteLength; byteIndex++) {//loop over bytes
      b = this.uint8Array[byteIndex];

      l = Math.min(bitIndex + 8, length);//loop to the end of the byte or end of the array
      for (; bitIndex < l; bitIndex++) {//loop over bits
        if ((b >> (bitIndex % 8)) & 1) {//extract current bit from current byte
          spinsArray[bitIndex] = 1;//up spin
        } else {
          spinsArray[bitIndex] = -1;//down spin
        }
      }
    }

    return spinsArray;
  };

  BoolArray.prototype.sum = function () {
    var length = this.length,
      byteLength = this.byteLength,
      b,//current Byte
      l,//index of the last bit of the current byte
      byteIndex = 0,
      bitIndex = 0,
      sum = 0;

    for (; byteIndex < byteLength; byteIndex++) {//loop over bytes
      b = this.uint8Array[byteIndex];

      l = Math.min(bitIndex + 8, length);//loop to the end of the byte or end of the array
      for (; bitIndex < l; bitIndex++) {//loop over bits
        if ((b >> (bitIndex % 8)) & 1) {//extract current bit from current byte
          sum++;
        }
      }
    }

    return sum;
  };

  BoolArray.prototype.join = function (separator) {
    return this.toSpins().join(separator);
  };

  /*
   * Calls the function 'callback' on every bit from bit 'offset'
   * (default: 0) to the last bit and returns an array of the returned
   * values.
   * 
   * 'callback' takes 3 arguments:
   * callback(currentBit, index, array)
   */
  BoolArray.prototype.map = function (callback, offset) {
    if (offset === undefined) {
      offset = 0;
    }

    var arr = [],
      length = this.length,
      byteLength = this.byteLength,
      uint8Array = this.uint8Array,
      b,//The current Byte
      l,//index of the last bit of the current byte
      byteIndex = offset >> 3,
      bitIndex = offset;

    for (; byteIndex < byteLength; byteIndex++) {
      b = uint8Array[byteIndex];

      l = Math.min(bitIndex + 8, length);
      for (; bitIndex < l; bitIndex++) {
        array.push(callback(b >> (bitIndex % 8) & 1, bitIndex - offset, this));
      }
    }

    return array;
  },

  /*
   * Calls the function 'callback' on every bit from bit 'offset' (default: 0) to the last bit.
   * 
   * 'callback' takes 3 arguments:
   * callback(currentBit, index, array)
   */
  BoolArray.prototype.forEach = function (callback, offset) {
    if (offset === undefined) {
      offset = 0;
    }

    var length = this.length,
      byteLength = this.byteLength,
      uint8Array = this.uint8Array,
      b, //The current Byte
      l,//index of the last bit of the current byte
      byteIndex = offset >> 3,
      bitIndex = offset;

    for (; byteIndex < byteLength; byteIndex++) {
      b = uint8Array[byteIndex];

      l = Math.min(8 * byteIndex + 8, length);
      for (; bitIndex < l; bitIndex++) {
        callback(
          b >> (bitIndex % 8) & 1,
          bitIndex - offset,
          this
        );
      }
    }
  };

  BoolArray.prototype.slice = function (offset, end) {
    if (offset === undefined) {
      offset = 0;
    }

    if (end === undefined) {
      end = this.length;
    }

    var array = new Uint8Array(end - offset),
      byteLength = this.byteLength,
      uint8Array = this.uint8Array,
      b, //The current Byte
      l,//index of the last bit of the current byte
      byteIndex = offset >> 3,
      bitIndex = offset;

    for (; byteIndex < byteLength; byteIndex++) {
      b = uint8Array[byteIndex];

      l = Math.min(8 * byteIndex + 8, end);
      for (; bitIndex < l; bitIndex++) {
        array[bitIndex - offset] = b >> (bitIndex % 8) & 1;
      }
    }

    return array;
  };

  /*
   * Calls the function 'callback' on every bit from bit 'offset' (default: 0) to the last bit.
   * 
   * 'callback' takes 5 arguments:
   * callback(currentBit0, currentBit1, index, array0, array1)
   */
  BoolArray.prototype.forEach2 = function (callback, offset, boolArray1) {
    if (offset === undefined) {
      offset = 0;
    }

    var length = this.length,
      byteLength = this.byteLength,
      uint8Array0 = this.uint8Array,
      uint8Array1 = boolArray1.uint8Array,
      b0, b1, //The current bytes
      l,//index of the last bit of the current byte
      i,
      byteIndex = offset >> 3,
      bitIndex = offset;

    for (; byteIndex < byteLength; byteIndex++) {
      b0 = uint8Array0[byteIndex];
      b1 = uint8Array1[byteIndex];

      l = Math.min(8 * byteIndex + 8, length);
      for (; bitIndex < l; bitIndex++) {
        i = (bitIndex % 8);
        callback(
          b0 >> i & 1,
          b1 >> i & 1,
          bitIndex - offset,
          this,
          boolArray1
        );
      }
    }
  };

  /*
   * Calls the function 'callback' on every bit from bit 'offset' (default: 0) to the last bit.
   * 
   * 'callback' takes 9 arguments:
   * callback(currentBit0, currentBit1, currentBit2, currentBit3, index, array0, array1, array2, array3)
   */
  BoolArray.prototype.forEach4 = function (callback, offset, boolArray1,
      boolArray2, boolArray3) {
    if (offset === undefined) {
      offset = 0;
    }

    var length = this.length,
      byteLength = this.byteLength,
      uint8Array0 = this.uint8Array,
      uint8Array1 = boolArray1.uint8Array,
      uint8Array2 = boolArray2.uint8Array,
      uint8Array3 = boolArray3.uint8Array,
      b0, b1, b2, b3,//The current bytes
      l,//index of the last bit of the current byte
      i,
      byteIndex = offset >> 3,
      bitIndex = offset;

    for (; byteIndex < byteLength; byteIndex++) {
      b0 = uint8Array0[byteIndex];
      b1 = uint8Array1[byteIndex];
      b2 = uint8Array2[byteIndex];
      b3 = uint8Array3[byteIndex];

      l = Math.min(8 * byteIndex + 8, length);
      for (; bitIndex < l; bitIndex++) {
        i = (bitIndex % 8);
        callback(
          b0 >> i & 1,
          b1 >> i & 1,
          b2 >> i & 1,
          b3 >> i & 1,
          bitIndex - offset,
          this,
          boolArray1,
          boolArray2,
          boolArray3
        );
      }
    }
  };


  /*
   * Creates an Array 0,...,n as an attribute.
   */
  function createSeries(n) {
    var series = new Uint32Array(n);
    for (var i = 0; i < n; i++) {
      series[i] = i;
    }

    return series;
  }

  /*
   * Shuffles the series
   */
  function fisherYatesShuffle(series) {
    var tmp, j;

    for (var i = series.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * i);//random index

      //swap
      tmp = series[j];
      series[j] = series[i];
      series[i] = tmp;
    }
  }

  function copyInto(obj1, obj2) {
    for (var name in obj1) {
      if (obj1.hasOwnProperty(name)) {
        var value = obj1[name],
          type = typeof value;
        if (obj2.hasOwnProperty(name)) {
          if (type !== typeof obj2[name] || type !== 'object') {
            obj2[name] = value;
          } else {
            copyInto(value, obj2[name]);
          }
        } else {
          if (type !== 'object') {
            obj2[name] = value;
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              obj2[name] = copyInto(value, []);
            } else {
              obj2[name] = [];
            }
          } else {
            obj2[name] = copyInto(value, {});
          }
        }
      }
    }

    return obj2;
  };

  /*
   * Sums up the array and returns the result
   */
  function sum(array) {
    var s = 0;
    for (var i = 0, len = array.length; i < len; i++) {
      s += array[i];
    }

    return s;
  }

  function randId(prefix) {
    if (prefix === undefined) {
      prefix = '';
    }

    return prefix + Math.random().toString().slice(2);
  }

  function fitLeastSquares(fn, dataX, dataY, guess, xMin, xMax, weights) {
    var data = [],
      usedWeights = [],
      sum,
      x, y,
      squareSum;

    if (xMin === undefined) {
      xMin = -Infinity;
    }

    if (xMax === undefined) {
      xMax = Infinity;
    }

    if (weights) {
      squareSum = function (x) {
        var args = [ undefined ].concat(x);

        sum = 0;
        for (var i = 0, len = data.length; i < len; i++){
          args[0] = data[i][0];
          var diff = fn.apply(null, args) - data[i][1];

          sum += usedWeights[i] * diff * diff;
        }

        return sum;
      };

      for (var i = 0, len = dataX.length; i < len; i++) {
        x = dataX[i];
        y = dataY[i];

        if (isFinite(x) && isFinite(y) && xMin <= x && x <= xMax) {
          data.push([ x, y ]);
          usedWeights.push(weights[i]);
        }
      }
    } else {
      squareSum = function (x) {
        var args = [ undefined ].concat(x);

        sum = 0;
        for (var i = 0, len = data.length; i < len; i++){
          args[0] = data[i][0];
          var diff = fn.apply(null, args) - data[i][1];

          sum += diff * diff;
        }

        return sum;
      };

      for (var i = 0, len = dataX.length; i < len; i++) {
        x = dataX[i];
        y = dataY[i];

        if (isFinite(x) && isFinite(y) && xMin <= x && x <= xMax) {
          data.push([ x, y ]);
        }
      }
    }

    if (data.length > 0) {
      try {
        return numeric.uncmin(squareSum, guess);
      } catch (e) {
        var solution = [];
        for (var i = 0, len = guess.length; i < len; i++) {
          solution.push(NaN);
        }

        return {
          message: e.toString(),
          solution: solution
        };
      }
    } else {
      var solution = [];
      for (var i = 0, len = guess.length; i < len; i++) {
        solution.push(NaN);
      }
      return {
        message: 'No data',
        solution: solution
      };
    }
  }

  fitLeastSquares.exponential = function (dataX, dataY, guess, xMin, xMax,
      weights) {
    return fitLeastSquares(
      function (x, a, b) {
        return a * Math.exp(b * x);
      },
      dataX, dataY, guess, xMin, xMax, weights);
  };

  var fitMle = {};//Maximum likelihood estimator

  function powFn(x, a, b, c) {
    return a * Math.pow(x, -b) + c;
  }

  fitMle.powerLaw = function (dataX, dataY, isCdf, isDiscrete, xMin) {
    var MIN_POINTS = 3,
      data = [],
      x, y,
      len = dataX.length;

    if (xMin === undefined) {
      xMin = 0;
    }

    var c = isDiscrete ? .5 : 0;

    for (var i = 0; i < len; i++) {
      x = dataX[i];
      y = dataY[i];

      if (isFinite(x) && isFinite(y) && xMin <= x) {
        data.push([ x, y ]);
      }
    }
    len = data.length;

    if (len < MIN_POINTS) {
      return {
        distance: {
          distance: NaN,
          prob: 0
        },
        message: 'Too few points.',
        solution: [ NaN, NaN ]
      };
    }

    data.sort(function (a, b) {
      return a[0] - b[0];
    });


    //f(x, a, b) = a * pow(x, -b)
    var a, b, distance,
      x, y,
      lnSum, n,
      params,
      counts, s = 0,
      bestFit = {
        distance: {
          distance: Infinity,
          prob: 0
        }
      };

    counts = [];
    for (var i = 0; i < len; i++) {
      if (isCdf) {
        s = data[i][1];
      } else {
        s += data[i][1];
      }
      counts.push(s);
    }

    for (var xMinIndex = 0; xMinIndex < len - MIN_POINTS; xMinIndex++) {
      xMin = data[xMinIndex][0];
      if (xMin <= c) {
        continue;
      }

      lnSum = 0;
      n = 0;

      for (var i = xMinIndex; i < len; i++) {
        x = data[i][0];
        y = data[i][1];

        lnSum += y * Math.log(x / (xMin - c));
        n += y;
      }

      b = 1 + n / lnSum;
      a = n * (b - 1) * Math.pow(xMin - c, b - 1);

      if (isCdf) {
        params = [ a / n, b, -a / n * Math.pow(xMin - c, -b) ];
      } else {
        params = [ a / n / (1 - b), b - 1, -a / n / (1 - b) * Math.pow(xMin - c, 1 - b) ];
      }

      distance = getKsDistance(powFn, params, xMin, Infinity, dataX, counts);

      if (isFinite(distance.distance)
          && distance.distance < bestFit.distance.distance) {
        bestFit = {
          a: a,
          b: b,
          xMin: xMin,
          distance: distance
        };
      }
    }

    return {
      distance: bestFit.distance,
      xMin: bestFit.xMin,
      message: 'Fit ok',
      solution: [ bestFit.a, bestFit.b ]
    };
  }

  function getKsProb(lambda) {
    var sum = 0,
      summand,
      newSum,
      c = -2 * lambda * lambda,
      sign = 1;

    for (var i = 1; i < 128; i++) {
      summand = Math.exp(c * i * i);
      newSum = sum + sign * summand;
      if (Math.abs(summand / newSum) < 1.e-3 || Math.abs(newSum / sum - 1) < 1.e-10) {
        return 2 * newSum;
      }
      sign = -sign;
      sum = newSum;
    }

    return 1;
  }

  function getDistance(fn, params, isDiscrete, xMin, xMax, points, counts) {
    var x, y, fnY,
      len = points.length,
      n,
      yMin = 0, yDiff = 1,
      args = [ undefined ].concat(params);

    if (xMin === undefined) {
      xMin = -Infinity;
    }

    if (xMax === undefined) {
      xMax = Infinity;
    }

    for (var iMin = 0; iMin < len; iMin++) {
      x = points[iMin];
      if (isFinite(x) && x >= xMin) {
        break;
      }
    }
    for (var iMax = len - 1; iMax >= iMin; iMax--) {
      x = points[iMax];
      if (isFinite(x) && x <= xMax) {
        break;
      }
    }

    points = points.slice(iMin, iMax);
    counts = counts.slice(iMin, iMax);
    len = points.length;

    if (len < 4) {
      return {
        msg: 'Too few points.',
        distance: NaN,
        prob: 0,
      };
    }

    if (counts) {
      n = sum(counts);
    } else {
      n = len;
    }

    function wrappedFn(x) {
      args[0] = x;
      return (fn.apply(null, args) - yMin) / yDiff;
    }

    if (isDiscrete) {
      //Chi square test

      if (!counts) {
        return {
          msg: 'Cannot calculate chi square distance for unbinned data',
          distance: NaN,
          prob: 1,
        };
      }

      var ebins = [];
      for (var i = 0; i < len; i++) {
        ebins.push(wrappedFn(points[i]));
      }

      try {
        var distance = chsone(counts, ebins);
      } catch (e) {
        return {
          msg: 'Error: ' + e,
          distance: NaN,
          prob: 1,
        };
      }

      distance.msg = 'χ^2 Test';
      return distance;
    } else {
      yMin = wrappedFn(xMin);
      if (!isFinite(yMin)) {
        return {
          msg: 'Function diverges at lower limit or no lower limit for x',
          distance: NaN,
          prob: 1,
        };
      }

      yDiff = wrappedFn(xMax);
      if (!isFinite(yDiff)) {
        return {
          msg: 'Function diverges at upper limit or no upper limit for x',
          distance: NaN,
          prob: 1,
        };
      }

      //KS test
      var y = 0, ksDistance = 0;
      for (var i = 0; i < len; i++) {
        x = points[i];
        fnY = wrappedFn(x);
        ksDistance = Math.max(ksDistance, Math.abs(fnY - y / n));
        if (counts) {
          y += counts[i];
        } else {
          y++;
        }
        ksDistance = Math.max(ksDistance, Math.abs(fnY - y / n));
      }

      var sqrtN = Math.sqrt(n);

      return {
        distance: ksDistance,
        prob: getKsProb((sqrtN + .12 + .11 / sqrtN) * ksDistance),
        msg: 'KS Test'
      };
    }
  }

  var chsone = (function () {
    /*
     * Translated from C to Javascript based on:
     * William H Press u. a. Numerical Recipes in C: The Art of Scientific Computing (Cambridge. 1992)
     */

    var ITMAX = 100,
      EPS = 3.0e-12,
      FPMIN = 1.0e-30;

    //Returns the incomplete gamma function Q(a, x) evaluated by its continued fraction representation.
    function gcf(a, x) {
      var  an, b, c, d, del, h, gln = gammln(a);
      b = x + 1.0 - a;
      c = 1.0 / FPMIN;
      d = 1.0 / b;
      h = d;
      for (var i = 1; i <= ITMAX; i++) {
        an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < FPMIN) {
          d = FPMIN;
        }
        c = b + an / c;
        if (Math.abs(c) < FPMIN) {
          c = FPMIN;
        }
        d = 1.0 / d;
        del = d * c;
        h *= del;

        if (Math.abs(del - 1) < EPS) {
          break;
        }
      }

      if (i > ITMAX) {
        throw 'a too large, ITMAX too small in gcf';
      }

      return Math.exp(-x + a * Math.log(x) - gln) * h;
    }

    //Returns the value ln[Γ(xx)] for xx > 0.
    function gammln(xx) {
      var  x, y, tmp, ser;
      var cof = [ 76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5 ];
      y = x = xx;
      tmp = x + 5.5;
      tmp -= (x + 0.5) * Math.log(tmp);
      ser = 1.000000000190015;
      for (var j = 0; j <= 5; j++) {
        ser += cof[j] / ++y;
      }
      return -tmp + Math.log(2.5066282746310005 * ser / x);
    }

    //Returns the incomplete gamma function P(a, x) evaluated by its series representation.
    function gser(a, x) {
      var n, sum, del, ap, gln = gammln(a);
      if (x <= 0.0) {
        throw 'x less than 0 in routine gser';
      } else {
        ap = a;
        del = sum = 1.0 / a;
        for (n = 1; n <= ITMAX; n++) {
          ++ap;
          del *= x / ap;
          sum += del;
          if (Math.abs(del) < Math.abs(sum) * EPS) {
            return sum * Math.exp(-x + a * Math.log(x) - gln);
          }
        }
        throw 'a too large, ITMAX too small in routine gser';
      }
    }

    //Returns the incomplete gamma function Q(a, x) ≡ 1 − P (a, x).
    function gammq(a, x) {
      if (x < 0 || a <= 0) {
        throw 'Invalid arguments in routine gammq';
      }

      if (x < a + 1) {
        return 1 - gser(a, x);
      } else {
        return gcf(a, x);
      }
    }

    /*
    Given the array bins[1..nbins] containing the observed numbers of events, and an array
    ebins containing the expected numbers of events, and given the number of con-
    straints knstrn (normally one), this routine returns (trivially) the number of degrees of freedom
    df, and (nontrivially) the chi-square chsq and the significance prob. A small value of prob
    indicates a significant difference between the distributions bins and ebins. Note that bins
    and ebins are both float arrays, although bins will normally contain integer values.
    */
    function chsone(bins, ebins, knstrn) {
      var temp, df, chsq, prob, nbins = bins.length;
      if (knstrn === undefined) {
        knstrn = 1;
      }
      df = nbins - knstrn;
      chsq = 0;
      for (var j = 0; j < nbins; j++) {
        temp = bins[j] - ebins[j];
        chsq += temp * temp / ebins[j];
      }
      prob = gammq(0.5 * df, 0.5 * chsq);

      return {
        df: df,
        distance: chsq,
        prob: prob
      };
    }

    return chsone;
  }());

  function interpolateBilinear(mat, x, y) {
    var
      width = mat[0].length,
      height = mat.length,
      x1 = ~~x,//round down
      y1 = ~~y,
      x2 = (x1 + 1) % width,
      y2 = (y1 + 1) % height;

    return ((x2 - x) * mat[x1][y1] + (x - x1) * mat[x2][y1]) * (y2 - y)
      + ((x2 - x) * mat[x1][y2] + (x - x1) * mat[x2][y2]) * (y - y1);
  }

  function fft2d(mat, width) {
    //FFT on lines
    var height = mat.length,
      width = mat[0].length,
      vecReal, vecImag,
      valReal, valImag,
      matRowsConvertedReal = [],
      matRowsConvertedImag = [],
      matConvertedReal = [],
      matConvertedImag = [],
      matConvertedAbs = [],
      converted;

    vecImag = new Float64Array(width);
    for (var l = 0; l < height; l++) {
      matConvertedReal[l] = new Float64Array(width);
      matConvertedImag[l] = new Float64Array(width);
      matConvertedAbs[l] = new Float64Array(width);

      vecReal = mat[l];
      converted = (new numeric.T(vecReal, vecImag)).fft();

      matRowsConvertedReal[l] = converted.x;
      matRowsConvertedImag[l] = converted.y;
    }

    vecImag = new Float64Array(height);
    vecReal = new Float64Array(height);
    for (c = 0; c < width; c++) {
      for (var l = 0; l < height; l++) {
        vecReal[l] = matRowsConvertedReal[l][c];
        vecImag[l] = matRowsConvertedImag[l][c];
      }

      converted = (new numeric.T(vecReal, vecImag)).fft();

      for (var l = 0; l < height; l++) {
        matConvertedReal[l][c] = converted.x[l];
        matConvertedImag[l][c] = converted.y[l];
      }
    }

    for (var l = 0; l < height; l++) {
      for (var c = 0; c < width; c++) {
        valImag = matConvertedImag[l][c];
        valReal = matConvertedReal[l][c];
        matConvertedAbs[l][c] =
          Math.sqrt(valImag * valImag + valReal * valReal);
      }
    }

    return {
      abs: matConvertedAbs,
      real: matConvertedReal,
      imag: matConvertedImag
    };
  }

  function enlargeFloat64(oldArray, len) {
    var array = new Float64Array(len);
    array.set(oldArray);

    return array;
  }

  function addToPrototype(dest, source) {
    for (var name in source.prototype) {
      if (source.prototype.hasOwnProperty(name)) {
        dest.prototype[name] = source.prototype[name];
      }
    }
  }

  function Register(registerType) {
    this.registerType = registerType;
    this.registeredConstructors = {};
  }

  Register.prototype.add = function (type, Constructor, prototypeFns, fns) {
    if (this.registeredConstructors[type] !== undefined) {
      throw this.registerType + ' "' + type + '" is already registered.';
    }

    var InheritedConstructor;
    if (prototypeFns !== undefined) {
      if (prototypeFns.customConstructor !== undefined) {
        var C = prototypeFns.customConstructor;
        InheritedConstructor = function () {
          C.apply(this, arguments);
        };
      } else {
        InheritedConstructor = function () {
          Constructor.apply(this, arguments);
        };
      }

      InheritedConstructor.prototype = Object.create(Constructor.prototype);

      for (var name in prototypeFns) {
        if (name !== 'customConstructor' && prototypeFns.hasOwnProperty(name)) {
          InheritedConstructor.prototype[name] = prototypeFns[name];
        }
      }

      if (fns !== undefined) {
        for (var name in fns) {
          if (fns.hasOwnProperty(name)) {
            InheritedConstructor[name] = fns[name];
          }
        }
      }
    } else {
      InheritedConstructor = Constructor;
    }

    this.registeredConstructors[type] = InheritedConstructor;

    return InheritedConstructor;
  };

  Register.prototype.get = function (type) {
    if (this.registeredConstructors[type] !== undefined) {
      return this.registeredConstructors[type];
    } else {
      throw this.registerType + ' "' + type + '" is not registered.';
    }
  };
  
  Register.prototype.exists = function (type) {
    return this.registeredConstructors[type] !== undefined;
  }
  
  Register.prototype.list = function () {
    var list = [];
    var constructors = this.registeredConstructors;
    for (var id in constructors) {
      if (constructors.hasOwnProperty(id)) {
        list.push(id);
      }
    }
    return list;
  }

  var LOAD_MATH_IN_SCOPE = (function () {
    var fns = Object.getOwnPropertyNames(Math),
      code = '';

    for (var i = 0, len = fns.length; i < len; i++) {
      var fnName = fns[i];

      if (fnName !== 'toSource') {
        code += 'var ' + fnName + ' = Math.' + fnName + ';\n';
      }
    }

    return code;
  }());

  function EventDispatcher(eventTypes) {
    if (eventTypes !== undefined) {
      this.eventListeners = {};

      for (var i = 0, len = eventTypes.length; i < len; i++) {
        this.eventListeners[eventTypes[i]] = [];
      }
    }
  }

  EventDispatcher.prototype.addEventListener = function (type, callback, n) {
    var listeners = this.eventListeners[type];
    if (callback === undefined) {
      throw 'Could not add event listener for event type "' + type +
        '": Undefined callback';
    }

    if (listeners !== undefined) {
      if (n === undefined) {
        n = Infinity;
      }

      listeners.push({
        callback: callback,
        n: n
      });
    } else {
      throw 'Unknown event: "' + type + '"';
    }
  };

  EventDispatcher.prototype.once = function (type, callback) {
    this.addEventListener(type, callback, 1);
  };

  EventDispatcher.prototype.destroy = function () {
    this.eventListeners = undefined;
  };

  EventDispatcher.prototype.removeEventListener = function (type, callback) {
    var listeners = this.eventListeners[type];
    if (listeners !== undefined) {
      for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i].callback === callback) {
          listeners.splice(i, 1);
          return true;
        }
      }

      return false;
    } else {
      throw 'Unknown event: ' + type;
    }
  };

  EventDispatcher.prototype.dispatchEvent = function (type, data) {
    var listeners = this.eventListeners[type];
    if (listeners !== undefined) {
      var copiedListeners = listeners.slice();//copy array
      for (var i = 0, len = copiedListeners.length; i < len; i++) {
        copiedListeners[i].callback(data);

        if (--copiedListeners[i].n === 0) {
          listeners.splice(listeners.indexOf(copiedListeners[i]), 1);
        }
      }
    } else {
      throw 'Unknown event: ' + type;
    }
  };

  function EventAttacher() {
    this.attachedListeners = [];
  }

  EventAttacher.prototype.attachEventListeners = function (
      attachableListeners) {
    var attachedListeners = this.attachedListeners,
      listener;

    for (var i = 0, len = attachableListeners.length; i < len; i++) {
      this.attachEventListener(attachableListeners[i]);
    }
  };

  EventAttacher.prototype.attachEventListener = function (listener) {
    var dispatcher = listener.dispatcher,
      callback = listener.callback,
      type = listener.type;

    if (type === undefined) {
      throw 'Could not attach event listener: Undefined type';
    }

    if (callback === undefined) {
      throw 'Could not attach event listener for event type "' + type +
        '": Undefined callback';
    }

    if (dispatcher === undefined) {
      throw 'Could not attach event listener for event type "' + type + '": Undefined dispatcher';
    }

    if (dispatcher.on) {
      dispatcher.on(type, callback);
    } else {
      dispatcher.addEventListener(type, callback);
    }

    this.attachedListeners.push(listener);
  };

  EventAttacher.prototype.detachEventListeners = function (listeners) {
    for (var i = 0, len = listeners.length; i < len; i++) {
      this.detachEventListener(listeners[i]);
    }
  };

  EventAttacher.prototype.detachAllEventListeners = function () {
    var attachedListeners = this.attachedListeners;

    while (attachedListeners.length > 0) {
      this.detachEventListener(attachedListeners[0]);
    }
  };

  EventAttacher.prototype.detachEventListener = function (listener) {
    var dispatcher = listener.dispatcher;
    if (dispatcher.off) {
      dispatcher.off(listener.type, listener.callback);
    } else {
      dispatcher.removeEventListener(listener.type, listener.callback);
    }

    var i = this.attachedListeners.indexOf(listener);
    if ( i!= -1) {
      this.attachedListeners.splice(i, 1);
    }
  };

  EventAttacher.prototype.destroy = function () {
    this.detachAllEventListeners();
  };

  function FeatureActivatable(featureList) {
    var activateAll = featureList === true;
    this.features = {};
    for (var i = 0, len = this.availableFeatures.length; i < len; i++) {
      this.features[this.availableFeatures[i].name] = activateAll;
    }
    if (!activateAll && featureList !== undefined) {
      for (var i = 0, len = featureList.length; i < len; i++) {
        this.activateFeature(featureList[i]);
      }
    }
  }
  
  function FeatureActivatable(featureList, layer) {
    if (this.features === undefined) {
      this.features = {};
    }
    this.activateList(featureList, layer);
  }
  
  FeatureActivatable.prototype.activateList = function (featureList, layer) {
    var activateAll = featureList === true;
    for (var i = 0, len = this.availableFeatures[layer].length; i < len; i++) {
      this.features[this.availableFeatures[layer][i].name] = activateAll;
    }
    if (!activateAll && featureList !== undefined) {
      for (var i = 0, len = featureList.length; i < len; i++) {
        this.activateFeature(featureList[i], layer);
      }
    }
  };
  
  FeatureActivatable.prototype.activateFeature = function (featureName, layer) {
    if (!this.features[featureName]) {
      this.features[featureName] = true;
      var featureList;
      for (var i = 0, len = this.availableFeatures[layer].length; i < len; i++) {
        if (this.availableFeatures[layer][i].name === featureName) {
          featureList = this.availableFeatures[layer][i].activates;
          break;
        }
      }
      if (featureList !== undefined) {
        for (var i = 0, len = featureList.length; i < len; i++) {
          this.activateFeature(featureList[i], layer);
        }
      }
    }
  };
  
  const regexJsVarName = /(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*/g;
  const jsKeyWords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "false",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "null",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "true",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "let",
    "static",
    "yield",
    "await",
    "enum",
    "implements",
    "interface",
    "package",
    "private",
    "protected",
    "public",
    "abstract",
    "boolean",
    "byte",
    "char",
    "double",
    "final",
    "float",
    "goto",
    "int",
    "long",
    "native",
    "short",
    "synchronized",
    "throws",
    "transient",
    "volatile",
    "arguments",
    "as",
    "async",
    "eval",
    "from",
    "get",
    "of",
    "set",
    "null",
    "true",
    "false"
  ];


  function getPotentialVarNamesInCode(code, ignoreGlobals, ignoreKeyWords, ignoreMath, whiteList) {
    var varNames = {};
    for (var m of code.matchAll(regexJsVarName)) {
      let name = m[0];
      if (whiteList) {
        if (whiteList.indexOf(name) !== -1) {
          varNames[name] = 1;
        }
        continue;
      }
      if (ignoreGlobals && globalThis.hasOwnProperty(name)){
          continue;
      }
      if (ignoreKeyWords && jsKeyWords.indexOf(name) !== -1){
          continue;
      }
      if (ignoreMath && Math.hasOwnProperty(name)){
          continue;
      }
      varNames[name] = 1;
    }
    return Object.keys(varNames);
  }

  var ENDIAN = (function () {
    var uint32Array = new Uint32Array(1),
      uint8Array = new Uint8Array(uint32Array.buffer);

    uint8Array[0] = 1;
    uint8Array[1] = 2;
    uint8Array[2] = 3;
    uint8Array[3] = 4;

    if (uint32Array[0] === 0x01020304) {
      return 'big';
    } else if (uint32Array[0] === 0x04030201) {
      return 'little';
    } else {
      throw 'Unknown endianess.';
    }
  })();

  return {
    createSeries: createSeries,
    EventDispatcher: EventDispatcher,
    EventAttacher: EventAttacher,
    FeatureActivatable: FeatureActivatable,
    fisherYatesShuffle: fisherYatesShuffle,
    sum: sum,
    getPotentialVarNamesInCode: getPotentialVarNamesInCode,
    copyInto: copyInto,
    randId: randId,
    fitLeastSquares: fitLeastSquares,
    fitMle: fitMle,
    getDistance: getDistance,
    interpolateBilinear: interpolateBilinear,
    fft2d: fft2d,
    enlargeFloat64: enlargeFloat64,
    addToPrototype: addToPrototype,
    Register: Register,
    LOAD_MATH_IN_SCOPE: LOAD_MATH_IN_SCOPE,
    ENDIAN: ENDIAN
  }
}());
