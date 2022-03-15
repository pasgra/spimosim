'use strict';

function DSMCModel(settings) {
  this.changeSettings(settings, true); 
};

DSMCModel.prototype.changeSettings = function (settings, restart) {
  var n = settings.parameters.n;

  if (!this.settings || this.settings.parameters.n !== n) {
    this.x = new Float64Array(n);
    this.y = new Float64Array(n);
    this.z = new Float64Array(n);
    this.vx = new Float64Array(n);
    this.vy = new Float64Array(n);
    this.vz = new Float64Array(n);
    
    this.cell = new Float64Array(n);
    this.status = new Float64Array(n);
    for (var i = 0; i < n; i++) {
      this.x[i] = Math.random() * settings.parameters.dt;
      this.y[i] = Math.random() * settings.parameters.yMax;
      this.z[i] = Math.random() * settings.parameters.zMax;
      
      this.vx[i] = .2 * (Math.random() + .5);
      this.vy[i] = .2 * (Math.random() - .5);
      this.vz[i] = .2 * (Math.random() - .5);
    }
  } else {
    if (this.settings.parameters.xMax > settings.parameters.xMax) {
      for (var i = 0; i < n; i++) {
        this.x[i] = Math.min(this.x[i], settings.parameters.xMax - 1e-12);
      }
    }
    if (this.settings.parameters.yMax > settings.parameters.yMax) {
      for (var i = 0; i < n; i++) {
        this.y[i] = Math.min(this.y[i], settings.parameters.yMax - 1e-12);
      }
    }
    if (this.settings.parameters.zMax > settings.parameters.zMax) {
      for (var i = 0; i < n; i++) {
        this.z[i] = Math.min(this.z[i], settings.parameters.zMax - 1e-12);
      }
    }
  }
    
  var L = Math.pow(settings.parameters.xMax * settings.parameters.yMax * settings.parameters.zMax * settings.parameters.mpc / n, 1/3); // wanted cell length
  this.nx = 10 * Math.max(1, Math.floor(settings.parameters.xMax / L));
  this.ny = 10 * Math.max(1, Math.floor(settings.parameters.yMax / L));
  this.nz = 10 * Math.max(1, Math.floor(settings.parameters.zMax / L));
  this.Lx = settings.parameters.xMax / this.nx;
  this.Ly = settings.parameters.yMax / this.ny;
  this.Lz = settings.parameters.zMax / this.nz;
  var numElements = this.nx * this.ny * this.nz;
  var numCenters = Math.ceil(n / settings.parameters.mpc);

  this.elementToCell = new Uint32Array(numElements);
  this.cellCentersX = new Float32Array(numCenters);
  this.cellCentersY = new Float32Array(numCenters);
  this.cellCentersZ = new Float32Array(numCenters);

  var x = 0, y = 0, z = 0;
  for (var i = 0; i < numCenters; i++) {
    this.cellCentersX[i] = 10 * this.Lx * (.5 + i % (this.nx / 10));
    this.cellCentersY[i] = 10 * this.Ly * (.5 + Math.floor(i / this.nx * 10) % (this.ny / 10));
    this.cellCentersZ[i] = 10 * this.Lz * (.5 + Math.floor(i / this.nx / this.ny * 100) % (this.nz / 10));
  }

  this.boundariesX = createFunctions(settings.parameters, 'boundariesX', 'y', 'z');
  this.boundariesY = createFunctions(settings.parameters, 'boundariesY', 'z', 'x');
  this.boundariesZ = createFunctions(settings.parameters, 'boundariesZ', 'x', 'y');
  
  this.calcElementToCell();

  for (var i = 0; i < numElements; i++) {
    this.cell[i] = this.getCell(this.x[i], this.y[i], this.z[i]);
  }


  this.lastCollision = -1;
  this.settings = settings;
};


DSMCModel.prototype.getCell = function (x, y, z) {
  var element = Math.floor(x / this.Lx) + this.nx * Math.floor(y / this.Ly) + this.nx * this.ny * Math.floor(z / this.Lz);
  return this.elementToCell[element];
};


DSMCModel.prototype.calcElementToCell = function () {
  var element,
    x, y, z,
    cx, cy, cz,
    dx, dy, dz,
    distance2, minDistance2,
    numCells = this.cellCentersX.length;
  for (var ix = 0; ix < this.nx; ix++) {
    for (var iy = 0; iy < this.ny; iy++) {
      for (var iz = 0; iz < this.nz; iz++) {
        x = ix * this.Lx;
        y = iy * this.Ly;
        z = iz * this.Lz;
        minDistance2 = Infinity;
        for (var j = 0; j < numCells; j++) {
          cx = this.cellCentersX[j];
          cy = this.cellCentersY[j];
          cz = this.cellCentersZ[j];
          dx = x - cx;
          dy = y - cy;
          dz = z - cz;
          distance2 = dx * dx + dy * dy + dz * dz;

          if (distance2 < minDistance2) {
            var separatedByBoundary = false;
            for (var k = 0, len = this.boundariesZ.length; k < len; k++) {
              separatedByBoundary = applyBoundary(this.boundariesZ[k], x, cx, y, cy, z, cz, 0, 0, 0);
              if (separatedByBoundary) {
                break;
              }
            }
            if (!separatedByBoundary ) {
              for (var k = 0, len = this.boundariesX.length; k < len; k++) {
                separatedByBoundary = applyBoundary(this.boundariesX[k], 1, cy, z, cz, x, cx, 0, 0, 0);
                if (separatedByBoundary) {
                  break;
                }
              }
            }
            if (!separatedByBoundary ) {
              for (var k = 0, len = this.boundariesY.length; k < len; k++) {
                separatedByBoundary = applyBoundary(this.boundariesY[k], z, cz, x, cx, y, cy, 0, 0, 0);
                if (separatedByBoundary) {
                  break;
                }
              }
            }
            
            if (!separatedByBoundary ) {
              minDistance2 = distance2;
              element = j;
            }
          }
        }
        
        this.elementToCell[ix + this.nx * iy + this.nx * this.ny * iz] = element;
      }
    }
  }
}


DSMCModel.prototype.moveCellCenters = function () {
  var numCells = this.cellCentersX.length;
  var n = this.settings.parameters.n;
  var particlesPerCell = n / numCells;
  
  var selected = new Uint8Array(n);
  var j;
  for (var i = 0; i < numCells; i++) {
    do {
      j = Math.floor(n * Math.random());
    } while (selected[j]);
    selected[j] = 1;
    this.cellCentersX[i] = this.x[j];
    this.cellCentersY[i] = this.y[j];
    this.cellCentersZ[i] = this.z[j];
  }

  this.calcElementToCell();
}

DSMCModel.prototype.moveCellCentersWithForce = function () {
  var numCells = this.cellCentersX.length;
  var forceX = new Float32Array(numCells);
  var forceY = new Float32Array(numCells);
  var forceZ = new Float32Array(numCells);
  var x, y, z, dx, dy, dz, dFx, dFy, dFz;
  var xMax = this.settings.parameters.xMax;
  var yMax = this.settings.parameters.yMax;
  var zMax = this.settings.parameters.zMax;
  
  for (var i = 0; i < numCells; i++) {
    var particlesInCell = this.cellContent[i].length + 10;
    x = this.cellCentersX[i];
    y = this.cellCentersY[i];
    z = this.cellCentersZ[i];
    
    forceX[i] += Math.min((this.Lx * this.Lx * this.Lx * this.Lx) / (x * x * x * x), 1);
    forceX[i] -= Math.min((this.Lx * this.Lx * this.Lx * this.Lx) / ((x - xMax) * (x - xMax) * (x - xMax) * (x - xMax)), 1);
    forceY[i] += Math.min((this.Ly * this.Ly * this.Ly * this.Ly) / (x * x * x * x), 1);
    forceY[i] -= Math.min((this.Ly * this.Ly * this.Ly * this.Ly) / ((y - xMax) * (y - xMax) * (y - xMax) * (y - xMax)), 1);
    forceZ[i] += Math.min((this.Lz * this.Lz * this.Lz * this.Lz) / (x * x * x * x), 1);
    forceZ[i] -= Math.min((this.Lz * this.Lz * this.Lz * this.Lz) / ((z - xMax) * (z - xMax) * (z - xMax) * (z - xMax)), 1);
    for (var j = 0; j < numCells; j++) {
      if (i !== j) {
        dx = (this.cellCentersX[j] - x) / this.Lx;
        dy = (this.cellCentersY[j] - y) / this.Ly;
        dz = (this.cellCentersZ[j] - z) / this.Lz;
        if (Math.abs(dx) > .1) {
          forceX[j] += Math.max(Math.min(1 / (particlesInCell * dx * Math.abs(dx)), 1), -1);
        }
        if (Math.abs(dy) > .1) {
          forceY[j] += Math.max(Math.min(1 / (particlesInCell * dy * Math.abs(dy)), 1), -1);
        }
        if (Math.abs(dz) > .1) {
          forceZ[j] += Math.max(Math.min(1 / (particlesInCell * dz * Math.abs(dz)), 1), -1);
        }
      }
    }
  }

  for (var i = 0; i < numCells; i++) {
    var factor = .05 / (this.cellContent[i].length + 10);
    this.cellCentersX[i] = Math.min(Math.max(0, this.cellCentersX[i] + forceX[i] * factor), xMax);
    this.cellCentersY[i] = Math.min(Math.max(0, this.cellCentersY[i] + forceY[i] * factor), yMax);
    this.cellCentersZ[i] = Math.min(Math.max(0, this.cellCentersZ[i] + forceZ[i] * factor), zMax);
  }
  this.calcElementToCell();
}


function createFunctions(parameters, parameterName, varName1, varName2) {
  if (parameters[parameterName].length === 0) {
    return [];
  }

  var functions = [];
  var functionStrings = parameters[parameterName].split('\n');
  for (var i = 0; i < functionStrings.length; i++) {
    try {
      var fn = new Function(varName1, varName2,
        '"use strict";' +
        tools.LOAD_MATH_IN_SCOPE +
        'return ' + functionStrings[i] + ';');

      fn(0.5, 0.5);
      functions.push(fn);
    } catch (e) {
      throw {
        invalidParameter: parameterName,
        invalidParameterMsg: e.toString()
      };
    }
  }

  return functions;
}

//http://homepage.univie.ac.at/franz.vesely/cp_tut/nol2h/new/c8hd_s4dsm.html
DSMCModel.prototype.step = function (varsToSave, t) { // n times updates a random spins
  if (this.settings.parameters.adaptCellCenterPositions && t % this.settings.parameters.cellCenterMoveInterval === 0) {
    this.moveCellCentersWithForce();
  }
  
  var collisions = 0;
  collisions += this.move();
  collisions += this.collide();

  var vSum = 0;
  for (var i = 0, n = this.settings.parameters.n; i < n; i++) {
    vSum += Math.sqrt(this.vx[i] * this.vx[i] + this.vy[i] * this.vy[i] + this.vz[i] * this.vz[i]);
  }

  this.vMean = vSum / this.settings.parameters.n;

  if (collisions > 0) {
    this.meanFreePath = vSum * this.settings.parameters.dt / collisions;
    this.lastCollision = t;
  } else {
    this.meanFreePath = (t - this.lastCollision) * vSum * this.settings.parameters.dt;
  }
};

DSMCModel.prototype.move = function () { // n times updates a random spins
  var dt = this.settings.parameters.dt;
  var nx = this.nx, ny = this.ny, nz = this.nz;
  var Lx = this.Lx, Ly = this.Ly, Lz = this.Lz;
  var xMax = this.settings.parameters.xMax;
  var yMax = this.settings.parameters.yMax;
  var zMax = this.settings.parameters.zMax;
  var xMaxOpen = this.settings.parameters.xMaxOpen;
  var yMaxOpen = this.settings.parameters.yMaxOpen;
  var zMaxOpen = this.settings.parameters.zMaxOpen;
  var xMinOpen = this.settings.parameters.xMinOpen;
  var yMinOpen = this.settings.parameters.yMinOpen;
  var zMinOpen = this.settings.parameters.zMinOpen;
  var n = this.settings.parameters.n;
  var x1, y1, z1, x2, y2, z2, vx1, vy1, vz1, cell;
  this.cellContent = [];
  for (var i = 0, len = this.cellCentersX.length; i < len; i++) {
    this.cellContent[i] = [];
  }
  
  var collisions = 0;

  for (var i = 0; i < n; i++) {
    this.status[i] = 0;
    x1 = this.x[i];
    y1 = this.y[i];
    z1 = this.z[i];
    vx1 = this.vx[i];
    vy1 = this.vy[i];
    vz1 = this.vz[i];
    
    x2 = x1 + dt * vx1;
    y2 = y1 + dt * vy1;
    z2 = z1 + dt * vz1;
    var hit = false;
    for (var j = 0, len = this.boundariesZ.length; j < len; j++) {
      hit = applyBoundary(this.boundariesZ[j], x1, x2, y1, y2, z1, z2, vx1, vy1, vz1);
      if (hit) {
        this.vx[i] = hit[0];
        this.vy[i] = hit[1];
        this.vz[i] = hit[2];
        this.status[i] += 2;
        break;
      }
    }
    if (!hit) {
      for (var j = 0, len = this.boundariesX.length; j < len; j++) {
        hit = applyBoundary(this.boundariesX[j], y1, y2, z1, z2, x1, x2, vy1, vz1, vx1);
        if (hit) {
          this.vy[i] = hit[0];
          this.vz[i] = hit[1];
          this.vx[i] = hit[2];
          this.status[i] += 2;
          break;
        }
      }
    }
    if (!hit) {
      for (var j = 0, len = this.boundariesY.length; j < len; j++) {
        hit = applyBoundary(this.boundariesY[j], z1, z2, x1, x2, y1, y2, vz1, vx1, vy1);
        if (hit) {
          this.vz[i] = hit[0];
          this.vx[i] = hit[1];
          this.vy[i] = hit[2];
          this.status[i] += 2;
          break;
        }
      }
    }

    if (!hit) {
      if ((x2 > xMax) && xMaxOpen || (x2 < 0) && xMinOpen || (y2 > yMax) && yMaxOpen || (y2 < 0) && yMinOpen || (z2 > zMax) && zMaxOpen || (z2 < 0) && zMinOpen) {
        x2 = 0.2 * Math.random() * dt;
        y2 = Math.random() * yMax;
        z2 = Math.random() * zMax;
        this.vx[i] = .2 * (Math.random() + .5);
        this.vy[i] = .2 * (Math.random() - .5);
        this.vz[i] = .2 * (Math.random() - .5);
      } else {
        if (x2 > xMax && !xMaxOpen || x2 < 0 && !xMinOpen) {
          x2 = x1;
          this.vx[i] *= -1;
        }

        if (y2 > yMax && !yMaxOpen || y2 < 0 && !yMinOpen) {
          y2 = y1;
          this.vy[i] *= -1;
          hit = true;
        }

        if (z2 > zMax && ! zMaxOpen || z2 < 0 && !zMinOpen) {
          z2 = z1;
          this.vz[i] *= -1;
          hit = true;
        }
      }

      this.x[i] = x2;
      this.y[i] = y2;
      this.z[i] = z2;
    }
    
    
    cell = this.getCell(x1, y1, z1);
    this.cellContent[cell].push(i);
    this.cell[i] = cell;

    if (hit) {
      collisions++;
    }
  }

  return collisions;
};

var d = 1e-7;
function applyBoundary(f, x1, x2, y1, y2, z1, z2, vx1, vy1, vz1) {
  var f1 = f(x1, y1) - z1;
  var f2 = f(x2, y2) - z2;
  if (f1 * f2 < 0) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var p = f1 / (1 - (f2 - f1) / Math.sqrt(dx * dx + dy * dy));

    var x0 = x1 + dx * p;
    var y0 = y1 + dy * p;
    
    var ddxf = (f(x0 + d, y0) - f(x0, y0)) / d;
    if (!isFinite(ddxf)) {
      ddxf = (f(x0, y0) - f(x0 - d, y0)) / d;
    }

    var ddyf = (f(x0, y0 + d) - f(x0, y0)) / d;
    if (!isFinite(ddyf)) {
      ddyf = (f(x0, y0) - f(x0, y0 - d)) / d;
    }
    
    if (!isFinite(ddxf) || !isFinite(ddyf)) {
      return false;
    }
    
    var c = 2 * (ddxf * vx1 + ddyf * vy1 - vz1) / (ddxf * ddxf + ddyf * ddyf + 1);
    return [
      vx1 - c * ddxf,
      vy1 - c * ddyf,
      vz1 + c
    ];
  } else {
    return false;
  }
}

DSMCModel.prototype.collide = function () { // n times updates a random spins
  var dt = this.settings.parameters.dt;
  var nx = this.nx, ny = this.ny, nz = this.nz;
  var Lx = this.Lx, Ly = this.Ly, Lz = this.Lz;
  var vMax = 2 * Math.max.apply(null, this.vx);
  var a, b, ia, ib;
  var dv, dvx, dvy, dvz;
  var r, r2, rx, ry, rz;
  var c = Math.PI * this.settings.parameters.d * this.settings.parameters.d * vMax * dt / (2 * Lx * Ly * Lz);
  
  var collisions = 0;
  
  for (var i = 0, len = this.cellContent.length; i < len; i++) {
    var content = this.cellContent[i];
    var count = content.length;
    var M = c * count * count;
    
    for (var j = 0; j < M; j++) {
      //Two random particles
      ia = Math.floor(Math.random() * count);
      ib = Math.floor(Math.random() * (count - 1));
      if (ib > ia) ib++;
      
      
      a = content[ia];
      b = content[ib];
      
      //hard sphere collision
      dvx = this.vx[a] - this.vx[b];
      dvy = this.vy[a] - this.vy[b];
      dvz = this.vz[a] - this.vz[b];
      dv = Math.sqrt(dvx * dvx + dvy * dvy + dvz * dvz);//relative velocity
      
      if (Math.random() < dv / vMax) {//Collide with probability proportional to relative velocity
        //Random position on sphere
        do {
          rx = Math.random();
          ry = Math.random();
          rz = Math.random();
          r2 = rx * rx + ry * ry + rz * rz;
        } while (r2 <= 1);
        r = Math.sqrt(r2);
        dvx = .5 * (dvx + (dvx > 0 ? 1 : -1) * dv * rx / r);
        dvy = .5 * (dvy + (dvy > 0 ? 1 : -1) * dv * ry / r);
        dvz = .5 * (dvz + (dvz > 0 ? 1 : -1) * dv * rz / r);
        
        this.vx[a] -= dvx;
        this.vx[b] += dvx;
        this.vy[a] -= dvy;
        this.vy[b] += dvy;
        this.vz[a] -= dvz;
        this.vz[b] += dvz;
        
        this.status[a] += 1;
        this.status[b] += 1;

        collisions++;
      }
    }
  }

  return collisions;
};

spimosimCore.modules.add('Model', 'Direct Simulation Monte Carlo', DSMCModel);
