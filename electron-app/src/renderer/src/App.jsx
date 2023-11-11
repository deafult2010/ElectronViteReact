import React from 'react';
import Clock from './components/Clock';
import Box from './components/Box';
import EquationSolver from './components/EquationSolver';
import XTerm from './components/XTerm';
import CSVtoJSONConverter from './components/CSVtoJSONConverter';
import ICEAnim from './components/ICEAnim';
import SolverMLE from './components/SolverMLE';
import BasicEmbed from './components/BasicEmbed';
import ExportPDF from './components/ExportPDF';

const App = () => {
  return (
    <div className="app">
      <h1>Embed Tableau</h1>
      {/* <BasicEmbed /> */}
      {/* <ExportPDF /> */}
      {/* <CSVtoJSONConverter /> */}
      <XTerm />
      {/* <EquationSolver /> */}
      {/* <SolverMLE /> */}
      <ICEAnim />
    </div>
  );
};

export default App;