import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "../components/Home";
import XTerm from '../components/XTerm';
import Pric from '../components/Pric';
import PVaR from '../components/PVaR';
import Fhs from '../components/Fhs';
import Pca from '../components/Pca';
import Evt from '../components/Evt';
import Liq from '../components/Liq';
import Ccr from '../components/Ccr';
import Irm from '../components/Irm';
import Excel from '../components/Excel';
import BasicEmbed from '../components/BasicEmbed';

function Main() {
    return (
        <section>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/xterm" element={<XTerm />} />
                <Route path="/pric" element={<Pric />} />
                <Route path="/pvar" element={<PVaR />} />
                <Route path="/fhs" element={<Fhs />} />
                <Route path="/pca" element={<Pca />} />
                <Route path="/evt" element={<Evt />} />
                <Route path="/liq" element={<Liq />} />
                <Route path="/ccr" element={<Ccr />} />
                <Route path="/tab" element={<BasicEmbed />} />
                <Route path="/irm" element={<Irm />} />
                <Route path="/upload" element={<Excel />} />
            </Routes>
        </section>
    );
}

export default Main;