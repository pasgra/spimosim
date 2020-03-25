(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;
  var WebGLVideo = spimosimCore.modules.get('Video', 'webgl');
  spimosimUi.colorSet.PARTICLES_BG = '#5577ff';
  spimosimUi.colorSet.BOUNDARY_COLOR = '#ffffffff';
  spimosimUi.colorSet.CELL_CENTERS = '#ffffffff';

  function ParticlesVideo(initializer, config, videoSection, colorSet) {
    WebGLVideo.call(this, initializer, config, videoSection, colorSet);

    this.positionsArray = new Float32Array(0);

    this.bufferPositionsX = this.ctx.createBuffer();
    this.bufferNormalsX = this.ctx.createBuffer();
    this.bufferPositionsY = this.ctx.createBuffer();
    this.bufferNormalsY = this.ctx.createBuffer();
    this.bufferPositionsZ = this.ctx.createBuffer();
    this.bufferNormalsZ = this.ctx.createBuffer();
    
    this.bufferPointPositions = this.ctx.createBuffer();
    this.bufferPointColors = this.ctx.createBuffer();
  }
  ParticlesVideo.prototype = Object.create(WebGLVideo.prototype);

  ParticlesVideo.prototype.initGui = function () {
    var box = WebGLVideo.prototype.initGui.call(this);
    this.domCache.divVideo.classList.add('particles-video');
    return box;
  }

  var LATTICE_RESOLUTION = 256;

  ParticlesVideo.prototype.getStrips = function (varNameDep, varNameIndi1, varNameIndi2, fnString, indi1Max, indi2Max, positionsBuffer, normalsBuffer) {
    var gl = this.ctx;
    
    var parameters = this.simulation.modelSettings.parameters;
    
    var strips = [];
    var normals = [];
    var functions = [];
    var functionStrings = fnString.split('\n');

    if (fnString.length === 0) {
      functionStrings = [];
    }

    for (var i = 0; i < functionStrings.length; i++) {
      try {
        var fn = new Function(varNameIndi1, varNameIndi2,
          '"use strict";' +
          tools.LOAD_MATH_IN_SCOPE +
          'return ' + functionStrings[i] + ';');

        fn(0.5, 0.5);
        functions.push(fn);
      } catch (e) {}
    }

    for (var i = 0; i < functions.length; i++) {
      try {
        var tmp = generateLattice(LATTICE_RESOLUTION, LATTICE_RESOLUTION, indi1Max, indi2Max, functions[i], varNameDep);

        strips = strips.concat(tmp.strips);
        normals = normals.concat(tmp.normals);
      } catch (e) {}
    }
    
    var n = strips.length;
    var len = 0;
    for (var i = 0; i < n; i++) {
      len += strips[i].length;
    }

    var lengths = new Uint32Array(n);
    var allStrips = new Float32Array(len);
    var allNormals = new Float32Array(len);
    var p = 0;
    for (var i = 0; i < n; i++) {
      allStrips.set(strips[i], p);
      allNormals.set(normals[i], p);

      lengths[i] = strips[i].length / 3;
      p += strips[i].length;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, allNormals, gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, allStrips, gl.STATIC_DRAW);

    return lengths;
  };
  
  ParticlesVideo.prototype.updateStrips = function () {
    var parameters = this.simulation.modelSettings.parameters;
    var gl = this.ctx;

    if (this.shownBoundariesX !== parameters.boundariesX) {
      this.stripLengthsX = this.getStrips('x', 'y', 'z', parameters.boundariesX, parameters.yMax, parameters.zMax, this.bufferPositionsX, this.bufferNormalsX);
      this.shownBoundariesX = parameters.boundariesX;
    }

    if (this.shownBoundariesY !== parameters.boundariesY) {
      this.stripLengthsY = this.getStrips('y', 'z', 'x', parameters.boundariesY, parameters.zMax, parameters.xMax, this.bufferPositionsY, this.bufferNormalsY);
      this.shownBoundariesY = parameters.boundariesY;
    }

    if (this.shownBoundariesZ !== parameters.boundariesZ) {
      this.stripLengthsZ = this.getStrips('z', 'x', 'y', parameters.boundariesZ, parameters.xMax, parameters.yMax, this.bufferPositionsZ, this.bufferNormalsZ);
      this.shownBoundariesZ = parameters.boundariesZ;
    }
  };

  ParticlesVideo.prototype.drawScene = function (t, protocol) {
    var gl = this.ctx;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    
    gl.viewport(0, 0, this.width, this.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    this.zoomMatrix[5] = this.zoomMatrix[0] / this.height * this.width;

    this.drawPoints(t, protocol);
    this.drawBoundaries(t, protocol);
  };
    
    
  ParticlesVideo.prototype.drawBoundaries = function (t, protocol) {
    var gl = this.ctx;
    this.useProgram('vertexDefault');
    
    this.updateStrips();

    
    gl.uniformMatrix4fv(this.locations.vertexDefault.uniforms.uPMatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(this.locations.vertexDefault.uniforms.uZoomMatrix, false, this.zoomMatrix);
    gl.uniformMatrix4fv(this.locations.vertexDefault.uniforms.uMVMatrix, false, this.mvMatrix);
    gl.uniform3fv(this.locations.vertexDefault.uniforms.uLightDirection,        new Float32Array([  .5, .75, 0]));
    gl.uniform3fv(this.locations.vertexDefault.uniforms.uAmbientLightColor,     new Float32Array([ .3, .3, .3]));
    gl.uniform3fv(this.locations.vertexDefault.uniforms.uDirectionalLightColor, new Float32Array([ .6, .6, .6]));
    gl.uniform4fv(this.locations.vertexDefault.uniforms.uVertexColor,           new Float32Array([ 1, 1, 1, 1]));
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPositionsX);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalsX);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    
    var p = 0;
    for (var i = 0; i < this.stripLengthsX.length; i++) {
      var len = this.stripLengthsX[i];
      gl.drawArrays(gl.TRIANGLE_STRIP, p, len);
      p += len;
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPositionsY);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalsY);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    
    var p = 0;
    for (var i = 0; i < this.stripLengthsY.length; i++) {
      var len = this.stripLengthsY[i];
      gl.drawArrays(gl.TRIANGLE_STRIP, p, len);
      p += len;
    }


    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPositionsZ);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferNormalsZ);
    gl.vertexAttribPointer(this.locations.vertexDefault.attributes.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    
    var p = 0;
    for (var i = 0; i < this.stripLengthsZ.length; i++) {
      var len = this.stripLengthsZ[i];
      gl.drawArrays(gl.TRIANGLE_STRIP, p, len);
      p += len;
    }
  };

  ParticlesVideo.prototype.drawPoints = function (t, protocol) {
    var gl = this.ctx;
    this.useProgram('pointsDefault');

    var drawMode = this.drawModes[this.drawMode];

    var x = protocol.get(drawMode.xVarName, t);
    var y = protocol.get(drawMode.yVarName, t);
    var z = protocol.get(drawMode.zVarName, t);
    var n = x.length;

    if (this.particlePixels.length !== n) {
      this.particlePixels = new Int32Array(n);
    }

    if (drawMode.draw) {
      DynamicVideo.prototype.drawFrameInImageData.call(this, this.particlePixels, protocol, t, this.drawMode);
    } else {
      for (var i = 0, len = this.particlePixels.length; i < len; i++) {
        this.particlePixels[i] = this.colorSet.CELL_CENTERS;
      }
    }

    if (this.positionsArray.length !== 3 * n) {
      if (this.positionsArray.buffer.byteLength / 4 < 3 * n) {
        this.positionsArray = new Float32Array(3 * n);
      } else {
        this.positionsArray = new Float32Array(this.positionsArray.buffer).subarray(0, 3 * n);
      }
    }

    for (var i = 0; i < n; i++) {
      this.positionsArray[3 * i + 0] = x[i];
      this.positionsArray[3 * i + 1] = y[i];
      this.positionsArray[3 * i + 2] = z[i];
    }
    
    gl.uniformMatrix4fv(this.locations.pointsDefault.uniforms.uPMatrix, false, this.pMatrix);
    gl.uniformMatrix4fv(this.locations.pointsDefault.uniforms.uZoomMatrix, false, this.zoomMatrix);
    gl.uniformMatrix4fv(this.locations.pointsDefault.uniforms.uMVMatrix, false, this.mvMatrix);

    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPointColors);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(new Uint8Array(this.particlePixels.buffer)), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPointColors);
    gl.vertexAttribPointer(this.locations.pointsDefault.attributes.aVertexColor, 4, gl.FLOAT, false, 0, 0);
    

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPointPositions);
    gl.bufferData(gl.ARRAY_BUFFER, this.positionsArray, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferPointPositions);
    gl.vertexAttribPointer(this.locations.pointsDefault.attributes.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    

    gl.drawArrays(gl.POINTS, 0, n);
  }
  
  ParticlesVideo.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);
    this.particlePixels = new Int32Array(simulation.modelSettings.n);
    this.updateDims();
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
        return [];
      }
    }

    return functions;
  }

  function generateLattice(nx, ny, xMax, yMax, f, varName) {
    var n = 2 * (ny + 1) * 3;
    var c0, c1, c2;
    switch (varName) {
      case 'x':
        c0 = 1;
        c1 = 2;
        c2 = 0;
        break;
      case 'y':
        c0 = 2;
        c1 = 0;
        c2 = 1;
        break;
      case 'z':
        c0 = 0;
        c1 = 1;
        c2 = 2;
        break;
    }
    
    var strips = [];
    for (var x = 0; x < nx; x++) {
      var points = new Float32Array(n);

      for (var y = 0; y <= n; y++) {
        points[6 * y + c0] = x / nx * xMax;
        points[6 * y + c1] = y / ny * yMax;
        points[6 * y + c2] = f(x / nx * xMax, y / ny * yMax);
        
        points[6 * y + 3 + c0] = (x + 1) / nx * xMax;
        points[6 * y + 3 + c1] = y / ny * yMax;
        points[6 * y + 3 + c2] = f((x + 1) / nx * xMax, y / ny * yMax);
      }
      
      lastInvalid = -1;
      for (var i = 0;; i++) {
        if ((!isFinite(points[3 * i + c2])) || i === n) {
          if (i - lastInvalid >= 4) {
            strips.push(points.subarray(3 * lastInvalid + 3, 3 * i));
          }
          if (i === n) {
            break;
          }
          lastInvalid = i;
        }
      }
    }

    var normalStrips = [];
    for (var i = 0, len = strips.length; i < len; i++) {
      var strip = strips[i];
      var normals = [];
      normalStrips.push(normals);
      for (var j = 0, len2 = strip.length; j < len2; j += 3) {
        var x = strip[j + c0];
        var y = strip[j + c1];
        var z = strip[j + c2];
        var fxy = f(x, y);
        
        var dfdx = (f(x + 1e-6, y) - fxy) / 1e-6;
        if (!isFinite(dfdx)) {
          dfdx = (fxy - f(x - 1e-6, y)) / 1e-6;
        }
        
        var dfdy = (f(x, y + 1e-6) - fxy) / 1e-6;
        if (!isFinite(dfdy)) {
          dfdy = (fxy - f(x, y - 1e-6)) / 1e-6;
        }
        
        var normal = WebGLVideo.getNormal(0, 0, 0, 1, 0, dfdx, 0, 1, dfdy);
        normals[j + c0] = normal[0];
        normals[j + c1] = normal[1];
        normals[j + c2] = normal[2];
      }
    }

    return {
      strips: strips,
      normals: normalStrips
    };
  }

  spimosimCore.modules.add('Video', 'particles', ParticlesVideo);
  
  
  function create1SpinModulusGreyScaleDrawFrame(colorSet, varNames, minValue, maxValue) {
    var diff = maxValue - minValue, m, b;
    switch (tools.ENDIAN) {
      case 'big':
        m = (1 + (1 << 8) + (1 << 16)) << 8;
        b = (1 << 8) - 1;
        break;
      case 'little':
        m = 1 + (1 << 8) + (1 << 16);
        b = ((1 << 8) - 1) << 24;
        break;
    }

    var v2 = new Float32Array(2e5);
    return function (pixels, protocol, t, offset) {
      var v_arrays = [];
      for (var i = 0, len = varNames.length; i < len; i++) {
        v_arrays.push(protocol.get(varNames[i], t));
      }
      
      var dims = v_arrays.length;
      var n = v_arrays[0].length;
      for (var d = 0; d < dims; d++) {
        var v_array = v_arrays[d];
        for (var i = 0; i < n; i++) {
          var vi = v_array[i];
          v2[i] += vi * vi;
        }
      }

      for (var i = 0; i < n; i++) {
        pixels[i] = m * ~~((Math.sqrt(v2[i]) - minValue) * 255 / diff) + b;
      };
    };
  }

  spimosimCore.modules.add('createDrawModes', 'particles', function (config, colorSet) {
    return [
      {
        xVarName: 'x',
        yVarName: 'y',
        zVarName: 'z',
        draw: create1SpinModulusGreyScaleDrawFrame(colorSet, config.velocityVars, config.minValue, config.maxValue),
        text: 'velocity'
      },
      {
        xVarName: 'x',
        yVarName: 'y',
        zVarName: 'z',
        draw: spimosimCore.modules.get('createDrawModes', 'int map')({
          minValues: [-1],
          names: [ config.statusVar ],
          labelTexts: [ 'status' ],
        }, colorSet)[0].draw,
        text: 'status'
      },
      
      {
        xVarName: 'cellCentersX',
        yVarName: 'cellCentersY',
        zVarName: 'cellCentersZ',
        text: 'cell centers'
      },

    ];
  });
  
}());

