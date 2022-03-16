# Example model to demonstrate python backend

This folder contains different simulation backends for SpiMoSim. The backend `server`
allows to write models in other languages than javascript. An example
implementation of the Ising model in python can be found in `ising_model.py`.
The files `backend.py` and `pyspimosim/*` provide the interface to the browser.

## How to use

1. Start the python backend (this starts a webserver for serving files
   and a websocket server to communicate with the simulation):
   
   `> python backend.py ising-model`
   
   Different command line flags exist for ports, etc. Run
   
   `> python backend.py --help`
   
   for details.

2. Modify the following files `ising/`:
   * Load the SimulationBackend module 'server' by adding/uncommenting
     the folling line in `ising/index.html`:
     
     `<script src="lib/modules/SimulationBackend/server.js"></script>`
   * Set the simulation backend to 'server' and set the websocket URL
     by setting `modelConfig.simulation.backend` in `ising/model-config.js` to:

     ```
     {
       type: "server",
       url: "ws://localhost:8090"
     }
     ```

3. Open `http://localhost:8080/ising` in your browser.

## Write a custom model

Create a file with a name ending in `-model.py` and run `backend.py` is the
corresponding folder. The file needs to define a Model inherited from
`pyspimosim.base_model.BaseModel` that overwrites the methods
`step(self, vars_config, t)` and
`change_settings(self, model_settings, restart=False)`. The object
`ModelSettings` is also needed and can define model specific command line
options. I can be or be based on `pyspimosim.base_model.RunSettings`.
