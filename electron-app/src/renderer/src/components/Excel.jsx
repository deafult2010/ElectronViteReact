import React from 'react';

const Excel = () => {
    const runBatFile = async () => {
        window.api.openCoderJeet();
    };
    const runBatFile2 = async () => {
        window.api.openExplorer();
    };
    const runBatFile3 = async () => {
        window.api.runBat();
    };

    return <div>
        <button onClick={runBatFile}>Open Browser</button>
        <button onClick={runBatFile2}>Open Explorer</button>
        <button onClick={runBatFile3}>Run Bat File</button>
    </div>
};

export default Excel;