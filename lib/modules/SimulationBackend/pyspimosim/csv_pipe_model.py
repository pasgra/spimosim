import os
import time
import sys
from abc import ABC, abstractmethod, abstractproperty
from dataclasses import dataclass, field, fields, MISSING
from pyspimosim.base_model import BaseModel, RunSettings as BaseRunSettings

def to_numbers(obj):
    if type(obj) is list:
        return [to_numbers(o) for o in obj]
    
    if type(obj) is dict:
        return { key: to_numbers(value) for key, value in obj.items() }
    
    if type(obj) is float or type(obj) is int:
        return obj

    try:
        return int(obj)
    except Exception as e:
        try:
            return float(obj)
        except Exception as e:
            print("Warning! Not a float: " + str(e))
            return 0

class CSVPipeReader:
    def __init__(self, path, file_fields, block_size=1, skip_lines=0, new_fifo=True):
        self.path = path
        
        if new_fifo:
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
            os.system(f"mkfifo {path}")

        self.file_fields = file_fields
        self.skip_lines=skip_lines

        self.file = None
        self.block_size = block_size
        self.buf = [{ key: 0 for key, _ in self.file_fields }] * self.block_size

    def open_file(self):
        while not os.path.exists(self.path):
            time.sleep(0.1)
        
        self.file = open(self.path, "r", buffering=1) # open with line buffering
    
    def readline(self):
        if self.file is None:
            self.open_file()
        line = ""
        while True:
            line += self.file.readline()
            if line[-1:] == "\n":
                if self.skip_lines <= 0:
                    break
                self.skip_lines -= 1
                line = ""
            time.sleep(0.001)
        return line[:-1].split()
    
    def close(self):
        if not self.file is None:
            self.file.close()

    def fill_buffer(self):
        for i in range(self.block_size):
            fields = self.readline()
            for j, (key, factor) in enumerate(self.file_fields):
                self.buf[i][key] = float(fields[j]) * factor


class CSVPipeWriter(ABC):
    def __init__(self, path, control_fields, new_fifo=True):
        self.path = path
        
        if new_fifo:
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
            os.system(f"mkfifo {path}")

        self.control = None
        self.control_fields = control_fields
    
    def open_file(self):
        self.file = open(self.path, "w", buffering=1) # open with line buffering
    
    def close(self):
        if not self.file is None:
            self.file.close()

    @abstractmethod
    def go_on(self, t):
        pass

    def set_control(self, p):
        self.control = [ int(factor * p[key]) for key, factor in self.control_fields ]

class CSVPipeModel(BaseModel):
    def __init__(self, backend, model_settings, run_settings):
        self.backend = backend
        self.run_settings = run_settings
        self.init_workdir()
        self.init_pipe_reader()
        self.state = self.csv_pipe_reader.buf[0]
        self.init_pipe_writer(model_settings)
    
    def init_workdir(self):
        self.work_dir = self.run_settings.workbasedir + "/" + self.run_settings.instance_id.get(self.backend) + "/"
        try:
            os.makedirs(self.work_dir)
        except FileExistsError:
            pass
        
    def init_pipe_reader(self):
        self.csv_pipe_reader = CSVPipeReader(
                path=self.work_dir + self.run_settings.outfile,
                file_fields=self.file_fields,
                skip_lines=self.run_settings.outfile_skiplines,
                new_fifo=not self.run_settings.no_new_run
                )

    def change_settings(self, model_settings, restart=False):
        self.p = to_numbers(model_settings['parameters'])

        if not restart:
            self.csv_pipe_writer.set_control(self.p)
    
    def stop(self):
        self.csv_pipe_writer.close()
        self.csv_pipe_reader.close()
    
    @abstractmethod
    def init_pipe_writer(self, model_settings):
        pass

    @abstractproperty
    def file_fields(self):
        pass

    @abstractproperty
    def control_fields(self):
        pass

    @staticmethod
    def prepare_environment(model_settings):
        os.environ["wsaddress"] = f"ws://{model_settings.address}:{model_settings.port}"

class InstanceId(str):
    use_handler_id = False
    
    def __new__(cls, *args, **kwargs):
        if type(args[0]) == InstanceId:
            return args[0]
        return super(InstanceId, cls).__new__(cls, *args, **kwargs)

    def get(self, backend):
        if self.use_handler_id:
            return str(backend.handler.id)
        return str(self)

handler_id = InstanceId("<random number>")
handler_id.use_handler_id = True

@dataclass
class RunSettings(BaseRunSettings):
    workbasedir: str        = field(default=".",           metadata={"help": "The working directory will be <workbasedir>/<instance_id>"})
    instance_id: InstanceId = field(default=handler_id,    metadata={"help": "The working directory will be <workbasedir>/<instance_id>"})
    infile: str             = field(default="default.csv", metadata={"help": "File name (inside working directory) for the *.csv file or pipe for settings (and more)"})
    outfile: str            = field(default="output.csv",  metadata={"help": "File name (inside working directory) for the *.csv file or pipe for generated data"})
    outfile_skiplines: int  = field(default=0,             metadata={"help": "Size of the ignored header of the file specified by --output"})
    no_new_run: bool        = field(default=False,         metadata={"help": "Do not generate new data but read existing data from a previous run"})
