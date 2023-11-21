import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import EquationSolver from '../components/EquationSolver';
import XTerm from '../components/XTerm';
import CSVtoJSONConverter from '../components/CSVtoJSONConverter';
import ICEAnim from '../components/ICEAnim';
import SolverMLE from '../components/SolverMLE';
import BasicEmbed from '../components/BasicEmbed';
import Home from "../components/Home";

// function Main({ runWorker }) {
function Main() {
    return (
        <section>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/xterm" element={<XTerm />} />
                <Route path="/data-upload" element={<CSVtoJSONConverter />} />
                <Route path="/tableau/" element={<BasicEmbed />} />
            </Routes>
        </section>
    );
}

export default Main;