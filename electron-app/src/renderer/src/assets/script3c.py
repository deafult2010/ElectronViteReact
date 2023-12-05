import json
import math

def multiply_and_sum(json_data):
    data = json.loads(json_data)
    multiplied_data = [element * 2 for element in data]
    total_sum = sum(multiplied_data)
    return total_sum

def objective(x):
    json_data = "[-11.98, -9.51, -7.6, -5.89, -5.18, -4.89, -4.42, -4.41, -4.34, -4.32, -4.04, -3.88, -3.63, -3.56]"
    data = json.loads(json_data)
    multiplied_data = [math.log(x[2]/(x[3]*math.sqrt(2*math.pi))*math.exp(-1/2*(x[0]+x[2]*math.asinh((e-x[1])/x[3]))**2)/math.sqrt(1+((e-x[1])/x[3])**2)) for e in data]
    MLE = sum(multiplied_data)
    return MLE


# json_data = "[-11.98, -9.51, -7.6, -5.89, -5.18, -4.89, -4.42, -4.41, -4.34, -4.32, -4.04, -3.88, -3.63, -3.56]"
# result = multiply_and_sum(json_data)
x = [0.04,0,1.05,0.01]
result = objective(x)
print(result)