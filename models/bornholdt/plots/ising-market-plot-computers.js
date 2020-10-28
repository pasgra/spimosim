/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  //Shortcuts to functions
  var modules = spimosimCore.modules,
    PlotComputer = spimosimCore.PlotComputer,
    TimePlotComputer = spimosimCore.TimePlotComputer,
    MultiSeriesTimePlotComputer = spimosimCore.MultiSeriesTimePlotComputer,
    AutoCorrelationPlotComputer = spimosimCore.modules.get("PlotComputer", "auto correlation"),
    sign = Math.sign,
    log = Math.log,
    exp = Math.exp,
    ceil = Math.ceil,
    max = Math.max,
    abs = Math.abs,
    sqrt = Math.sqrt,
    pow = Math.pow;

  spimosimCore.modules.add('PlotComputer', 
    'magnetisation',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        return vars.sSum[t - vars.offset] / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    'abs magnetisation',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        return abs(vars.sSum[t - vars.offset]) / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    'cMean',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        return vars.cSum[t - vars.offset] / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    'log returns',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var sSum = vars.sSum,
          offset = vars.offset

        return (sSum[t - offset] - sSum[t - 1 - offset]) / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    'abs log returns',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var sSum = vars.sSum,
          offset = vars.offset

        return abs(sSum[t - offset] - sSum[t - 1 - offset]) / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    's flips',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var offset = vars.offset,
          sNow = vars.s[t - offset],
          sThen = vars.s[t - 1 - offset],
          n = this.consts.n;

        if (sNow === undefined || sThen === undefined) {
          return NaN;
        }

        var sum = 0;
        new BoolArray(sNow).forEach2(
          function (spin, spinThen, i) {
            if (spin !== spinThen) {
              sum++;
            }
          }, 0, new BoolArray(sThen));

        return sum / n;
      }
    });

  modules.add('PlotComputer', 
    'delta cMean',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var cSum = vars.cSum,
          offset = vars.offset

        return (cSum[t - offset] - cSum[t - 1 - offset]) / this.consts.n;
      }
    });

  modules.add('PlotComputer', 
    'duration',
    PlotComputer,
    {
      customConstructor: function (consts) {
        PlotComputer.call(this, consts);

        this.lastSign = 0;
        this.lastSignChangeT = 0;
        this.firstChangeFound = false;
        this.durationArrayPositions = {};

        this.data = [];
        this.dataX = [];
        this.dataY = [];
      },

      calcDataInterval: function (vars, tStart, tEnd) {
        var sSum = vars.sSum,
          offset = vars.offset,
          currentSign, lastSign = this.lastSign;

        var durationArrayPositions = this.durationArrayPositions,
          data = this.data;

        for (var t = tStart; t < tEnd; t++) {
          currentSign = sign(sSum[t - offset]);

          if (lastSign !== currentSign) {
            if (lastSign !== 0) {
              if (this.firstChangeFound) {
                var duration = t - this.lastSignChangeT;

                if (duration in durationArrayPositions) {
                  data[durationArrayPositions[duration]][1]++;
                } else {
                  durationArrayPositions[duration] = data.length;
                  data.push([ duration, 1 ]);
                }
              } else {
                this.firstChangeFound = true;
              }
            }

            if (currentSign !== 0) {
              this.lastSignChangeT = t;
            }
          }

          lastSign = currentSign;
        }

        this.lastSign = lastSign;

        this.fit();
        this.convertData();
      },

      getTransferList: function () {
        var transferList = [
          this.dataX.buffer,
          this.dataY.buffer
        ];

        this.dataX = undefined;
        this.dataY = undefined;

        return transferList;
      },

      sortData: function () {
        var data = this.data;

        data.sort(function (point1, point2) {
          return point1[0] - point2[0];
        });

        for (var i = 0, len = data.length; i < len; i++) {
          this.durationArrayPositions[data[i][0]] = i;
        }
      },

      convertData: function () {
        var data = this.data,
          len = data.length,
          dataX = new Float64Array(len),
          dataY = new Float64Array(len);

        for (var i = 0; i < len; i++) {
          dataX[i] = data[i][0];
          dataY[i] = data[i][1];
        }

        this.dataX = dataX;
        this.dataY = dataY;
      },

      fit: function () {
        var data = this.data,
          len = data.length,
          lnSum,
          alpha, factor, xMin, xMinIndex,
          ksDistance,
          x, y,
          n,
          S, P,
          bestKsDistance = Infinity,
          bestAlpha, bestFactor, bestXMin,
          sum = 0;

        this.sortData();

        var minPoints = 3;

        for (var i = max(0, len - minPoints); i < len; i++) {
          sum += data[i][1];
        }

        for (xMinIndex = len - minPoints - 1; xMinIndex >= 0; xMinIndex--) {
          xMin = data[xMinIndex][0];

          sum += data[xMinIndex][1];

          lnSum = 0;
          n = 0;

          for (var i = len - 1; i >= 0; i--) {
            x = data[i][0];
            if (x >= xMin) {
              y = data[i][1] / sum;
              lnSum += y * log(x);
              n += y;
            } else {
              break;
            }
          }

          alpha = 1 + 1 / (-log(xMin - .5) + 1 / n * lnSum);
          factor = (alpha - 1) * n;

          ksDistance = 0;

          S = 0;
          for (var i = len - 1; i >= 0; i--) {
            x = data[i][0];
            if (x >= xMin) {
              y = data[i][1] / sum;
              S += y;

              P = pow(x / xMin, -alpha + 1);

              ksDistance = max(ksDistance, abs(S - P));
            } else {
              break;
            }
          }

          if (ksDistance < bestKsDistance) {
            bestAlpha = alpha;
            bestFactor = factor * sum;
            bestXMin = xMin;
            bestKsDistance = ksDistance;
          }
        }

        this.meta.fitResults = {
          alpha: bestAlpha,
          factor: bestFactor,
          xMin: bestXMin,
          ksDistance: bestKsDistance
        };
      }
    });

  modules.add('PlotComputer', 
    'neighbors',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var n = this.consts.n,
          sBuffer = vars.s[t - vars.offset],
          plot = this;

        if (sBuffer !== undefined) {
          var spins = new BoolArray(sBuffer).toSpins();

          return spins.reduce(function (sum, sI, i) {
            return plot.addNeighborsMeanSpin(sum, sI, i, spins);
          }, 0) / n;
        } else {
          return undefined;
        }
      },

      addNeighborsMeanSpin: function (sum, sI, i, spins) {
        var neighbors = this.consts.adjacencyLists[i],
          sSum = 0,
          len = neighbors.length;

        for (var k = 0; k < len; k++) {
          sSum  += spins[neighbors[k]];
        }

        return sum + sI * sSum / len;
      }
    });

  modules.add('PlotComputer', 
    'coupling ratio',
    TimePlotComputer,
    {
      getYValue: function (t, vars) {
        var n = this.consts.n,
          sBuffer = vars.s[t - vars.offset],
          sSum = vars.sSum[t - vars.offset],
          adjacencyLists = this.consts.adjacencyLists,
          j = this.consts.modelSettings.parameters.j,
          alpha = this.consts.modelSettings.parameters.alpha,
          plot = this;

        if (sBuffer !== undefined) {
          var spins = new BoolArray(sBuffer).toSpins(),
            len = spins.length;

          if (sSum === undefined) {
            sSum = tools.sum(spins);
          }

          var localCouplingSum = 0;

          for (var i = 0; i < len; i++) {
            var neighbors = adjacencyLists[i],
              neighborsSSum = 0,
              len2 = neighbors.length;

            for (var k = 0; k < len2; k++) {
              neighborsSSum += spins[neighbors[k]];
            }

            localCouplingSum += Math.abs(neighborsSSum);
          }

          var ratio = Math.abs((alpha * sSum) / (j * localCouplingSum));

          if (isFinite(ratio)) {
            return ratio;
          } else {
            return NaN;
          }
        } else {
          return undefined;
        }
      }
    });

  /*modules.add('PlotComputer', 
    'time averaged site-by-site correlation',
    AutoCorrelationPlotComputer,
    {
      customConstructor: function (consts) {
        consts.distanceLists = spimosimCore.getDistanceLists(consts.adjacencyLists,
          consts.maxDistance);

        this.nodeOffset = this.consts.width * this.consts.dy + this.consts.dx;

        MultiSeriesTimePlotComputer.call(this, consts, consts.points + 1);
      },

      getCorrelations: function (t, vars) {
        var sBuffer = vars.s[t - vars.offset],

          n = this.consts.n,

          correlations = [],

          i, indexJ,
          neighbors, numberOfNeighbors,

          inSpin, outSpin,
          inSum = 0,
          outSum = 0,
          crossSum = 0,
          counter = 0;

        if (sBuffer !== undefined) {
          var spins = new BoolArray(sBuffer).toSpins();

          for (var r = 0; r < maxDistance; r++) {
            inSum = 0;
            outSum = 0;
            crossSum = 0;
            counter = 0;

            for (i = 0; i < n; i++) {
              neighbors = distanceLists[i][r];

              if (neighbors !== undefined) {
                numberOfNeighbors = neighbors.length;

                outSpin = spins[i];
                outSum += numberOfNeighbors * outSpin;
                counter += numberOfNeighbors;

                for (indexJ = 0; indexJ < numberOfNeighbors; indexJ++) {
                  inSpin = spins[neighbors[indexJ]];
                  inSum += inSpin;
                  crossSum +=  inSpin * outSpin;
                }
              }
            }

            correlations.push(crossSum / counter -
              inSum * outSum / counter / counter);
          }
        } else {
          for (var r = 0; r < n; r++) {
            correlations.push(NaN);
          }
        }

        return correlations;
      }
    }
  );*/

  modules.add('PlotComputer', 
    'euclid site-by-site correlation',
    AutoCorrelationPlotComputer,
    {
      customConstructor: function (consts) {
        var n = consts.n,
          width = consts.width,
          height = consts.height,
          max = Math.min(width, height) >> 1,
          x, y;

        var coords = {},
          dist, offset

        for (var i = 0; i <= max; i++) {
          for (var j = -max; j <= max; j++) {
            dist = Math.sqrt(i * i + j * j);
            offset = i * width + j;
            if (offset > 0) {
              if (coords[dist] === undefined) {
                coords[dist] = [ offset ];
              } else {
                coords[dist].push(offset);
              }
            }
          }
        }

        this.distances = consts.distances;
        this.coords = [];
        for (var i = 0, len = this.distances.length; i < len; i++) {
          this.coords.push(coords[this.distances[i]]);
        }

        MultiSeriesTimePlotComputer.call(this, consts, this.distances.length + 1);
      },

      fitExp: function (correlations) {
        var len = correlations.length,
          dataX = new Float64Array(len);

        var positiveLength = 0;

        while (correlations[positiveLength] > 0) {
          positiveLength++;
        }

        var halfIndex = positiveLength >> 1,
          earlierHalfProduct = 1,
          laterHalfProduct = 1;

        for (var i = 0; i < halfIndex; i++) {
          earlierHalfProduct *= correlations[i];
        }

        for (var i = halfIndex; i < positiveLength; i++) {
          laterHalfProduct *= correlations[i];
        }

        var guess = [
            correlations[0],
            (Math.log(laterHalfProduct) / halfIndex -
              Math.log(earlierHalfProduct) / (positiveLength - halfIndex)) /
              (positiveLength / 2)
          ],
          fit = tools.fitLeastSquares.exponential(this.distances, correlations, guess);

        var alpha = -1 / fit.solution[1];
        if (alpha > 0) {
          return alpha;
        } else {
          return NaN;
        }
      },

      getCorrelations: function (t, vars) {
        var sBuffer = vars.s[t - vars.offset],
          sSum = vars.sSum[t - vars.offset],
          n = this.consts.n,
          len = this.distances.length,
          width = this.consts.width,
          height = this.consts.height,
          correlations = [],
          outSpin, inSpin;

        if (sBuffer !== undefined) {
          var spins = new BoolArray(sBuffer).toSpins();
          if (sSum === undefined) {
            sSum = tools.sum(spins);
          }

          for (var i = 0; i < len; i++) {
            var coords = this.coords[i],
              len2 = coords.length,
              crossSum = 0;

            for (var j = 0; j < n; j++) {
              outSpin = spins[j];
              for (var k = 0; k < len2; k++) {
                inSpin = spins[(j + coords[k] + n) % n];
                crossSum += inSpin * outSpin;
              }
            }

            correlations.push(crossSum / len2 / n - sSum * sSum / n / n);
          }
        } else {
          for (var r = 0; r < len; r++) {
            correlations.push(NaN);
          }
        }

        return correlations;
      },
    }
  );

  modules.add('PlotComputer', 
    'site-by-site correlation',
    AutoCorrelationPlotComputer,
    {
      customConstructor: function (consts) {
        consts.distanceLists = spimosimCore.getDistanceLists(consts.adjacencyLists,
          consts.maxDistance);

        MultiSeriesTimePlotComputer.call(this, consts, consts.maxDistance + 1);
      },

      getCorrelations: function (t, vars) {
        var sBuffer = vars.s[t - vars.offset],

          n = this.consts.n,
          maxDistance = this.consts.maxDistance,
          distanceLists = this.consts.distanceLists,

          correlations = [],

          i, indexJ,
          neighbors, numberOfNeighbors,

          inSpin, outSpin,
          inSum = 0,
          outSum = 0,
          crossSum = 0,
          counter = 0;

        if (sBuffer !== undefined) {
          var spins = new BoolArray(sBuffer).toSpins();

          for (var r = 0; r < maxDistance; r++) {
            inSum = 0;
            outSum = 0;
            crossSum = 0;
            counter = 0;

            for (i = 0; i < n; i++) {
              neighbors = distanceLists[i][r];

              if (neighbors !== undefined) {
                numberOfNeighbors = neighbors.length;

                outSpin = spins[i];
                outSum += numberOfNeighbors * outSpin;
                counter += numberOfNeighbors;

                for (indexJ = 0; indexJ < numberOfNeighbors; indexJ++) {
                  inSpin = spins[neighbors[indexJ]];
                  inSum += inSpin;
                  crossSum +=  inSpin * outSpin;
                }
              }
            }

            correlations.push(crossSum / counter -
              inSum * outSum / counter / counter);
          }
        } else {
          for (var r = 0; r < n; r++) {
            correlations.push(NaN);
          }
        }

        return correlations;
      }
    }
  );

  function getFlips(sNow, sThen, flips) {
    var flipsArray = flips.uint8Array,
      sNowArray = sNow.uint8Array,
      sThenArray = sThen.uint8Array;

    for (var i = 0, len = flips.byteLength; i < len; i++) {
      flipsArray[i] = sThenArray[i] ^ sNowArray[i];
    }
  }

  modules.add('PlotComputer', 
    'per spin time correlation',
    AutoCorrelationPlotComputer,
    {
      customConstructor: function (consts) {
        var n = consts.n;

        MultiSeriesTimePlotComputer.call(this, consts, consts.maxTimeStep + 1);
      },

      getCorrelations: function (t, vars) {
        var offset = vars.offset,

          sNowBuffer = vars.s[t - offset],
          sThen, sThenBuffer,

          sSumNow = vars.sSum[t - offset],
          sSumThen,
          crossSum,

          n = this.consts.n,
          maxTimeStep = this.consts.maxTimeStep,

          correlations = [];

        if (sNowBuffer !== undefined) {
          var sNow = new BoolArray(sNowBuffer).toSpins();

          if (sSumNow === undefined) {
            sSumNow = tools.sum(spinsNow);
          }

          for (var timeStep = 1; timeStep <= maxTimeStep; timeStep++) {
            sThenBuffer = vars.s[t - offset - timeStep];
            sSumThen = vars.sSum[t - offset - timeStep];

            if (sThenBuffer !== undefined) {
              sThen = new BoolArray(sThenBuffer).toSpins();

              if (sSumThen === undefined) {
                sSumThen = tools.sum(sThen);
              }

              crossSum = 0;
              for (var i = 0; i < n; i++) {
                crossSum += sNow[i] * sThen[i];
              }

              correlations.push(crossSum / n - sSumNow * sSumThen / n / n);
            } else {
              correlations.push(NaN);
            }
          }
        } else {
          for (var timeStep = 1; timeStep <= maxTimeStep; timeStep++) {
            correlations.push(NaN);
          }
        }

        return correlations;
      }
    }
  );

  modules.add('PlotComputer', 
    'per spin flip time correlation',
    AutoCorrelationPlotComputer,
    {
      customConstructor: function (consts) {
        this.flipsNow = new BoolArray(consts.n);
        this.flipsThen = new BoolArray(consts.n);

        MultiSeriesTimePlotComputer.call(this, consts, consts.maxTimeStep + 1);
      },

      getCorrelations: function (t, vars) {
        var offset = vars.offset,

          sNowBuffer = vars.s[t - offset],
          sThenBuffer = vars.s[t - offset - 1],

          flipsArray = this.flipsArray,
          flipsNow = this.flipsNow,
          flipsThen = this.flipsThen,

          flipsSumNow,
          flipsSumThen,
          crossSum,

          n = this.consts.n,
          maxTimeStep = this.consts.maxTimeStep,

          correlations = [];

        if (sNowBuffer !== undefined && sThenBuffer !== undefined) {
          getFlips(new BoolArray(sNowBuffer), new BoolArray(sThenBuffer),
            flipsNow);

          flipsSumNow = 0;
          flipsNow.forEach(function (flipNow) {
              flipsSumNow += flipNow;
            });

          for (var timeStep = 1; timeStep <= maxTimeStep; timeStep++) {
            sNowBuffer = vars.s[t - offset - timeStep];
            sThenBuffer = vars.s[t - offset - timeStep - 1];

            if (sNowBuffer !== undefined && sThenBuffer !== undefined) {
              getFlips(new BoolArray(sNowBuffer), new BoolArray(sThenBuffer),
                flipsThen);


              flipsSumThen = 0;
              flipsThen.forEach(function (flipThen) {
                  flipsSumThen += flipThen;
                });

              crossSum = 0;
              flipsNow.forEach2(function (flipNow, flipThen) {
                  crossSum += flipNow * flipThen;
                }, 0, flipsThen);

              correlations.push(crossSum / n -
                flipsSumNow * flipsSumThen / n / n);
            } else {
              correlations.push(NaN);
            }
          }
        } else {
          for (var timeStep = 1; timeStep <= maxTimeStep; timeStep++) {
            correlations.push(NaN);
          }
        }

        return correlations;
      }
    }
  );
}());
