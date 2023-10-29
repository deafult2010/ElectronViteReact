import React, { useState, useEffect, useRef } from "react";
const { tableau } = window;

function ExportPDF() {
    const [url] = useState("https://public.tableau.com/views/RegionalSampleWorkbook/Obesity");
    const [vizi, setVizi] = useState(null);
    const ref = useRef(null);


    const exportToPDF = () => {
        vizi.showExportPDFDialog();
    };

    const initViz = () => {
        var viz = window.tableau.VizManager.getVizs()[0];

        if (viz) {

            viz.dispose();

        }
        viz = new tableau.Viz(ref.current, url)
        setVizi(viz);
    };

    useEffect(initViz, []);

    return (
        <div>
            <h1>Export PDF</h1>
            <button onClick={exportToPDF}>Export PDF</button>
            <div style={setVizStyle} ref={ref} />
        </div>
    );
}

const setVizStyle = {
    width: "800px",
    height: "700px",
};


export default ExportPDF;