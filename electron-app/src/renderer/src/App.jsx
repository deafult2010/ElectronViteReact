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

const App = () => {
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