'use strict';

(function () {
  var DynamicVideo = spimosimUi.DynamicVideo;

  function Dummy(initializer, config, videoSection, colorSet) {
    DynamicVideo.call(this, initializer, config, videoSection, colorSet);
  }
  Dummy.prototype = Object.create(DynamicVideo.prototype);

  Dummy.prototype.createDrawModes = function () {
    this.drawModes = [ function() {} ];
    this.drawMode = 0;
  };
  
  Dummy.prototype.initGui = function () {
    var box = DynamicVideo.prototype.initGui.call(this);
    this.domCache.canvasFrame.remove();
    return box;
  };

  Dummy.prototype.drawFrame = function () {};

  spimosimCore.modules.add('Video', {
    name: 'dummy',
    files: [ 'lib/modules/Video/dummy.js' ],
    depends: [],
    version: '1.0',
    author: 'Pascal Grafe',
    description: 'Shows only a time search bar and its buttons.',
    date: '2022-03-04'
  }, Dummy);
}());


