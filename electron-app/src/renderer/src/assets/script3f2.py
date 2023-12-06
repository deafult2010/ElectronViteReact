import numpy as np
# import np
import json
from scipy.optimize import minimize

#ValueOf minimise the absolute of variable - value = 0 (i.e. solve variable = value)
def objective(x):
    cMean = x[1]-x[3]*np.exp((x[2]**-2)/2)*np.sinh(x[0]/x[2])
    cStDev = np.sqrt(x[3]**2/2*(np.exp(x[2]**-2)-1)*(np.exp(x[2]**-2)*np.cosh(2*x[0]/x[2])+1))
    cSkew = -(x[3]**3*np.sqrt(np.exp(x[2]**-2))*(np.exp(x[2]**-2)-1)**2*(np.exp(x[2]**-2)*(np.exp(x[2]**-2)+2)*np.sinh(3*x[0]/x[2])+3*np.sinh(2*x[0]/x[2])))/(4*(cStDev**2)**1.5)
    k1 = (np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))**4+2*(np.exp(x[2]**-2))**3+2*(np.exp(x[2]**-2))**2-3)*np.cosh(4*x[0]/x[2])
    k2 = 4*(np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))+2)*np.cosh(3*x[0]/x[2])
    k3 = 3*(2*(np.exp(x[2]**-2))+1)
    cKurt = (x[3]**4*(np.exp(x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
    #Multiply cMean and cStDev by 100 to make them more sensitive in minimisation
    return abs(cMean - 0)*100 + abs(cStDev - 0.06)*100 + abs(cSkew - 0) + abs(cKurt - 3)
    # return +abs(-cSkew + 2)*100
# x0 = [0,0,5.521765,0.054318]
x0 = [3,0,8,5]
a = (0, 5)
bnds = ((-20,20),a,(-8,8),a)
# sol = minimize(objective,x0,method='Nelder-Mead',bounds=bnds)
sol = minimize(objective,x0,method='SLSQP',bounds=bnds)
cMean = sol.x[1]-sol.x[3]*np.exp((sol.x[2]**-2)/2)*np.sinh(sol.x[0]/sol.x[2])
cStDev = np.sqrt(sol.x[3]**2/2*(np.exp(sol.x[2]**-2)-1)*(np.exp(sol.x[2]**-2)*np.cosh(2*sol.x[0]/sol.x[2])+1))
cSkew = -(sol.x[3]**3*np.sqrt(np.exp(sol.x[2]**-2))*(np.exp(sol.x[2]**-2)-1)**2*(np.exp(sol.x[2]**-2)*(np.exp(sol.x[2]**-2)+2)*np.sinh(3*sol.x[0]/sol.x[2])+3*np.sinh(2*sol.x[0]/sol.x[2])))/(4*(cStDev**2)**1.5)
k1 = (np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))**4+2*(np.exp(sol.x[2]**-2))**3+2*(np.exp(sol.x[2]**-2))**2-3)*np.cosh(4*sol.x[0]/sol.x[2])
k2 = 4*(np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))+2)*np.cosh(3*sol.x[0]/sol.x[2])
k3 = 3*(2*(np.exp(sol.x[2]**-2))+1)
cKurt = (sol.x[3]**4*(np.exp(sol.x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
sol = {"cGamma": sol.x[0], "cDelta": sol.x[1], "cKsi": sol.x[2], "cLambda": sol.x[3], "cMean": cMean,"cStDev": cStDev,"cSkew": cSkew,"cKurt": cKurt}
sol = json.dumps(sol)
print(sol)