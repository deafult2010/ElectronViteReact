import React, { useState, useEffect, useMemo, useContext } from "react";
import Content from "./navigation/Content";
import Pyodide from "./components/Pyodide";
// import Clock from './components/Clock';
// import Box from './components/Box';
// import EquationSolver from './components/EquationSolver';
// import XTerm from './components/XTerm';
// import CSVtoJSONConverter from './components/CSVtoJSONConverter';
import ICEAnim from './components/ICEAnim';
// import SolverMLE from './components/SolverMLE';
// import BasicEmbed from './components/BasicEmbed';
// import ExportPDF from './components/ExportPDF';
import ReducerContextProvider from './ReducerContext';
import { ReducerContext } from './ReducerContext';

const App = () => {



  // useEffect(() => {
  //   console.log(state.text)
  // }, [state.text]);

  // const runWorker = () => {
  //   webWorker.postMessage(`print('123')`)
  //   console.log('hi all')
  // }


  // Function to run python
  const run = async () => {
    console.log('running')

    // Write rand number
    // const randomNumber = Math.floor(Math.random() * 100);
    // terminal.writeln(`Random Number: ${randomNumber}`);


    // Read the equation from the text area
    // const equation = document.getElementById("textArea").value;

    // // Evaluate the equation and output the result
    // const result = eval(equation);
    // console.log(result)
    // // terminal.writeln('123');
    // terminal.writeln(`Result: ${result}`);

    // let pyodide = await loadPyodide({
    //     indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
    //     stdout: (s) => { terminal.writeln(s) },
    //     stderr: (s) => { terminal.writeln(s) }
    // });
    // await pyodide.loadPackage(['sympy']);

    //     const code = `from sympy.solvers import solve
    // from sympy import *
    // from js import Object, Map, Array
    // from pyodide.ffi import to_js
    // x, y = symbols('x y')
    // eq1 = Eq(x + y, 10)
    // eq2 = Eq(2*x + 3*y, 26)
    // solution = solve((eq1, eq2), (x, y))
    // solution_js = {'x': float(solution[x]), 'y': float(solution[y])}
    // solution_js = to_js(solution_js, dict_converter=Object.fromEntries)
    // solution_js`

    const code = `print('hello')`

    console.log(code)

    // await webWorker.postMessage(code)
    // await webWorker.postMessage('5+4')
    // np_array = pyodide.runPython(`solution_js`)
    // console.log(np_array)
  };

  return (
    <div className="app">
      <ReducerContextProvider>
        <ICEAnim />
        {/* <Content runWorker={runWorker} /> */}
        <Content />
        <Pyodide />
      </ReducerContextProvider>
    </div>
  );
};

export default App;