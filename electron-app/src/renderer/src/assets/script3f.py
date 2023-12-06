import numpy as np
import math
import json
from scipy.optimize import minimize

#MLE minimise the negative of the sum (i.e. maximise the sum)
def objective(x):
    cMean = x[1]-x[3]*math.exp((x[2]**-2)/2)*math.sinh(x[0]/x[2])
    cStDev = math.sqrt(x[3]**2/2*(math.exp(x[2]**-2)-1)*(math.exp(x[2]**-2)*math.cosh(2*x[0]/x[2])+1))
    cSkew = -(x[3]**3*math.sqrt(math.exp(x[2]**-2))*(math.exp(x[2]**-2)-1)**2*(math.exp(x[2]**-2)*(math.exp(x[2]**-2)+2)*math.sinh(3*x[0]/x[2])+3*math.sinh(2*x[0]/x[2])))/(4*(cStDev**2)**1.5)
    k1 = (math.exp(x[2]**-2))**2*((math.exp(x[2]**-2))**4+2*(math.exp(x[2]**-2))**3+2*(math.exp(x[2]**-2))**2-3)*math.cosh(4*x[0]/x[2])
    k2 = 4*(math.exp(x[2]**-2))**2*((math.exp(x[2]**-2))+2)*math.cosh(3*x[0]/x[2])
    k3 = 3*(2*(math.exp(x[2]**-2))+1)
    cKurt = (x[3]**4*(math.exp(x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
    return abs(cKurt - 4)
# def constraintMean(x):
#     cMean = x[1]-x[3]*math.exp((x[2]**-2)/2)*math.sinh(x[0]/x[2])
#     return cMean
# def constraintStDev(x):
#     cStDev = math.sqrt(x[3]**2/2*(math.exp(x[2]**-2)-1)*(math.exp(x[2]**-2)*math.cosh(2*x[0]/x[2])+1))
#     return 0.01-cStDev
# def constraintSkew(x):
#     cStDev = math.sqrt(x[3]**2/2*(math.exp(x[2]**-2)-1)*(math.exp(x[2]**-2)*math.cosh(2*x[0]/x[2])+1))
#     cSkew = -(x[3]**3*math.sqrt(math.exp(x[2]**-2))*(math.exp(x[2]**-2)-1)**2*(math.exp(x[2]**-2)*(math.exp(x[2]**-2)+2)*math.sinh(3*x[0]/x[2])+3*math.sinh(2*x[0]/x[2])))/(4*(cStDev**2)**1.5)
#     return 0-cSkew
# def constraintKurt(x):
#     cStDev = math.sqrt(x[3]**2/2*(math.exp(x[2]**-2)-1)*(math.exp(x[2]**-2)*math.cosh(2*x[0]/x[2])+1))
#     k1 = (math.exp(x[2]**-2))**2*((math.exp(x[2]**-2))**4+2*(math.exp(x[2]**-2))**3+2*(math.exp(x[2]**-2))**2-3)*math.cosh(4*x[0]/x[2])
#     k2 = 4*(math.exp(x[2]**-2))**2*((math.exp(x[2]**-2))+2)*math.cosh(3*x[0]/x[2])
#     k3 = 3*(2*(math.exp(x[2]**-2))+1)
#     cKurt = (x[3]**4*(math.exp(x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
#     return 3-cKurt
# con0 = {'type': 'eq', 'fun': constraintMean}
# con1 = {'type': 'eq', 'fun': constraintStDev}
# con2 = {'type': 'eq', 'fun': constraintSkew}
# con3 = {'type': 'eq', 'fun': constraintKurt}
# cons = [con1,con2,con3]
x0 = [0,0,5.521765,0.054318]
b = (0, 10)
bnds = (b,b,b,b)
# sol = minimize(objective,x0,method='SLSQP',bounds=bnds,constraints=cons)
sol = minimize(objective,x0,method='Nelder-Mead',bounds=bnds)
cMean = sol.x[1]-sol.x[3]*math.exp((sol.x[2]**-2)/2)*math.sinh(sol.x[0]/sol.x[2])
cStDev = math.sqrt(sol.x[3]**2/2*(math.exp(sol.x[2]**-2)-1)*(math.exp(sol.x[2]**-2)*math.cosh(2*sol.x[0]/sol.x[2])+1))
cSkew = -(sol.x[3]**3*math.sqrt(math.exp(sol.x[2]**-2))*(math.exp(sol.x[2]**-2)-1)**2*(math.exp(sol.x[2]**-2)*(math.exp(sol.x[2]**-2)+2)*math.sinh(3*sol.x[0]/sol.x[2])+3*math.sinh(2*sol.x[0]/sol.x[2])))/(4*(cStDev**2)**1.5)
k1 = (math.exp(sol.x[2]**-2))**2*((math.exp(sol.x[2]**-2))**4+2*(math.exp(sol.x[2]**-2))**3+2*(math.exp(sol.x[2]**-2))**2-3)*math.cosh(4*sol.x[0]/sol.x[2])
k2 = 4*(math.exp(sol.x[2]**-2))**2*((math.exp(sol.x[2]**-2))+2)*math.cosh(3*sol.x[0]/sol.x[2])
k3 = 3*(2*(math.exp(sol.x[2]**-2))+1)
cKurt = (sol.x[3]**4*(math.exp(sol.x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
sol = {"cGamma": sol.x[0], "cDelta": sol.x[1], "cKsi": sol.x[2], "cLambda": sol.x[3], "cMean": cMean,"cStDev": cStDev,"cSkew": cSkew,"cKurt": cKurt}
sol = json.dumps(sol)
print(sol)