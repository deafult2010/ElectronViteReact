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
                            <Link to="/upload">Upload</Link>
                        </li>
                        <li>
                            <Link to="/xterm">XTerm</Link>
                        </li>
                        <li>
                            <Link to="/var">VaR</Link>
                        </li>
                        <li>
                            <Link to="/tableau">Tableau</Link>
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