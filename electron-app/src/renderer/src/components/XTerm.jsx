import React, { useState, useContext, useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { ReducerContext } from '../ReducerContext';


const XTerm = () => {
    const terminalRef = useRef(null);
    const [termContent, setTermContent] = useState([]);

    const terminal = new Terminal();

    const { state, dispatch } = useContext(ReducerContext);


    useEffect(() => {

        state.text === `print('Terminal Cleared')` ? document.getElementById('textArea').value = state.text2 : document.getElementById('textArea').value = state.text

        const runWorker = () => {
            dispatch({
                type: 'TEXT',
                payload: document.getElementById('textArea').value
            });
        };

        const clear = () => {
            terminal.reset();
            setTermContent([])
            dispatch({
                type: 'TEXT',
                payload: `print('Terminal Cleared')`
            });
        };

        // Listen for button clicks
        const button = document.getElementById('run');
        const button2 = document.getElementById('clear');


        button.addEventListener('click', runWorker);
        button2.addEventListener('click', clear);

        // Cleanup: remove event listener and destroy terminal
        return () => {
            button.removeEventListener('click', runWorker);
            button2.removeEventListener('click', clear);
            terminal.dispose();
        };
    }, []);


    useEffect(() => {


        const prev = () => {
            document.getElementById('textArea').value = state.text2
        };

        const button3 = document.getElementById('prev');
        button3.addEventListener('click', prev);

        return () => {
            button3.removeEventListener('click', prev);
        };
    }, [state.result]);


    useEffect(() => {
        setTermContent([...termContent, state.result])
    }, [state.result]);

    useEffect(() => {
        // Write the latest content to the terminal

        const terminal = new Terminal();
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        fitAddon.fit();
        terminal.open(terminalRef.current);
        termContent.map(value => terminal.writeln(value));
        return () => {
            terminal.dispose();
        };
    }, [termContent]);


    return (
        <div>
            <textarea id="textArea" /> <br />
            <button id="run">Run</button>
            <button id="clear">Clear</button>
            <button id="prev">Prev</button>
            <div ref={terminalRef}></div>
        </div>
    );
};

export default XTerm;

