import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

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
                            <Link to="/excel">Excel</Link>
                        </li>
                        <li>
                            <Link to="/xterm">XTerm</Link>
                        </li>
                        <li>
                            <Link to="/data-upload">Data Upload</Link>
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