#Maximum likelihood estimation template solve programatically using scipy
import numpy as np
from scipy.stats import johnsonsu
import json

r = johnsonsu.ppf(0.99, 0, 2.145, 0, 0.0192)
print(r)

