spimosimCore.modules.add("creator-module-templates", "createDrawModes", {
  labelText: "createDrawModes",
  templates: {
    "createDrawModes": {
      object: 'myCreateDrawModes',
      description: `To draw a frame a spimosim Video calls the draw() function of the current
draw mode to create an image of the current frame. It is possible to have
multiple draw modes that the user can switch between using the video menu.

The draw modes are configured in the section video.drawModes of the model
config. The function registered as a 'createDrawModes' module with the name
set in video.drawModes.type must return all usable draw modes. I receives
video.drawModes as the argument 'config' and the current colorSet as
'colorSet'.

The function is expected to return a list. Each element of the list must be
a dict with two keys. The key 'text' is shown to the user to switch between
draw modes. The function draw() is called when a frame needs to be drawn.
The exact arguments of draw() depend on the video module used.`,
      template: `function myCreateDrawModes (config, colorSet) {
  var colorA = colorSet.MY_CUSTOM_COLORS[0];
  var colorB = colorSet.MY_CUSTOM_COLORS[1];
  
  return [
    {
      text: "Normal mode",
      draw: function (pixels, protocol, t, offset) {
        protocol.get(spinName, t).forEach(function (value, i) {
          if (value) {
            pixels[i] = colorA;
          } else {
            pixels[i] = colorB;
          }
        }, offset);
      }
    },
    {
      text: "Inverse color mode",
      draw: function (pixels, protocol, t, offset) {
        protocol.get(spinName, t).forEach(function (value, i) {
          if (value) {
            pixels[i] = colorB;
          } else {
            pixels[i] = colorA;
          }
        }, offset);
      }
    }
  ];
}

// If you want configurable colors for your draw mode, you should set a default.
tools.copyInto({
  MY_CUSTOM_COLORS: [
    '#ff0000',
    '#0000ff'
  ]
}, spimosimUi.colorSet);`
    }
  }
});
