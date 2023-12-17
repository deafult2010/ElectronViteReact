// import React, { useEffect, useState } from 'react';
// // import * as pyodide from 'pyodide';
// import { loadPyodide } from 'pyodide'

const EquationSolver = () => {
    //     const [solution, setSolution] = useState(null);

    //     const solveEquations = async () => {
    //         let pyodide = await loadPyodide({
    //             indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    //             stdout: (s) => { terminal.print(s) },
    //             stderr: (s) => { terminal.print(s) }
    //         });
    //         await pyodide.loadPackage(['sympy']);

    //         // Define the equations
    //         const eq1 = 'Eq(x+y, 10)';
    //         const eq2 = 'Eq(2*x+3*y, 26)';

    //         pyodide.runPython('from sympy.solvers import solve')
    //         pyodide.runPython('from sympy import *')
    //         pyodide.runPython('from js import Object, Map, Array')
    //         pyodide.runPython('from pyodide.ffi import to_js')
    //         pyodide.runPython(`x, y = symbols('x y')`)
    //         pyodide.runPython('eq1 = Eq(x+y, 10)')
    //         pyodide.runPython('eq2 = Eq(2*x+3*y, 26)')
    //         pyodide.runPython('solution = solve((eq1, eq2), (x, y))')
    //         pyodide.runPython(`solution_js = {'x': float(solution[x]), 'y': float(solution[y])}`)
    //         pyodide.runPython(`solution_js = to_js(solution_js, dict_converter=Object.fromEntries)`)
    //         // pyodide.runPython('solution_js')

    //         let np_array = pyodide.runPython(`solution_js`)
    //         console.log(np_array)

    //         setSolution(pyodide.runPython(`solution_js`))
    //         console.log(solution)
    //     };

    //     useEffect(() => {
    //         solveEquations();
    //     }, []);

    //     return (
    //         <div>
    //             <h2>Solution:</h2>
    //             {solution ? (
    //                 <ul>
    //                     {Object.entries(solution).map(([key, value]) => (
    //                         <li key={key}>
    //                             {key}: {value}
    //                         </li>
    //                     ))}
    //                 </ul>
    //             ) : (
    //                 <p>Loading...</p>
    //             )}
    //         </div>
    //     );
};

export default EquationSolver;