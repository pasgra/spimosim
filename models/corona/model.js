'use strict';

function Model(settings) {
  this.changeSettings(settings, true);
};

Model.prototype.changeSettings = function (settings, restart) {
var sameNetworkSettings = (this.settings !== undefined &&
spimosimNetwork.networkRegister.sameSettings(this.settings.network, settings.network));

if (!this.settings || !sameNetworkSettings) {
    this.adjacencyLists = spimosimNetwork.networkRegister.generateAdjacencyLists(settings.network);
}

if (!this.settings){}
var n = settings.network.size;
this.days = new Uint8Array(n);
this.state = new Uint8Array(n);
this.riskGroup = new Uint8Array(n);
for (var i=0; i < n; i++) {
  this.riskGroup[i] = (Math.random() < settings.parameters.proportionOfSevereCourses) ? 1 : 0;
}
this.n = n;
this.state[~~(Math.random() * n)] = 1;//Patient zero
this.susceptible = 0;
this.incubation = 0;
this.mild = 0;
this.severe = 0;
this.dead = 0;
this.immune = 0;

this.settings = settings;
};

Model.prototype.step = function (varsToSave, time) {
// for easy access
var n = this.n;
var parameters = this.settings.parameters;

// 
for (var i=0; i < n; i++) {
  this.days[i] = Math.min(this.days[i] + 1, 249);
  switch (this.state[i]) {
  case 1://incubation
    if (Math.random() > Math.exp(-this.days[i] / (parameters.incubationTime * parameters.incubationTime))) {
      if (this.riskGroup[i]) {
        this.state[i] = 3;
      } else {
        this.state[i] = 2;
      }
      this.days[i] = 0;
    }
    break;
  case 2://mild course
    if (Math.random() > Math.exp(-this.days[i]/(parameters.healingTime * parameters.healingTime))) {
      this.state[i] = 5;
      this.days[i] = 0;
    }
    break;
  case 3://severe course
    if (Math.random() + 1 > this.severe / parameters.maxTreatment) {
      var rate = parameters.deathRateWithTreatment;
    } else {
      var rate = parameters.deathRateWithoutTreatment;
    }
    if (Math.random() < rate) {
      this.state[i] = 4;
      this.days[i] = 0;
    } else if (Math.random() > Math.exp(-this.days[i]/(parameters.healingTime * parameters.healingTime))) {
      this.state[i] = 5;
      this.days[i] = 0;
    }
    break;
  }
}

var cs = this.settings.parameters.contacts/2 * n;
for (var i=0; i < cs; i++) {
    var j = ~~(Math.random() * n);
    var k = this.adjacencyLists[j][~~(Math.random() * this.adjacencyLists[j].length)];
    var jState = this.state[j];
    var kState = this.state[k];
    if (jState > 0 && jState < 4 && kState == 0) {
        this.state[k] = 1;
        this.days[k] = 0;
    } else if (kState > 0 && kState < 4 && jState == 0) {
        this.state[j] = 1;
        this.days[j] = 0;
    }
}

//count cases in each state

this.susceptible = 0;
this.incubation = 0;
this.mild = 0;
this.severe = 0;
this.dead = 0;
this.immune = 0;
for (var i=0; i < n; i++) {
  switch (this.state[i]) {
  case 0:
    this.susceptible++;
    break;
  case 1:
    this.incubation++;
    break;
  case 2:
    this.mild++;
    break;
  case 3:
    this.severe++;
    break;
  case 4:
    this.dead++;
    break;
  case 5:
    this.immune++;
  }
}
this.susceptible /= n;
this.incubation /= n;
this.mild /= n;
this.severe /= n;
this.dead /= n;
this.immune /= n;
};

spimosimCore.modules.add('Model', 'Corona', Model);
