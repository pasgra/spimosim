'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;
  var Video2d = spimosimCore.modules.get('Video', '2d-lattice');

  function cE(name) {
    return document.createElement(name);
  }

  function WebGLVideo(initializer, config, videoSection, colorSet) {
    Video2d.call(this, initializer, config, videoSection, colorSet);
    this.pMatrix = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
    this.zoomMatrix = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
    this.mvMatrix = new Float32Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
    this.initShaders();
  }
  WebGLVideo.prototype = Object.create(Video2d.prototype);

  WebGLVideo.prototype.initGui = function () {
    var box = Video2d.prototype.initGui.call(this);
    this.domCache.divVideo.classList.add('webgl-video');
    return box;
  }

  WebGLVideo.prototype.contextType = 'webgl';

  WebGLVideo.prototype.setBackground = function (color) {}
  
  WebGLVideo.prototype.clearBackground = function (color) {}
  
  WebGLVideo.prototype.drawMethod = 'custom';

  WebGLVideo.prototype.drawFrame = function (t) {
    this.updateDims();
    try {
      var protocol = this.simulation.protocol;

      this.drawScene(t, protocol);

      this.setFrameNotSaved(false);
      this.setFrameNotSimulated(false);
      this.setStartingSimulation(false);

      this.shownT = t;
      this.shownDrawMode = this.drawMode;
    } catch (e) {
      this.shownT = undefined;
      if (e === 'Unknown variable' || e === 'Unknown frame') {
        if (this.simulation.getTMaxCalculated() >= 0) {
          if (t <= this.simulation.getTMaxCalculated()) {
            this.shownT = t;
            this.shownDrawMode = this.drawMode;

            this.setBackground(this.colorSet.strColorSet.INVALID);
            this.setFrameNotSaved(true);
            this.setFrameNotSimulated(false);
          } else {
            this.setBackground(this.colorSet.strColorSet.NEUTRAL);

            this.setFrameNotSaved(false);
            this.setFrameNotSimulated(true);
          }
        } else {
          this.setStartingSimulation(true);
        }
      }

      throw e;
    }
  };

  WebGLVideo.prototype.initGui = function () {
    var box = Video2d.prototype.initGui.call(this);
    var player = this;
    
    this.attachEventListener({
      dispatcher: document,
      type: 'mouseup',
      callback: function (e) {
        if (player.moved && e.target === player.domCache.videoCanvas) {
          player.playPause();
        }
        player.grabX = undefined;
        player.grabY = undefined;
        player.moved = undefined;
      }
    });

    this.attachEventListener({
      dispatcher: document,
      type: 'touchend',
      callback: function (e) {
        if (player.moved) {
          player.playPause();
        }
        player.grabX = undefined;
        player.grabY = undefined;
        player.moved = undefined;
      }
    });
    
    this.attachEventListener({
      dispatcher: this.domCache.videoCanvas,
      type: 'mousedown',
      callback: function (e) {
        player.grabX = e.offsetX / player.width;
        player.grabY = 1 - e.offsetY / player.height;
        e.preventDefault();
      }
    });
    
    this.attachEventListener({
      dispatcher: this.domCache.videoCanvas,
      type: 'mousemove',
      callback: function (e) {
        if (player.grabX) {
          player.moved = true;

          var relX = e.offsetX / player.width;
          var relY = 1 - e.offsetY / player.height;
          var dx = relX - player.grabX;
          var dy = relY - player.grabY;
          
          player.grabX = relX;
          player.grabY = relY;

          if (e.shiftKey) {
            player.move(dx, dy);
          } else {
            player.rotate(dx, dy);
          }
        }
      }
    });
    
    this.attachEventListener({
      dispatcher: this.domCache.videoCanvas,
      type: 'wheel',
      callback: function (e) {
        player.zoom(Math.exp(-.005 * Math.pow(16, e.deltaMode) * (e.deltaX + e.deltaY)));
        e.preventDefault();
      }
    });

    this.attachEventListener({
      dispatcher: this.domCache.videoCanvas,
      type: 'touchstart',
      callback: function (e) {
        var rect = e.target.getBoundingClientRect();
        player.grabX0 = (e.touches[0].pageX - rect.left) / player.width;
        player.grabY0 = 1 - (e.touches[0].pageY - rect.top) / player.height;
        if (e.touches[1]) {
          player.grabX1 = (e.touches[1].pageX - rect.left) / player.width;
          player.grabY1 = 1 - (e.touches[1].pageY - rect.top) / player.height;
        } else {
          player.grabX1 = undefined;
          player.grabY1 = undefined;
        }
        e.preventDefault();
      }
    });
    
    
    this.attachEventListener({
      dispatcher: this.domCache.videoCanvas,
      type: 'touchmove',
      callback: function (e) {
        if (player.grabX0) {
          player.moved = true;
          var rect = e.target.getBoundingClientRect();
          var relX0 = (e.touches[0].pageX - rect.left) / player.width;
          var relY0 = 1 - (e.touches[0].pageY - rect.top) / player.height;
          var dx0 = relX0 - player.grabX0;
          var dy0 = relY0 - player.grabY0;
        
          if (e.touches[1]) {
            var relX1 = (e.touches[1].pageX - rect.left) / player.width;
            var relY1 = 1 - (e.touches[1].pageY - rect.top) / player.height;
            var dx1 = relX1 - player.grabX1;
            var dy1 = relY1 - player.grabY1;

            if ((dx1 - dx0) * (dx1 - dx0) + (dy1 - dy0) * (dy1 - dy0) > dx0 * dx0 + dy0 * dy0) {
              player.zoom(Math.exp(((dx1 - dx0) / (relX1 - relX0)  + (dy1 - dy0) / (relY1 - relY0))));
            } else {
              player.move((dx0 + dx1) / 2, (dy0 + dy1) / 2);
            }
            
            player.grabX0 = relX0;
            player.grabY0 = relY0;
            player.grabX1 = relX1;
            player.grabY1 = relY1;
          } else {
            player.grabX1 = undefined;
            player.grabY1 = undefined;
            player.rotate(dx0, dy0);
            player.grabX0 = relX0;
            player.grabY0 = relY0;
          }
        }
      }
    });

    return box;
  };


  WebGLVideo.prototype.move = function (dx, dy) {
    this.pMatrix[12] += 2 * dx;
    this.pMatrix[13] += 2 * dy;
    this.shownT = undefined;
  };

  WebGLVideo.prototype.rotate = function (dx, dy) {
    var sX = Math.sin(-2 * dx);
    var sY = Math.sin(2 * dy);
    var cX = Math.cos(-2 * dx);
    var cY = Math.cos(2 * dy);
    var sinX = Math.sin(dx);
    var sinX = Math.sin(dx);
    var m = this.mvMatrix;
    
    this.mvMatrix = new Float32Array([
      m[0]*cX - m[8]*sX,
      m[1]*cX - m[9]*sX,
      -m[10]*sX + m[2]*cX,
      -m[11]*sX + m[3]*cX,
      -m[0]*sY*sX + m[4]*cY - m[8]*sY*cX,
      -m[1]*sY*sX + m[5]*cY - m[9]*sY*cX,
      -m[10]*sY*cX - m[2]*sY*sX + m[6]*cY,
      -m[11]*sY*cX - m[3]*sY*sX + m[7]*cY,
      m[0]*sX*cY + m[4]*sY + m[8]*cY*cX,
      m[1]*sX*cY + m[5]*sY + m[9]*cY*cX,
      m[10]*cY*cX + m[2]*sX*cY + m[6]*sY,
      m[11]*cY*cX + m[3]*sX*cY + m[7]*sY,
      m[12],
      m[13],
      m[14],
      m[15]
    ]);
    
    this.shownT = undefined;
  };

  WebGLVideo.prototype.zoom = function (factor) {
    this.zoomMatrix[0] *= factor;
    this.zoomMatrix[5] *= factor;
    this.zoomMatrix[10] *= factor;
    this.shownT = undefined;
  };


  WebGLVideo.prototype.shaderProgramConfigs = [
    {
      fragmentShaderSource:
        `varying lowp vec4 vColor;
        
        void main(void) {
          gl_FragColor = vColor;
        }`,

      vertexShaderSource: `
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;
        
        varying lowp vec4 vColor;
        
        uniform mat4 uMVMatrix;
        uniform mat4 uZoomMatrix;
        uniform mat4 uPMatrix;
        
        void main(void) {
          gl_PointSize = 2.0;
          gl_Position = uPMatrix * uZoomMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
          
          vColor = aVertexColor;
        }`,
      uniforms: [ 'uMVMatrix', 'uZoomMatrix', 'uPMatrix' ],
      attributes: [ 'aVertexPosition', 'aVertexColor' ],
      name: 'pointsDefault'
    },
    {
      fragmentShaderSource:`
        varying lowp vec4 vColor;
        varying mediump vec3 vLighting;
        
        void main(void) {
          gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
        }`,

      vertexShaderSource: `
        attribute vec3 aVertexPosition;
        attribute vec3 aVertexNormal;
        
        varying lowp vec4 vColor;
        varying mediump vec3 vLighting;
        
        uniform mat4 uMVMatrix;
        uniform mat4 uZoomMatrix;
        uniform mat4 uPMatrix;
        uniform vec3 uLightDirection;
        uniform vec3 uAmbientLightColor;
        uniform vec3 uDirectionalLightColor;
        uniform vec4 uVertexColor;
        
        void main(void) {
          gl_Position = uPMatrix * uZoomMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
          
          float directional = max(dot((uMVMatrix * vec4(aVertexNormal, 1)).xyz, uLightDirection), 0.0);
          vLighting = uAmbientLightColor + (uDirectionalLightColor * directional);
          vColor = uVertexColor;
        }`,
      uniforms: [ 'uMVMatrix', 'uZoomMatrix', 'uPMatrix', 'uAmbientLightColor', 'uDirectionalLightColor', 'uVertexColor', 'uLightDirection' ],
      attributes: [ 'aVertexPosition', 'aVertexNormal' ],
      name: 'vertexDefault'
    }
  ];

  WebGLVideo.prototype.setSimulation = function (simulation) {
    DynamicVideo.prototype.setSimulation.call(this, simulation);
    this.updateDims();
  }
  
  WebGLVideo.prototype.updateDims = function () {
    var width = this.domCache.canvasContainer.clientWidth;
    var height = this.domCache.canvasContainer.clientHeight;
    
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;

      //Sets the dimension of the canvas
      this.domCache.videoCanvas.width  = width;
      this.domCache.videoCanvas.height = height;
    }
  }

  WebGLVideo.prototype.useProgram = function (id) {
    this.ctx.useProgram(this.shaderPrograms[id]);
  };

  WebGLVideo.prototype.initShaders = function () {
    var gl = this.ctx;

    this.shaderPrograms = {};
    this.locations = {};
    for (var i = 0; i < this.shaderProgramConfigs.length; i++) {
      var progConfig = this.shaderProgramConfigs[i];
      var progName = progConfig.name;

      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      var source = gl.shaderSource(fragmentShader, progConfig.fragmentShaderSource);
      gl.compileShader(fragmentShader);
      
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw 'Error in fragment shader #' + i + ':' + gl.getShaderInfoLog(fragmentShader);
      }
      
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      var source = gl.shaderSource(vertexShader, progConfig.vertexShaderSource);
      gl.compileShader(vertexShader);

      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw 'Error in vertex shader #' + i + ':' + gl.getShaderInfoLog(vertexShader);
      }
      
      var shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, fragmentShader);
      gl.attachShader(shaderProgram, vertexShader);
      gl.linkProgram(shaderProgram);

      this.shaderPrograms[progName] = shaderProgram;
      var attributes = {};
      var uniforms = {};

      for (var j = 0, len = progConfig.attributes.length; j < len; j++) {
        var name = progConfig.attributes[j];
        var attributeLocation = gl.getAttribLocation(shaderProgram, name);
        attributes[name] = attributeLocation;
        gl.enableVertexAttribArray(attributeLocation);
      }

      for (var j = 0, len = progConfig.uniforms.length; j < len; j++) {
        var name = progConfig.uniforms[j];
        uniforms[name] = gl.getUniformLocation(shaderProgram, name);
      }

      this.locations[progName] = {
        attributes: attributes,
        uniforms: uniforms
      };
    }
  };

  WebGLVideo.getNormal = function(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    var dx2 = x2 - x1;
    var dx3 = x3 - x1;
    var dy2 = y2 - y1;
    var dy3 = y3 - y1;
    var dz2 = z2 - z1;
    var dz3 = z3 - z1;
    var crossX = dy2 * dz3 - dy3 * dz2;
    var crossY = dz2 * dx3 - dz3 * dx2;
    var crossZ = dx2 * dy3 - dx3 * dy2;
    var length = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
    
    return [ crossX / length, crossY / length, crossZ / length ];
  }
  
  WebGLVideo.getStripNormals = function (strip) {
    var n = strip.length / 3 - 2;
    var normals = new Float32Array(3 * n);
    for (var i = 0; i < n; i++) {
      var normal = WebGLVideo.getNormal.apply(null, strip.slice(3 * i, 3 * i + 9));
      normals[3 * i] = normal[0];
      normals[3 * i + 1] = normal[1];
      normals[3 * i + 2] = normal[2];
    }

    return normals;
  }

  WebGLVideo.getStripsNormals = function (pieces) {
    var normalStrips = [];
    for (var i = 0, len = pieces.length; i < len; i++) {
      normalStrips.push(WebGLVideo.getStripNormals(pieces[i]));
    }
    return normalStrips;
  }
  
  
  spimosimCore.modules.add('Video', {
    name: 'webgl',
    files: [ 'lib/modules/Video/webgl-video.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Uses webgl to draw something.',
    date: '2020-03-26'
  }, WebGLVideo);
}());
