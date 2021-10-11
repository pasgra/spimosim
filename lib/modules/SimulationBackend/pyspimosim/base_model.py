import os
import time
import sys
from abc import ABC, abstractmethod, abstractproperty
from argparse import ArgumentParser, ArgumentDefaultsHelpFormatter
from dataclasses import dataclass, field, fields, MISSING
from pyspimosim import spimosim_server

class BaseModel(ABC):
    def __init__(self, backend, model_settings, run_settings):
        self.backend = backend
        self.run_settings = run_settings
    
    @abstractmethod
    def change_settings(self, model_settings, restart=False):
        pass

    @abstractmethod
    def step(self, vars_config, t):
        pass

    @staticmethod
    def prepare_environment(model_settings):
        os.environ["wsaddress"] = f"ws://{model_settings.address}:{model_settings.port}"

@dataclass
class RunSettings:
    address: str            = field(default="0.0.0.0",     metadata={"help": "IP address for the websocket server"})
    port: int               = field(default=8090,          metadata={"help": "Port for the websocket server"})
    path: str               = field(default=r"/",          metadata={"help": "Path of the websocket root directory"})

def namespace_to_dataclass(DataClass, args, ignore=()):
    return DataClass(**{k: v for k, v in vars(args).items() if v is not None and k not in ignore})

def create_parser_from_data_class(class_, parser=None):
    if parser is None:
        parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
    short_options = set()
    
    for field in sorted(fields(class_), key=lambda f:f.name):
        help_str = field.metadata.get("help", None)
        if field.default == MISSING and field.type != bool:
            parser.add_argument(field.name, type=field.type, help=help_str)
        else:
            possible_short_options = set(["-" + field.name[0].upper(), "-" + field.name[0]])
            short = sorted(list(possible_short_options.difference(short_options)))[-1:] # might have 0 or 1 length
            short_options.update(short)
            options = ["--" + field.name, *short]
            if field.type == bool:
                parser.add_argument(*options, action="store_true", default=False, help=help_str)
            else:
                parser.add_argument(*options, type=field.type, nargs="?", default=field.default, help=help_str)
    
    return parser

def main(Model, ModelSettings, args=None):
    if args is None:
        args = create_parser_from_data_class(ModelSettings).parse_args()
    spimosim_server.start(Model, namespace_to_dataclass(ModelSettings, args))

