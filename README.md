# SpiMoSim

## About the library

A modular javascript library by Pascal Grafe to create user interfaces
for simulations.

SpiMoSim was originally created with simple models for physical,
economic and social systems on a lattice of interacting spins, agents or
similar in mind. Think of the Ising model or Conway's Game of Life.

The library is highly modular which makes it useful for a much broader
range of applications. In principle it can function as a GUI for any
program that has some settings chosen by the user and produces data in
time steps. The settings might be a couple of numbers. The user sees
plots of time series and an image visuaizes the state at each step.

A design goal of SpiMoSim is to minimize the amount of code necessary to
build an application. For agent based models a JSON configuration file
and two javascript functions can be enough.

### How to build applications with SpiMoSim?


SpiMoSim is build with web technologies in Javascript, HTML and CSS. But
you do not need to be a web developer to use it for creating
applications. You can try out the [SpiMoSim Creator](spimosimCreator)
directly in your browser. It might be helpful if you know a *little*
[Javascript](https://www.w3schools.com/js/). Or [download the latest
version of SpiMoSim](https://github.com/pasgra/spimosim/releases)
including some example applications (Ising model) and give it a try!

Due to the modularity of SpiMoSim the application/simulation does not
need to run directly in the browser. It can communicate with an
application running on some server or your local computer via a
Websocket connection. You can write the application/simulation core in
any language with a websocket library and let SpiMoSim provide the GUI.

[pySpiMoSim](https://github.com/pasgra/pyspimosim/) is a python implementation
of a simulation backend for SpiMoSim. pySpiMoSim is also the easiest way to
run a server for SpiMoSim locally on your computer.

License
-------

SpiMoSim is free software under the terms and conditions of the
[MIT-LICENSE](LICENSE.txt).

## Demonstrations

- Ising Model [in this repository](ising) or
  [online](http://spimosim.pascalgrafe.net/ising)

  A simple demonstration of the Ising model. This is the version
  included in the download.

- [The Bornholdt Model with strategy
  spins](http://www.pascalgrafe.net/spimosim/models#model=Bornholdt)

  A fully featured version of the market model by S. Bornholdt

- Direct Simulation Monte Carlo [in this repository](dsmc) or
  [online](http://spimosim.pascalgrafe.net/dsmc)

  A particle simulator for low density gases. This demonstration with
  3D graphics is also included in the download.

- A collection of different models at [Complex Systems
  Lab.](http://www.itp.uni-bremen.de/complex/interactive-models)

- Different models implemented by Pascal Grafe available at
  [pascalgrafe.net](http://www.pascalgrafe.net/spimosim/models/)
