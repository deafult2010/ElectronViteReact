import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const XTerm = () => {
    const terminalRef = useRef(null);

    useEffect(() => {
        const terminal = new Terminal();
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(terminalRef.current);
        fitAddon.fit();

        // Function to run python
        const run = () => {

            // Write rand number
            // const randomNumber = Math.floor(Math.random() * 100);
            // terminal.writeln(`Random Number: ${randomNumber}`);


            // Read the equation from the text area
            const equation = document.getElementById("textArea").value;

            // Evaluate the equation and output the result
            const result = eval(equation);
            console.log(result)
            // terminal.writeln('123');
            terminal.writeln(`Result: ${result}`);
        };

        const clear = () => {
            terminal.reset();
        };

        // Listen for button clicks
        const button = document.getElementById('run');
        const button2 = document.getElementById('clear');
        button.addEventListener('click', run);
        button2.addEventListener('click', clear);

        // Cleanup: remove event listener and destroy terminal
        return () => {
            button.removeEventListener('click', run);
            button2.removeEventListener('click', clear);
            terminal.dispose();
        };
    }, []);

    return (
        <div>
            <textarea id="textArea" /> <br />
            <button id="run">Run</button>
            <button id="clear">Clear</button>
            <div ref={terminalRef}></div>
        </div>
    );
};

export default XTerm;

