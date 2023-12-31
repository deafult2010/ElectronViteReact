#Rubbish code generated by Chat GPT
import numpy as np
from scipy.optimize import linprog

def calculate_mle(sample):
    n = len(sample)
    
    # Define the objective function
    c = [-1, 0]  # We want to maximize mu, so minimize -mu
    A = [[-1, 0], [0, -1], [1, 0], [0, 1]]  # constraints: -mu <= 0, -sigma <= 0, mu <= 0, sigma <= 0
    b = [0, 0, 0, 0]
    
    # Define the equality constraint for mean
    A_eq = [[1, 1]]
    b_eq = [0]
    
    # Define the bounds for mean and standard deviation
    bounds = [(None, None), (0, None)]
    
    # Solve the linear programming problem
    res = linprog(c, A_ub=A, b_ub=b, A_eq=A_eq, b_eq=b_eq, bounds=bounds)
    mu_mle, sigma_mle = res.x

    return mu_mle, sigma_mle

sample_data = [1, 2, 3, 4, 5]
mu_mle, sigma_mle = calculate_mle(sample_data)

print("MLE for mean (mu):", mu_mle)
print("MLE for standard deviation (sigma):", sigma_mle)