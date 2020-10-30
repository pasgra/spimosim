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
