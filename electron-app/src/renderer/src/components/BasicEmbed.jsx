import React, { useRef, useEffect } from 'react'


const { tableau } = window;

const options = {
    height: '1000px',
    width: '100%',
    hideToolbar: true,
    hideTabs: true,

    onFirstInteractive: function () {
        workbook = viz.getWorkbook();
        dash = viz.getWorkbook().getActiveSheet();
    }
}

function BasicEmbed() {
    const ref = useRef(null);
    // const url = 'https://public.tableau.com/views/SuperstoreOverviewDashboard_16978089170500/SuperstoreOverviewDashboard'
    const url = 'https://public.tableau.com/views/JSAPI-Superstore/Overview?:language=en&:display_count=y&publish=yes&:origin=viz_share_link'

    const initViz = () => {
        var viz = window.tableau.VizManager.getVizs()[0];

        if (viz) {

            viz.dispose();

        }
        viz = new tableau.Viz(ref.current, url, options)
        // viz = new tableau.Viz(this.container, url, options)
    }




    const exportPDF = () => {
        // viz.showExportPDFDialog();
        ref.current.showExportPDFDialog();
        // const viz = document.getElementById('tableauViz');
        // viz.displayDialogAsync("export-pdf");
    }

    const exportImage = () => {
        viz.showExportImageDialog();
    }

    const exportCrossTab = () => {
        viz.showExportCrossTabDialog('Total Sales');
    }

    const exportData = () => {
        viz.showExportDataDialog();
    }

    const revertAll = () => {
        workbook.revertAllAsync();
    }

    const refreshData = () => {
        viz.refreshDataAsync();
    }


    useEffect(initViz, [])
    console.log(ref.current)
    return (
        <div>
            <button className="button" onclick={exportImage}>Download Printable Image</button>
            <button className="button" onclick={exportPDF}>Export PDF</button>
            <button className="button" onclick={exportCrossTab}>Export Crosstab</button>
            <button className="button" onclick="revertAll()">Reset Filters</button>
            <button className="button" onclick="refreshData()">Refresh Data</button>
            <button className="button" onclick="toggleFullscreen()">Toggle Fullscreen</button>
            <div ref={ref} />
        </div>

    )
}

export default BasicEmbed