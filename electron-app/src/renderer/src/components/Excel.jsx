import React from 'react';

const Excel = () => {
    const runBrowser = async () => {
        window.api.openCoderJeet();
    };
    const runExplorer = async () => {
        window.api.openExplorer();
    };
    const runBatFile = async () => {
        window.api.runBat();
    };

    return <div>
        <button onClick={runBrowser}>Open Browser</button>
        <button onClick={runExplorer}>Open Explorer</button>
        <button onClick={runBatFile}>Run Bat File</button>
    </div>
};

export default Excel;