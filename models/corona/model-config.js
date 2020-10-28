spimosimCore.modules.add('ModelConfig', 'Corona', {
  "info": {
    "title": "Corona",
    "iconUrl": "../lib/spimosimUi/icon/",
    "url": "corona/model-info.html"
  },
  "controls": {
    "stateVariables": {
      "riskGroup": {
        "type": "SpinArray"
      },
      "days": {
        "type": "Uint8Array"
      },
      "state": {
        "type": "Uint8Array"
      },
      "susceptible": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of people who are susceptible because they never had the infection.",
          "optionText": "Susceptible"
        }
      },
      "incubation": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of people in the incubation phase.",
          "optionText": "Incubation phase"
        }
      },
      "mild": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of people with a mild infection.",
          "optionText": "Mild cases"
        }
      },
      "severe": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of people with a severe infection.",
          "optionText": "Severe cases"
        }
      },
      "dead": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of dead people.",
          "optionText": "Dead"
        }
      },
      "immune": {
        "type": "Float64",
        "plot": {
          "description": "Proportion of people who were infected and are immune now.",
          "optionText": "Immune"
        }
      }
    },
    "parameters": {
      "contacts": {
        "type": "range",
        "labelText": "Contacts per person and day",
        "value": ".1",
        "logScale": true,
        "min": 0.01,
        "max": 20,
        "step": 0.001
      },
      "incubationTime": {
        "type": "range",
        "labelText": "Incubation Time",
        "value": "5",
        "logScale": true,
        "min": 1,
        "max": 250,
        "step": 0.1
      },
      "healingTime": {
        "type": "range",
        "labelText": "Healing Time",
        "value": "14",
        "logScale": true,
        "min": 0.1,
        "max": 250,
        "step": 0.1
      },
      "deathRateWithTreatment": {
        "type": "range",
        "labelText": "Death rate with treatment",
        "value": ".03",
        "min": 0,
        "max": 1,
        "step": 0.0001
      },
      "deathRateWithoutTreatment": {
        "type": "range",
        "labelText": "Death rate without treatment",
        "value": ".15",
        "min": 0,
        "max": 1,
        "step": 0.0001
      },
      "proportionOfSevereCourses": {
        "type": "range",
        "labelText": "Proportion of severe courses",
        "value": ".3",
        "min": 0,
        "max": 1,
        "step": 0.001
      },
      "maxTreatment": {
        "type": "range",
        "labelText": "Maximal proportion of population to be treated at once",
        "value": "0.01",
        "min": 0,
        "max": 1,
        "step": 1e-8
      }
    },
    "features": [
      "deleteOldData",
      "changeEndlessMode",
      "saveVarCheckboxes",
      "select action on changing settings"
    ],
    "network": {
      "types": [
        "quadratic",
        "barabasi-albert",
        "barabasi-albert-lattice-vis",
        "spimosim"
      ]
    }
  },
  "simulation": {
    "backend": {
      "type": "webworker",
      "workerUrl": '../lib/modules/SimulationBackend/webworker.worker.js',
      "urls": [
        "../../../lib/spimosimNetwork/networkCore.js",
        "../../../lib/modules/ProtocolVar/typed-array.js",
        "../../../lib/modules/ProtocolVar/spin-array.js",
        "../../../lib/modules/ProtocolVar/typed.js",
        "../../../lib/modules/Network/2d-lattice.js",
        "../../../lib/modules/Network/barabasi-albert.js",
        "../../../lib/modules/Network/barabasi-albert-lattice-vis.js",
        "../../../lib/modules/Network/spimosim.js",
        "../../../lib/modules/Network/quadratic.js",
        "../../../models/corona/model.js"
      ],
      "name": "Corona"
    }
  },
  "plotter": {
    "backend": {
      "type": "webworker",
      "workerUrl": "../lib/modules/PlotBackend/webworker.worker.js",
      "urls": [
        "../../../lib/modules/PlotComputer/cumulated.js",
        "../../../lib/modules/PlotComputer/distribution.js",
        "../../../lib/modules/PlotComputer/auto-correlation.js",
        "../../../lib/modules/PlotComputer/mean-value.js"
      ]
    },
    "plotTypes": [],
    "features": true,
    "defaultPlots": [
      {
        "type": "susceptible"
      },
      {
        "type": "incubation"
      },
      {
        "type": "mild"
      },
      {
        "type": "severe"
      },
      {
        "type": "dead"
      },
      {
        "type": "immune"
      }
    ]
  },
  "video": {
    "type": "canvas",
    "features": true,
    "dynamicVideo": {
      "features": true
    },
    "drawModes": {
      "type": "int map",
      "code": "function draw(ctx, protocol, t) {}; return [ draw ];",
      "texts": [
        "Rectangle"
      ],
      "minValues": [
        "0",
        "-2",
        "-6"
      ],
      "names": [
        "state",
        "days",
        "age"
      ]
    }
  },
  "colorSet": {
    "LIST": [
      "#FFFFFF",
      "#FFFF00",
      "#FF8888",
      "#880000",
      "#000000",
      "#0000FF",
      "#000000",
      "#010101",
      "#020202",
      "#030303",
      "#040404",
      "#050505",
      "#060606",
      "#070707",
      "#080808",
      "#090909",
      "#0a0a0a",
      "#0b0b0b",
      "#0c0c0c",
      "#0d0d0d",
      "#0e0e0e",
      "#0f0f0f",
      "#101010",
      "#111111",
      "#121212",
      "#131313",
      "#141414",
      "#151515",
      "#161616",
      "#171717",
      "#181818",
      "#191919",
      "#1a1a1a",
      "#1b1b1b",
      "#1c1c1c",
      "#1d1d1d",
      "#1e1e1e",
      "#1f1f1f",
      "#202020",
      "#212121",
      "#222222",
      "#232323",
      "#242424",
      "#252525",
      "#262626",
      "#272727",
      "#282828",
      "#292929",
      "#2a2a2a",
      "#2b2b2b",
      "#2c2c2c",
      "#2d2d2d",
      "#2e2e2e",
      "#2f2f2f",
      "#303030",
      "#313131",
      "#323232",
      "#333333",
      "#343434",
      "#353535",
      "#363636",
      "#373737",
      "#383838",
      "#393939",
      "#3a3a3a",
      "#3b3b3b",
      "#3c3c3c",
      "#3d3d3d",
      "#3e3e3e",
      "#3f3f3f",
      "#404040",
      "#414141",
      "#424242",
      "#434343",
      "#444444",
      "#454545",
      "#464646",
      "#474747",
      "#484848",
      "#494949",
      "#4a4a4a",
      "#4b4b4b",
      "#4c4c4c",
      "#4d4d4d",
      "#4e4e4e",
      "#4f4f4f",
      "#505050",
      "#515151",
      "#525252",
      "#535353",
      "#545454",
      "#555555",
      "#565656",
      "#575757",
      "#585858",
      "#595959",
      "#5a5a5a",
      "#5b5b5b",
      "#5c5c5c",
      "#5d5d5d",
      "#5e5e5e",
      "#5f5f5f",
      "#606060",
      "#616161",
      "#626262",
      "#636363",
      "#646464",
      "#656565",
      "#666666",
      "#676767",
      "#686868",
      "#696969",
      "#6a6a6a",
      "#6b6b6b",
      "#6c6c6c",
      "#6d6d6d",
      "#6e6e6e",
      "#6f6f6f",
      "#707070",
      "#717171",
      "#727272",
      "#737373",
      "#747474",
      "#757575",
      "#767676",
      "#777777",
      "#787878",
      "#797979",
      "#7a7a7a",
      "#7b7b7b",
      "#7c7c7c",
      "#7d7d7d",
      "#7e7e7e",
      "#7f7f7f",
      "#808080",
      "#818181",
      "#828282",
      "#838383",
      "#848484",
      "#858585",
      "#868686",
      "#878787",
      "#888888",
      "#898989",
      "#8a8a8a",
      "#8b8b8b",
      "#8c8c8c",
      "#8d8d8d",
      "#8e8e8e",
      "#8f8f8f",
      "#909090",
      "#919191",
      "#929292",
      "#939393",
      "#949494",
      "#959595",
      "#969696",
      "#979797",
      "#989898",
      "#999999",
      "#9a9a9a",
      "#9b9b9b",
      "#9c9c9c",
      "#9d9d9d",
      "#9e9e9e",
      "#9f9f9f",
      "#a0a0a0",
      "#a1a1a1",
      "#a2a2a2",
      "#a3a3a3",
      "#a4a4a4",
      "#a5a5a5",
      "#a6a6a6",
      "#a7a7a7",
      "#a8a8a8",
      "#a9a9a9",
      "#aaaaaa",
      "#ababab",
      "#acacac",
      "#adadad",
      "#aeaeae",
      "#afafaf",
      "#b0b0b0",
      "#b1b1b1",
      "#b2b2b2",
      "#b3b3b3",
      "#b4b4b4",
      "#b5b5b5",
      "#b6b6b6",
      "#b7b7b7",
      "#b8b8b8",
      "#b9b9b9",
      "#bababa",
      "#bbbbbb",
      "#bcbcbc",
      "#bdbdbd",
      "#bebebe",
      "#bfbfbf",
      "#c0c0c0",
      "#c1c1c1",
      "#c2c2c2",
      "#c3c3c3",
      "#c4c4c4",
      "#c5c5c5",
      "#c6c6c6",
      "#c7c7c7",
      "#c8c8c8",
      "#c9c9c9",
      "#cacaca",
      "#cbcbcb",
      "#cccccc",
      "#cdcdcd",
      "#cecece",
      "#cfcfcf",
      "#d0d0d0",
      "#d1d1d1",
      "#d2d2d2",
      "#d3d3d3",
      "#d4d4d4",
      "#d5d5d5",
      "#d6d6d6",
      "#d7d7d7",
      "#d8d8d8",
      "#d9d9d9",
      "#dadada",
      "#dbdbdb",
      "#dcdcdc",
      "#dddddd",
      "#dedede",
      "#dfdfdf",
      "#e0e0e0",
      "#e1e1e1",
      "#e2e2e2",
      "#e3e3e3",
      "#e4e4e4",
      "#e5e5e5",
      "#e6e6e6",
      "#e7e7e7",
      "#e8e8e8",
      "#e9e9e9",
      "#eaeaea",
      "#ebebeb",
      "#ececec",
      "#ededed",
      "#eeeeee",
      "#efefef",
      "#f0f0f0",
      "#f1f1f1",
      "#f2f2f2",
      "#f3f3f3",
      "#f4f4f4",
      "#f5f5f5",
      "#f6f6f6",
      "#f7f7f7",
      "#f8f8f8",
      "#f9f9f9"
    ]
  },
  "clock": {
    "buffer": {},
    "onSlowSimulation": "retard",
    "fps": {
      "value": 4
    }
  }
});
