import React from "react";
import { HashRouter as Router, Route, Link } from "react-router-dom";

import Main from "./Main";

// function Header({ runWorker }) {
function Header() {
    return (
        <Router>
            <div className="App">
                <nav className="navBar">
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/xterm">XTerm</Link>
                        </li>
                        <li>
                            <Link to="/pric">PRIC</Link>
                        </li>
                        <li>
                            <Link to="/pvar">PVaR</Link>
                        </li>
                        <li>
                            <Link to="/fhs">FHS</Link>
                        </li>
                        <li>
                            <Link to="/pca">PCA</Link>
                        </li>
                        <li>
                            <Link to="/evt">EVT</Link>
                        </li>
                        <li>
                            <Link to="/liq">LIQ</Link>
                        </li>
                        <li>
                            <Link to="/ccr">CCR</Link>
                        </li>
                        <li>
                            <Link to="/irm">IRM</Link>
                        </li>
                        <li>
                            <Link to="/tab">Tab</Link>
                        </li>
                    </ul>
                </nav>

                <Main />
                {/* <Main runWorker={runWorker} /> */}
            </div>
        </Router>
    );
}

export default Header;