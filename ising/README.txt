1. Start with modifying model-config.js. Define your state variables and parameters.
2. Programm the model in model.js.


Debugging tips:
===============
Open the web console (usually by pressing [F12]).

 * Everything running is accessable in spimosimDbg.
 * The library objects are spimosimCore, spimosimUi, tools, graphicTools
 * The simulation protocol is found in spimosimDbg.simulation.protocol.
 * You cannot access variables of your Model object directly since it runs in a webworker. You can access properties of your model anyway by running:
   spimosimDbg.simulation.requestBackendObjects(['myProperty']) //wait a second 
   spimosimDbg.simulation.backendObjects // there it is
 * The nth plot object is in spimosimDgb.plotters[0].plots[n].
 * List spimosim modules:
   spimosimCore.modules.list()
   spimosimCore.modules.list('PlotDisplay')
   spimosimCore.modules.tree()
 * List activatable features:
   spimosimUi.listFeatures('DynamicVideo')
   spimosimUi.listFeatures('Controls')
   spimosimUi.listFeatures('Plotter')
