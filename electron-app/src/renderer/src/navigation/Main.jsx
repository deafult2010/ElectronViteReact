import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "../components/Home";
import XTerm from '../components/XTerm';
import Pric from '../components/Pric';
import PVaR from '../components/PVaR';
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
                <Route path="/tableau" element={<BasicEmbed />} />
                <Route path="/upload" element={<Excel />} />
            </Routes>
        </section>
    );
}

export default Main;