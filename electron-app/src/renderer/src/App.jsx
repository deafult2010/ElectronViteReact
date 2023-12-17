import React, { useState, useEffect, useMemo, useContext } from "react";
import Content from "./navigation/Content";
import Pyodide from "./components/Pyodide";
import ICEAnim from './components/ICEAnim';
import ReducerContextProvider from './ReducerContext';

const App = () => {
  return (
    <div className="app">
      <ReducerContextProvider>
        <ICEAnim />
        <Content />
        <Pyodide />
      </ReducerContextProvider>
    </div>
  );
};

export default App;