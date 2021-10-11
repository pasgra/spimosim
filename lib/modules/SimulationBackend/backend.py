#!/usr/bin/env python3

# This script supports autocompletion with argcomplete: PYTHON_ARGCOMPLETE_OK

from pyspimosim.base_model import create_parser_from_data_class, namespace_to_dataclass
from pyspimosim import spimosim_server
from dataclasses import dataclass
import http.server
import importlib
import multiprocessing
import sys
import signal
import os
from dataclasses import dataclass
import argparse
import subprocess

_script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(_script_dir)

class HttpRequestHandler(http.server.CGIHTTPRequestHandler):
    extensions_map = {
        '': 'application/octet-stream',
        '.manifest': 'text/cache-manifest',
        '.html': 'text/html',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.svg':	'image/svg+xml',
        '.css':	'text/css',
        '.js':'application/x-javascript',
        '.wasm': 'application/wasm',
        '.json': 'application/json',
        '.xml': 'application/xml',
    }

    def log_message(self, format_str, *args):
        try:
            http_status = int(args[1])
            if http_status >= 200 and http_status < 400:
                return
        except:
            pass
        super().log_message(format_str, *args)

def start_http_server(model, www_root, listen_on):
    message = f"Webserver listens on http://{listen_on[0]}:{listen_on[1]}"
    if listen_on[0] == "0.0.0.0":
        try:
            own_ip = subprocess.run(["hostname", "-I"], stdout=subprocess.PIPE).stdout.decode("UTF-8").split(" ")[0]
            message = f"Webserver listens on http://{listen_on[0]}:{listen_on[1]}, try accessing via http://{own_ip}:{listen_on[1]}"
        except:
            pass
    print(message)
    
    os.chdir(www_root)
    os.environ["model"] = model
    httpd = http.server.HTTPServer(listen_on, HttpRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass

def start_http_server_process(model, www_root, listen_on):
    process = multiprocessing.Process(target=start_http_server, args=(model, www_root, listen_on))
    process.start()
    return process

def load_classes(class_name):
    module = importlib.import_module(class_name)
    return getattr(module, 'Model'), getattr(module, 'ModelSettings')

def stop(process):
    process.terminate()
    process.join()
    sys.exit(0)

def get_model_names(dirname=None):
    if dirname is None:
        dirname = _script_dir
    for path in os.listdir(dirname):
        if not os.path.isdir(os.path.join(dirname, path)) and path.endswith("_model.py"):
            yield path[:-len(".py")]

def get_models(dirname=None):
    models = {}

    for model in get_model_names(dirname):
        Model, ModelSettings = load_classes(model)
        models[model] = (Model, ModelSettings)
    
    return models

class _HelpAction(argparse._HelpAction):

    def __call__(self, parser, namespace, values, option_string=None):
        parser.print_help()

        subparsers_actions = [
            action for action in parser._actions
            if isinstance(action, argparse._SubParsersAction)]
        for subparsers_action in subparsers_actions:
            for choice, subparser in subparsers_action.choices.items():
                print("\n\nHelp for model '{}'".format(choice))
                print(subparser.format_help())

        parser.exit()

def get_parser(models, default_root=_script_dir+"/../../../"):
    parser = argparse.ArgumentParser(add_help=False, formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    subparsers = parser.add_subparsers(title="Available models to run", dest="model", required=True)
    parser.add_argument("--www_root", "-W", default=default_root, help="Root directory for the web server")
    parser.add_argument("--www_address", "-A", default="0.0.0.0", help="IP address for the web server")
    parser.add_argument("--www_port", "-Q", default=8000, type=int, help="Port for the web server")
    parser.add_argument('--help', "-h", "-?", action=_HelpAction, help='Help')

    for model_name, (Model, ModelSettings) in models.items():
        create_parser_from_data_class(ModelSettings, parser=subparsers.add_parser(model_name, formatter_class=argparse.ArgumentDefaultsHelpFormatter))

    try:
        import argcomplete
        argcomplete.autocomplete(parser)
    except:
        pass # not fatal: bash completion is not available if argcomplete is not installed or fails

    return parser

def start(args, models):
    Model, ModelSettings = models[args.model]
    model_settings = namespace_to_dataclass(ModelSettings, args, ignore=["model", "www_root", "www_address", "www_port"])
    Model.prepare_environment(model_settings)

    process = start_http_server_process(args.model, args.www_root, (args.www_address, args.www_port))
    
    signal.signal(signal.SIGINT, lambda sig, frame: stop(process))
    signal.signal(signal.SIGTERM, lambda sig, frame: stop(process))

    spimosim_server.start(Model, model_settings)

if __name__ == "__main__":
    models = get_models()
    start(get_parser(models).parse_args(), models)
