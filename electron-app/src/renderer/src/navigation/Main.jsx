import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import XTerm from '../components/XTerm';
import VaR from '../components/VaR';
import BasicEmbed from '../components/BasicEmbed';
import Excel from '../components/Excel';
import Home from "../components/Home";

function Main() {
    return (
        <section>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/xterm" element={<XTerm />} />
                <Route path="/var" element={<VaR />} />
                <Route path="/tableau" element={<BasicEmbed />} />
                <Route path="/upload" element={<Excel />} />
            </Routes>
        </section>
    );
}

export default Main;