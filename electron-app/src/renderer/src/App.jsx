import React from 'react';
import Clock from './components/Clock';
import Box from './components/Box';
import ICEAnim from './components/ICEAnim';
import BasicEmbed from './components/BasicEmbed';
import ExportPDF from './components/ExportPDF';

const App = () => {
  return (
    <div className="app">
      <h1>Embed Tableau</h1>
      {/* <BasicEmbed /> */}
      <ExportPDF />
      <ICEAnim />
    </div>
  );
};

export default App;