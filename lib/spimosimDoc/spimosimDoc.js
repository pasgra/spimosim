'use strict';

window.spimosimDoc = (function() {


  var doc = {
      modules: {
        SimulationBackend: {
          description: 0,
          types: {
            webworker: {
              description: 0,
              api: {
                properties: {
                  WORKER_URL: {
                    description: 'Default location to look for the webworker script.',
                  }
                },
                prototype: {
                  resume: {
                    description: 'Resume simulation.',
                    args: [],
                    required: "True"
                  },
                  destroy: {
                    description: 'Destroy backend.',
                    args: [],
                    required: "True"
                  },
                  requestObjects: {
                    description: '',
                    args: [],
                    required: "True"
                  },
                  pause: {
                    description: 0,
                    args: [],
                    required: "True"
                  },
                  changeBackendSettings: {
                    description: 0,
                    args: [],
                    required: "True"
                  },
                  changeModelSettings: {
                    description: 0,
                    args: [],
                    required: "True"
                  }
                }
              }
            }
          },
          api: {
			constr: {
					description: 'A SimulationBackend communicates with a SimulationFrontend and does the actual simulation. The SimulationFrontend expects the following functions to be called by the SimulationBackend:' +
				  'simulationFrontend.setNewData(<last calculated time step>, <protocol object of the last steps>, <boolean if it is the first data since the last restart>),' + 
				  'simulationFrontend.setBackendObjects(<objects from backend that were requested by calling requestObjects()>)' +
				  'simulationFrontend.setDone()' +
				  'simulationFrontend.setBackendSettingsChanged(msg.data.settings)'
				  break;
				case 'invalid parameter':
				  simulationFrontend.setInvalidParameter(
					msg.data.invalidParameter, msg.data.invalidParameterMsg);
					   args: [ 'simulationFrontend', 'backendSettings' ]
					}
            properties: {},
            prototype: {
              resume: {
                description: '',
                args: [],
                required: "True"
              },
              destroy: {
                description: 0,
                args: [],
                required: "True"
              },
              requestObjects: {
                description: 0,
                args: [],
                required: "True"
              },
              pause: {
                description: 0,
                args: [],
                required: "True"
              },
              changeBackendSettings: {
                description: 0,
                args: [],
                required: "True"
              },
              changeModelSettings: {
                description: 0,
                args: [],
                required: "True"
              }
            }

          }
        }
      },
      PlotBackend: {
        description: 0,
        types: {
          webworker: {
            description: 0,
            api: {
              properties: {
                WORKER_URL: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {
                setInterval: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                isExpectingData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setAutoUpdate: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calcSteps: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initWorker: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                destroy: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      FitBackend: {
        description: 0,
        types: {
          webworker: {
            description: 0,
            api: {
              properties: {
                WORKER_URL: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {
                fit: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                destroy: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      ProtocolVar: {
        description: 0,
        types: {
          String: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getAsJsonString: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int8: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint8: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int16: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint16: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int32: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint32: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int64: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint64: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Float32: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Float64: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getBytesPerStep: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                enlarge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                join: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint8Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint16Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint32Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Uint64Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int8Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int16Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int32Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Int64Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Float32Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          Float64Array: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          SpinArray: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                set: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parsedJson2Value: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                type: {
                  description: 0,
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      SettingsPreprocessor: {
        description: 0,
        types: {
          Network: {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          },
          NetworkUi: {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      Model: {
        description: 0,
        types: {},
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            },
            add: {
              description: 0,
              args: [],
              required: "True"
            },
            get: {
              description: 0,
              args: [],
              required: "True"
            }
          },
          prototype: {}
        }
      },
      DataAggregator: {
        description: 0,
        types: {
          energy: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "mean value": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series mean value": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          distribution: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                isPdf: {
                  description: 0,
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series distribution": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          cumulated: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                isCdf: {
                  description: 0,
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series cumulated": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "auto correlation": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getDataFit: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getSingleStepData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getStepCsv: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series auto correlation": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getVars: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getConsts: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            },
            add: {
              description: 0,
              args: [],
              required: "True"
            }
          },
          prototype: {}
        }
      },
      Network: {
        description: 0,
        types: {
          "1d-lattice": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "2d-lattice": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          spimosim: {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                fromText: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "moore-2d-lattice": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          quadratic: {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "moore-quadratic": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "nd-lattice": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "barabasi-albert": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "dynamic-directed": {
            description: 0,
            api: {
              properties: {
                parameters: {
                  description: 0,
                  required: "True"
                },
                calculateNetworkSize: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                generateAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            },
            generateAdjacencyLists: {
              description: 0,
              args: [],
              required: "True"
            },
            extractSettings: {
              description: 0,
              args: [],
              required: "True"
            },
            sameSettings: {
              description: 0,
              args: [],
              required: "True"
            },
            calculateNetworkSize: {
              description: 0,
              args: [],
              required: "True"
            }
          },
          prototype: {}
        }
      },
      PlotDisplay: {
        description: 0,
        types: {
          energy: {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {
                description: {
                  description: 0,
                  required: "True"
                },
                getPlotOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "mean value": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                description: {
                  description: 0,
                  required: "True"
                },
                seriesLabels: {
                  description: 0,
                  required: "True"
                },
                getPlotOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series mean value": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          distribution: {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                description: {
                  description: 0,
                  required: "True"
                },
                fittable: {
                  description: 0,
                  required: "True"
                },
                seriesLabels: {
                  description: 0,
                  required: "True"
                },
                getPlotOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series distribution": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          cumulated: {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                description: {
                  description: 0,
                  required: "True"
                },
                fittable: {
                  description: 0,
                  required: "True"
                },
                seriesLabels: {
                  description: 0,
                  required: "True"
                },
                getPlotOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series cumulated": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "auto correlation": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                barChartPlotter: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                description: {
                  description: 0,
                  required: "True"
                },
                drawModeConfig: {
                  description: 0,
                  required: "True"
                },
                downloadCurrentCsv: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                changeDrawMode: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                makePlotOld: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getPlotOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getPlotOptionsHistogram: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                seriesLabels: {
                  description: 0,
                  required: "True"
                },
                getPlotOptionsStacked: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getPlotOptionsFit: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                draw: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setTHistogram: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          },
          "multi series auto correlation": {
            description: 0,
            api: {
              properties: {
                optionText: {
                  description: 0,
                  required: "True"
                },
                getSettingsConfig: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {
                plotType: {
                  description: 0,
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            },
            add: {
              description: 0,
              args: [],
              required: "True"
            }
          },
          prototype: {}
        }
      },
      VarInitializer: {
        description: 0,
        types: {
          "spin expectation value": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                hasGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getValue: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                hasValue: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "int range": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getValue: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                hasValue: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          copy: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                hasGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getValue: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                hasValue: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "float expectation value": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getValue: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "spin image": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parseFile: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parseImage: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setFileMsg: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                validFile: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                invalidFile: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getValue: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                hasValue: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      Video: {
        description: 0,
        types: {
          "1d-lattice": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setVideoDimensions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                draw: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                drawFrame: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                updateDrawMode: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getFrameWidth: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                getFrameHeight: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "2d-lattice": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                drawFrame: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setFrameNotSimulated: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setStartingSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "nd-lattice": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                destroy: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                drawFrameInImageData: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                drawFrame: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                isFrameShown: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          network: {
            description: 0,
            api: {
              properties: {},
              prototype: {
                getVisOptions: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initGui: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                drawFrame: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setNodeColors: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setAdjacencyLists: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                destroy: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          },
          "dynamic directed network": {
            description: 0,
            api: {
              properties: {},
              prototype: {
                drawFrame: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setSimulation: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                initVis: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                setEdge: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                updateLinks: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              }
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      NetworkUi: {
        description: 0,
        types: {
          "1d-lattice": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "2d-lattice": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          spimosim: {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "moore-2d-lattice": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          quadratic: {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "moore-quadratic": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "nd-lattice": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                videoType: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                },
                addEventListeners: {
                  description: 0,
                  args: [],
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "barabasi-albert": {
            description: 0,
            api: {
              properties: {
                labelText: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          },
          "dynamic-directed": {
            description: 0,
            api: {
              properties: {
                videoType: {
                  description: 0,
                  required: "True"
                },
                labelText: {
                  description: 0,
                  required: "True"
                },
                getVideoSettings: {
                  description: 0,
                  args: [],
                  required: "True"
                },
                parameters: {
                  description: 0,
                  required: "True"
                }
              },
              prototype: {}
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      createDrawModes: {
        description: 0,
        types: {
          "spins and flips": {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          },
          "int map": {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          },
          "grey scale spins": {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          },
          "weighted spins": {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      HelpTextGenerator: {
        description: 0,
        types: {
          "ITP/complex/minimal": {
            description: 0,
            api: {
              properties: {},
              prototype: {}
            }
          }
        },
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      },
      ModelConfig: {
        description: 0,
        types: {},
        api: {
          properties: {
            registerType: {
              description: 0,
              required: "True"
            },
            registeredConstructors: {
              description: 0,
              required: "True"
            }
          },
          prototype: {}
        }
      }
    },
    features: {
      Controls: {
        deleteOldData: "Creates a button in the menu to delete all time steps before the shown one.",
        changeEndlessMode: "Creates a button in the menu to toggle the endless mode. See <a href=\"#endlessMode\">endless mode,</a>",
        saveVarCheckboxes: "Creates a checkbox per state variable in the menu to deactivate saving the variable.",
        uploadInitialState: "The user can upload an initial state as a JSON file.",
        "select action on changing settings": "Creates a select element in advanced menu to decide what to do when settings are changed. Options: do nothing, always restart simulation, continue with new settings (if 'simulation.continuableWithNewSettings' is set to true in model configuration)."
      },
      Video: {},
      DynamicVideo: {
        timeLabel: "Shows the current time as a number.",
        timeProgressBar: "A time progress bar that lets the user go any point in the simulation.",
        fpsControls: "Control how fast the simulation is shown.",
        playbackButtons: "Play/pause button, skip to first button and skip to last button.",
        playbackControls: "...",
        playPauseButton: "Start and stop playback",
        skipToFirstButton: "Go to first saved time step",
        skipToLastButton: "Go to last saved time step"
      },
      Plotter: {
        "old plot options": "A menu to change the behaviour when restarting the simulation",
        "keep plots": "Keep old plots when restarting the simulation",
        "delete on restart": "An option to delete plots when restarting the simulation"
      },
      BasicPlotter: {}
    }
}



/*{
  modules: {
    SimulationBackend: {
      description: '',
      types: {
        webworker: {}
      }
    },
    PlotBackend: {
      description: '',
      types: {
        webworker: {}
      }
    },
    FitBackend: {
      description: '',
      types: {
        webworker: {}
      }
    }
  },
  features: {
    Controls: {
      'deleteOldData': 'Creates a button in the menu to delete all time steps before the shown one.',
      'changeEndlessMode': 'Creates a button in the menu to toggle the endless mode. See <a href="#endlessMode">endless mode,</a>',
      'saveVarCheckboxes': 'Creates a checkbox per state variable in the menu to deactivate saving the variable.',
      'uploadInitialState': 'The user can upload an initial state as a JSON file.',
      'select action on changing settings': "Creates a select element in advanced menu to decide what to do when settings are changed. Options: do nothing, always restart simulation, continue with new settings (if 'simulation.continuableWithNewSettings' is set to true in model configuration)."
    },
    Video: {},
    DynamicVideo: {
      'timeLabel': 'Shows the current time as a number.',
      'timeProgressBar': 'A time progress bar that lets the user go any point in the simulation.',
      'fpsControls': 'Control how fast the simulation is shown.',
      'playbackButtons': 'Play/pause button, skip to first button and skip to last button.',
      'playbackControls': '...',
      'playPauseButton': 'Start and stop playback',
      'skipToFirstButton': 'Go to first saved time step',
      'skipToLastButton': 'Go to last saved time step'
    },
    Plotter: {
      'old plot options': 'A menu to change the behaviour when restarting the simulation',
      'keep plots': 'Keep old plots when restarting the simulation',
      'delete on restart': 'An option to delete plots when restarting the simulation'
    },
    BasicPlotter: {}
  }
};*/

var featureActivatables = ['Controls', 'Plotter', 'DynamicVideo'];

function addMissing() {
  var report = '';
  var registers = spimosimCore.modules.list();
  var missingRegisters = [];
  report += 'Registers documentation:\n';
  for (var i = 0; i < registers.length; i++) {
    if (doc.modules[registers[i]] === undefined) {
      report += 'Doc missing: Register ' + registers[i] + '\n';
      doc.modules[registers[i]] = {};
    }
    if (doc.modules[registers[i]].description === undefined) {
      report += 'Doc missing: Description of Register ' + registers[i] + '\n';
      doc.modules[registers[i]].description = '';
    }
    if (doc.modules[registers[i]].types === undefined) {
      report += 'Doc missing: Types of Register ' + registers[i] + '\n';
      doc.modules[registers[i]].types = {};
    }
    var modules = spimosimCore.modules.list(registers[i]);
    if (doc.modules[registers[i]].api === undefined) {
      report += 'Doc missing: Register/api ' + registers[i] + '\n';
      doc.modules[registers[i]].api = {};
    }
    report += checkApi(spimosimCore.modules.registers[registers[i]], registers[i], doc.modules[registers[i]].api);
    for (var j = 0; j < modules.length; j++) {
      if (doc.modules[registers[i]].types[modules[j]] === undefined) {
        report += 'Doc missing: Module ' + registers[i] + ':' + modules[j] + '\n';
        doc.modules[registers[i]].types[modules[j]] = {};
      }
      if (doc.modules[registers[i]].types[modules[j]].description === undefined) {
        report += 'Doc missing: Module/description ' + registers[i] + ':' + modules[j] + '\n';
        doc.modules[registers[i]].types[modules[j]].description = '';
      }
      if (doc.modules[registers[i]].types[modules[j]].api === undefined) {
        report += 'Doc missing: Module/api ' + registers[i] + ':' + modules[j] + '\n';
        doc.modules[registers[i]].types[modules[j]].api = {};
      }
      report += checkApi(spimosimCore.modules.get(registers[i], modules[j]), registers[i] + '/' + modules[j], doc.modules[registers[i]].types[modules[j]].api);
    }
  }

  report += '\nRegisters documentation:\n';
  for (var i = 0; i < featureActivatables.length; i++) {
    var name = featureActivatables[i];
    var fA = spimosimUi[name];
    var availableFeatures = spimosimUi[name].prototype.availableFeatures;

    for (var layerName in availableFeatures) {
      if (availableFeatures.hasOwnProperty(layerName)) {
        if (doc.features[layerName] === undefined) {
          report += 'Doc missing: Feature layer of ' + name + ': ' + layerName + '\n';
        } else {
          for (var j = 0; j < availableFeatures[layerName].length; j++) {
            var featureName = availableFeatures[layerName][j].name;
            if (doc.features[layerName][featureName] === undefined) {
              report += 'Doc missing: Features ' + name + '/' + layerName + '/' + featureName + '\n';
            }
          }
        }
      }
    }
  }

  return report;
}

function checkApi(module, name, apiDoc) {
  var report = '';
  if (apiDoc.properties === undefined) {
    report += 'Doc missing: Api/properties of ' + name + '\n';
    apiDoc.properties = {};
  }
  report += checkInnerApi(module, name + '/properties', apiDoc.properties);

  if (apiDoc.prototype === undefined) {
    report += 'Doc missing: Api/prototype of ' + name + '\n';
    apiDoc.prototype = {};
  }

  report += checkInnerApi(module.prototype, name + '/prototype', apiDoc.prototype);

  return report;
}

function checkInnerApi(module, name, innerApiDoc) {
  var report = '';
  for (var pName in module) {
    if (module.hasOwnProperty(pName) && module[pName] !== undefined) {
      if (innerApiDoc[pName] === undefined) {
        report += 'Doc missing: Api:' + name + ': ' + pName + '\n';
        innerApiDoc[pName] = {};
      }
      if (innerApiDoc[pName].description === undefined) {
        innerApiDoc[pName].description = '';
      }
      if (module[pName].call !== undefined && innerApiDoc[pName].args === undefined) {
        innerApiDoc[pName].args = [];
      }
      if (innerApiDoc[pName].required === undefined) {
        innerApiDoc[pName].required = 'True';
      }
    }
  }

  return report;
}

function module(register, type) {
  return doc.modules[register][type];
}

function feature(activatable, layer, feature) {}

return {
  addMissing: addMissing,
  module: module,
  feature: feature,
  doc: doc
};
}());
