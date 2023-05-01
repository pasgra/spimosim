spimosimCore.modules.add("creator-module-templates", "Video", {
  labelText: "Video",
  templates: {
    "Video": {
      object: 'MyVideo',
      template: `
function MyVideo(initializer, config, videoSection, colorSet) {
}
MyVideo.prototype.availableFeatures = [];
MyVideo.prototype.contextType = '2d';
MyVideo.prototype.createDrawModes = function () {
}
MyVideo.prototype.draw = function (clock) {
}
MyVideo.prototype.drawFrameInImageData = function (pixels, protocol, t, drawMode) {
}
MyVideo.prototype.drawFrameInContext = function (ctx, protocol, t, drawMode) {
}
MyVideo.prototype.getAnimatedGifFileName = function (tStart, tEnd, drawMode) {
}
MyVideo.prototype.getFrameFileName = function (t, drawMode) {
}
MyVideo.prototype.getSpimosimSpinsFrameFileName = function (t) {
}
MyVideo.prototype.setSimulation = function (simulation) {
}
MyVideo.prototype.initVideoMenu = function () {
}
MyVideo.prototype.createImageData = function (ctx) {
}
MyVideo.prototype.destroy = function () {
}
        `
    },
    "DynamicVideo": {
      object: 'MyDynamicVideo',
      template: `
function MyDynamicVideo(initializer, config, videoSection, colorSet) {
}
MyDynamicVideo.prototype.availableFeatures = {"DynamicVideo": []};
MyDynamicVideo.prototype.initGui = function () {
}
MyDynamicVideo.prototype.setPlayPauseButton = function () {
}
MyDynamicVideo.prototype.setFrameNotSaved = function (frameNotSaved) {
}
MyDynamicVideo.prototype.setFrameNotSimulated = function (frameNotSimulated) {
}
MyDynamicVideo.prototype.setStartingSimulation = function (startingSimulation) {
}
MyDynamicVideo.prototype.pause = function () {
}
MyDynamicVideo.prototype.play = function () {
}
MyDynamicVideo.prototype.playPause = function () {
}
MyDynamicVideo.prototype.isFrameShown = function (t) {
}
MyDynamicVideo.prototype.setTValue = function (t) {
}
MyDynamicVideo.prototype.setTMin = function (tMin) {
}
MyDynamicVideo.prototype.setTMax = function (tMax) {
}
MyDynamicVideo.prototype.skipToFirst = function () {
}
MyDynamicVideo.prototype.skipToLast = function () {
}
MyDynamicVideo.prototype.getFrameWidth = function () {
}
MyDynamicVideo.prototype.getFrameHeight = function () {
}
`
    }
  }
});
