import random
import spimosim_server
import sys
import numpy as np
from math import exp

class IsingModel:
    def __init__(self, model_settings):
        self.state = {}
        self.change_settings(model_settings)

    def change_settings(self, model_settings, restart):
        self.j = model_settings['parameters']['j']
        self.beta = model_settings['parameters']['beta']
        self.width = model_settings['network']['width']
        self.height = model_settings['network']['height']
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
        

def main(argv):
    argv2 = [ '127.0.0.1', '8090', r'/' ]
    argv2[0:len(argv)] = argv
    spimosim_server.start(*argv2, IsingModel)

if __name__ == '__main__':
    main(sys.argv[1:])
