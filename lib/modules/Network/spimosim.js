/* Copyright 2017 Pascal Grafe - MIT License */
'use strict';

(function () {
  spimosimCore.modules.add('Network', {
    name: 'spimosim',
    files: [ 'lib/modules/Network/spimosim.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'A two dimensional lattice forming the letters spimosim by cutting the connections along the letter contours.',
    date: '2020-03-26'
  }, {
    parameters: [ 'width', 'height' ],
    generateAdjacencyLists: function (settings) {
      var adjacencyLists = spimosimCore.modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: 200,
        height: 30,
        periodic: true
      });

      var n = 6000;
      var binaryPictureString = atob('cBcAAP///////////////////////////////////////////////////////////////////wD8AAA/AAbw/wP4D4D/D8APgAH8/wAe+H8A+AAAPAAG4P8B+AMA/weAD4AB+H8AHvw/MPAHB/yBP+D/Af8BAvwDA3/gD/h/wD/8H3zwBx/4wT/g/wH/wB/8wQd/8A/4f8A//B/+8Ac/+ME/wP+Af+A/+OEPf/AP8D/gP/wf/vAHf/DBP8D/gH/wf/DhD3/wD/A/4D/8H/7/B3/wwT+Cf4B/8H/w4f9/8I/gH+A//B/+/wd/8ME/gn+EP/h/8OH/f/CP4B/hP/wf/P8Hf/DBP4J/hD/4/+DB/3/wj+Af4T/8H/j/B3/wwT8GP4Q/+P/ggf9/8I/BD+E//D/g/wd/+ME/Bj+GP/j/4AP+f/CPwY/hP/w/gP8HP/jBPwY/hj/4/+AD+H/wj8GP4T/8fwD+Bx/4wT8OHoY/+P/gB+B/8I+Dh+E//P8B+AcB/ME/Dh6HP/j/4B+Af/CPg8fhP/z/B/AHAP7BPx4ehz/4/+B/AH/wj4fH4T/8/x/wB4D/wT8eDIc/+P/g/wF/8I8Hw+E//v9/4Af//8E/HoyHP/j/4P8HfvCPB+Phf/7//+AH///BPz6Mhz/4/+D/D37wjw/j4X/+///hB///wT8+gIc/+H/w/x9+8I8P4OH//x//4Qf//8E/PsCHf/B/8PEffvCPD/Dh//8P/+EH///BP37Ah3/wf/DwH37wjx/w4f//D/7gB///wT9+4Id/4D/44A9+8I8f+OE//A/+8Af//8E/fOAH/8Af/OAPf/APH/jBH/gfOPAH/v+BP/zgA/8BAvyBA3/gDz/4wB/4HwD4APA/AAbw8AD4AwD/AYAPgAE8PAAe+H8A/gDwPwAG8PEA+A+A/wfgD4ABfDwAPvz//////////////////////////////////////////////////////////////////w==');

      var len = binaryPictureString.length;
      var bytes = new Uint8Array(len);
      for (var i = 0; i < len; i++)        {
        bytes[i] = binaryPictureString.charCodeAt(i);
      }
      var pixels = new BoolArray(bytes.buffer).toSpins();

      for (var i = 0; i < n; i++) {
        var isInText = pixels[i] !== 1,
          neighbors = adjacencyLists[i];
        
        for (var j = 0, len = neighbors.length; j < len; j++) {
          if ((pixels[neighbors[j]] !== 1) !== isInText) {
            neighbors.splice(j, 1);
            --j;
            --len;
          }
        }
      }

      return adjacencyLists;
    },
    calculateNetworkSize: function (settings) {//returns the network size
      return 6000;
    },
    fromText: function (x, y, width, height, text, font) {
      var adjacencyLists = spimosimCore.modules.get('Network', '2d-lattice').generateAdjacencyLists({
        width: width,
        height: height,
        periodic: true
      });
      var n = width * height;
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.font = font;
      ctx.fillText('SPIMOSIM!', x, y);
      var pixels = new Uint32Array(ctx.getImageData(0, 0, width, height).data.buffer);
      for (var i; i < n; i++) {
        pixels[i]++;
      }
      return btoa(String.fromCharCode.apply(null, new Uint8Array(new BoolArray(pixels).buffer)));
    }
  });
}());
