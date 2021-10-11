import random
from pyspimosim.base_model import BaseModel, RunSettings, main as _main
import sys
import numpy as np
from math import exp

class IsingModel(BaseModel):
    def __init__(self, backend, model_settings, run_settings):
        super().__init__(backend, model_settings, run_settings)
        self.state = {}
        self.change_settings(model_settings)

    def change_settings(self, model_settings, restart=False):
        self.j = model_settings['parameters']['j']
        self.beta = model_settings['parameters']['beta']
        self.width = self.height = model_settings['network']['L']
        self.state['sigma'] = np.full(self.width * self.height, -1, np.int8)
        self.state['magnetisation'] = sum(self.state['sigma']) * 1.

    def step(self, vars_config, t):
        sigma = self.state['sigma']
        width = self.width
        height = self.height
        n = width * height
        betaj = self.beta * self.j
        
        for i in range(n):
            k = random.randint(0, n-1)
            s = 0
            if k % self.width != 0:
                s += sigma[k - 1]
            if (k + 1) % self.width != 0:
                s += sigma[k + 1]
            if (k - self.width) >= 0:
                s += sigma[k - width]
            if (k + self.width) < n:
                s += sigma[k + width]

            sigma[k] = 1 if random.random() > 1 / (1 + exp(betaj * s)) else -1
        self.state['magnetisation'] = sum(self.state['sigma']) * 1.

Model = IsingModel
ModelSettings = RunSettings

def main(args=None):
    _main(Model, ModelSettings, args=args)

if __name__ == '__main__':
    main()
