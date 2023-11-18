#Maximum likelihood estimation template solve programatically using scipy
import numpy as np
from scipy.optimize import minimize

#minimise objective
#MLE minimise the negative of the sum (i.e. maximise the sum)
def objective(x):
    x1 = x[0]
    x2 = x[1]
    x3 = x[2]
    x4 = x[3]
    return x1*x4*(x1+x2+x3)+x3

#MLE will need to constrain 
def constraint1(x):
    return x[0]*x[1]*x[2]*x[3]-25.0

def constraint2(x):
    sum_eq = 40
    # sum_eq = sum_eq - (np.square(x[0])+np.square(x[1])+np.square(x[2])+np.square(x[3]))
    for i in range(4):
        sum_eq = sum_eq - x[i]**2
    return sum_eq

x0 = [1,5,5,1]
# print(objective(x0))

b = (1.0,5.0)
bnds = (b,b,b,b)
con1 = {'type': 'ineq', 'fun': constraint1}
con2 = {'type': 'eq', 'fun': constraint2}
cons = [con1,con2]

sol = minimize(objective,x0,method='SLSQP',bounds=bnds,constraints=cons)
# print(sol)
print(sol.x[0])