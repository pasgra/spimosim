import tornado.web
import tornado.httpserver
import tornado.ioloop
import tornado.websocket
import tornado.options
import json
import time
from queue import Queue
import numpy as np
import random
from copy import deepcopy
import traceback

class InvalidParameterException(Exception):
    def __init__(self, invalid_parameter, invalid_parameter_msg):
        self.invalid_parameter = invalid_parameter
        self.invalid_parameter_msg = invalid_parameter_msg


class NumpyEncoder(json.JSONEncoder):
    def __init__(self, buffers, **kw):
        json.JSONEncoder.__init__(self, **kw)
        self.buffers = buffers
    
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            self.buffers.append(obj.tobytes())
            return
        return json.JSONEncoder.default(self, obj)

class Backend():
    def __init__(self, Model, handler):
        self.backend_settings = { 'protocol': { 'varsConfig': [ ], 'saveInterval': 1 }, 'sendInterval': 100, 'sendFirstAfter': 20, 'ENDIAN': 'little', 'tMax': 0}
        self.bin_msg_charset = 'utf-16-le'
        self.t = 0
        self.last_send_t = -1
        self.timeout_id = None
        self.next_send_time = 0
        self.messages = Queue()
        self.is_first_data = True
        self.invalid_parameter = None
        self.invalid_parameter_msg = None
        self.model = None
        self.Model = Model
        self.handler = handler
        self.normal_vars = []
        self.numpy_vars = []
        self.spin_vars = []
    
    def create_protocol(self):
        self.protocol = {}
        self.buffers = []

    
    def next_step(self):
        self.timeout_id = None
        try:
            if self.t < self.backend_settings['tMax']:
                self.t = self.t + 1

                self.model.step(self.backend_settings['protocol']['varsConfig'], self.t)

                if self.t % self.backend_settings['protocol']['saveInterval'] == 0:
                    self.add_data_to_protocol()

                if (self.next_send_time <= 1000 * time.time()):
                    self.send_protocol()

                self.timeout_id = tornado.ioloop.IOLoop.current().call_later(0, self.next_step)

            else:
                self.send_protocol()
                msg = '{"type":"done","t":' + str(self.t) + '}'
                self.handler.write_message(msg)
        except Exception as e:
            self.handler.send_error(str(e))
            self.handler.close()
            self.pause()
            raise e

    
    def add_data_to_protocol(self):
        state = { name: deepcopy(self.model.state[name]) for name in self.normal_vars }
        for name in self.numpy_vars:
            self.buffers.append(self.model.state[name].tobytes())
        
        for name in self.spin_vars:
            spin_var = self.model.state[name]
            self.buffers.append(len(spin_var).to_bytes(4, self.backend_settings['ENDIAN']) + np.packbits(spin_var + 1).tobytes())

        self.protocol[self.t] = state
    
    def merge_backend_settings(self, new_settings):
        if not 'protocol' in new_settings:
            new_settings['protocol'] = self.backend_settings['protocol']

        if not 'varsConfig' in new_settings['protocol']:
            new_settings['protocol']['varsConfig'] = self.backend_settings['protocol']['varsConfig']

        for name in self.backend_settings['protocol']:
            if not name in new_settings['protocol']:
                new_settings['protocol'][name] = self.backend_settings['protocol'][name]
        
        for name in self.backend_settings:
            if not name in new_settings:
                new_settings[name] = self.backend_settings[name]
        
        if 'ENDIAN' in new_settings:
            if new_settings['ENDIAN'] == 'little':
                self.bin_msg_charset = 'utf-16-le'
            else:
                self.bin_msg_charset = 'utf-16-be'

        self.backend_settings = new_settings
    
    def change_model_settings(self, model_settings, restart):
        try:
            self.normal_vars = []
            self.numpy_vars = []
            self.spin_vars = []
            for name, value in self.backend_settings['protocol']['varsConfig'].items():
                if value['type'] in ( 'Int8Array', 'Uint8Array', 'Int16Array', 'Uint16Array', 'Int32Array', 'Uint32Array', 'Int64Array', 'Uint64Array', 'Float32Array', 'Float64Array' ):
                    self.numpy_vars.append(name)
                elif value['type'] == 'SpinArray':
                    self.spin_vars.append(name)
                else:
                    self.normal_vars.append(name)

            if self.model == None:
                self.model = self.Model(model_settings)
            else:
                self.model.change_settings(model_settings)
            return True
        except InvalidParameterException as e:
            self.send_invalid_parameter(e.invalid_parameter, e.invalid_parameter_msg)
            if restart:
                self.invalid_parameter = e.invalid_parameter
                self.invalid_parameter_msg = e.invalid_parameter_msg
            return False
        except Exception as e:
            raise e
            

    def restart(self, model_settings):
        self.pause()

        self.invalid_parameter = None

        if (self.change_model_settings(model_settings, True)):
            self.t = 0
            self.is_first_data = True
            self.last_send_t = -1

            self.create_protocol()
            self.add_data_to_protocol()

            self.resume()

    def resume(self):
        self.next_send_time = 1000 * time.time() + self.backend_settings['sendFirstAfter'];
        self.next_step()

    def pause(self):
        if self.timeout_id != None:
            tornado.ioloop.IOLoop.current().remove_timeout(self.timeout_id)
        self.timeout_id = None
  
    def send_protocol(self):
        msg = { 'type':'new data', 'replace': self.numpy_vars + self.spin_vars, 'protocol': self.protocol, 't': self.t, 'lastSendT': self.last_send_t, 'isFirstData': self.is_first_data }

        self.is_first_data = False
        self.next_send_time = self.next_send_time + self.backend_settings['sendInterval']
        self.last_send_t = self.t
        
        json_msg = json.dumps(msg)#, cls=NumpyEncoder)
        header = len(self.buffers).to_bytes(4, self.backend_settings['ENDIAN'])
        blocks = b''
        for b in self.buffers:
            header += len(b).to_bytes(4, self.backend_settings['ENDIAN'])
            blocks += b

        self.handler.write_message(header + blocks + bytes(json_msg, self.bin_msg_charset), binary=True)
        self.create_protocol()

    def send_invalid_parameter(self, invalid_parameter, invalid_parameter_msg):
        self.handler.write_message('{"type":"invalid parameter","invalidParameter": "' + invalid_parameter + '", "invalidParameterMsg": "' + invalid_parameter_msg + '"}')

    def send_requested_objects(self, names):
        objects = { name: self.model[name] for name in names }
        msg = {"type": "requested objects", "objects": json.dumps(objects, cls=NumpyEncoder) }
        self.handler.write_message(msg)

    def enqueue_message(self, raw_message):
        message = json.loads(raw_message)
        if (message['command'] != 'change model settings' and self.invalid_parameter != None):
            self.send_invalid_parameter(self.invalid_parameter, self.invalid_parameter_msg)
            return

        self.messages.put(message)

        while not self.messages.empty():
            try:
                message = self.messages.get()
                command = message['command']
                if command == 'change backend settings':
                    self.merge_backend_settings(message['settings'])

                    if (message['resume']):
                        self.resume()
                elif command == 'change model settings':
                    if message['restart']:
                        self.restart(message['modelSettings'])
                    else:
                        self.change_model_settings(message['modelSettings'], False)
                elif command == 'request objects':
                    self.send_requested_objects(message['names'])
                elif command == 'resume':
                    self.resume()
                elif command == 'pause':
                    self.pause()
                else:
                    raise 'Cannot understand message: ' + message
            except Exception as e:
                self.handler.send_error(str(e))
                self.handler.close()
                self.pause()
                raise e
    

class ChannelHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, Model):
        self.backend = Backend(Model, self)
        self.id = random.randint(0,1e6)
    
    def on_message(self, message):
        self.backend.enqueue_message(message)
    
    
    def on_close(self):
        print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Closed-' + str(self.id) +'<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
    
    def open(self):
        self.set_nodelay(True)
        print('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Opened-' + str(self.id) +'<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    def check_origin(self, origin):
        return True

def start(listen_address, listen_port, path, Model):
    # Create tornado application and supply URL routes
    app = tornado.web.Application([ (path, ChannelHandler, dict(Model=Model)) ])
    
    # Setup HTTP Server
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(listen_port, listen_address)
    
    # Start IO/Event loop
    tornado.ioloop.IOLoop.current().start()
