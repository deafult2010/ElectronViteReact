import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Clock from '../components/Clock';
import Box from '../components/Box';
import EquationSolver from '../components/EquationSolver';
import XTerm from '../components/XTerm';
import CSVtoJSONConverter from '../components/CSVtoJSONConverter';
import ICEAnim from '../components/ICEAnim';
import SolverMLE from '../components/SolverMLE';
import BasicEmbed from '../components/BasicEmbed';
import ExportPDF from '../components/ExportPDF';
import Home from "../components/Home";

// function Main({ runWorker }) {
function Main() {
    return (
        <section>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/xterm" element={<XTerm />} />
                <Route path="/data-upload" element={<CSVtoJSONConverter />} />
                {/* <Route path="/message" element={<Message runWorker={runWorker} />} /> */}
                {/* <Route path="/embed/" component={BasicEmbed} />
            <Route path="/dynamic-load/" component={DynamicLoad} />
            <Route path="/export-pdf/" component={ExportPDF} />
            <Route path="/filter/" component={Filter} />
            <Route path="/get-data/" component={GetData} />
            <Route path="/resize/" component={Resize} />
            <Route path="/events/" component={Events} />
            <Route path="/animation/" component={Animation} /> */}
            </Routes>
        </section>
    );
}

export default Main;