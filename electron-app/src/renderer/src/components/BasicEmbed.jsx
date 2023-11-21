import React, { useRef, useEffect, useState } from 'react'


const { tableau } = window;

function BasicEmbed() {
    const ref = useRef(null);
    const [vizi, setVizi] = useState(null);
    const [interact, setInteract] = useState(false);
    const [workbooki, setWorkbooki] = useState(null);
    const [dashi, setDashi] = useState(null);
    const url = 'https://public.tableau.com/views/JSAPI-Superstore/Overview?:language=en&:display_count=y&publish=yes&:origin=viz_share_link'

    const options = {
        height: '1000px',
        width: '100%',
        hideToolbar: true,
        hideTabs: true,

        onFirstInteractive: function () {
            setInteract(true)
        }
    }

    const initViz = () => {
        var viz = window.tableau.VizManager.getVizs()[0];
        if (viz) {
            viz.dispose();
        }
        viz = new tableau.Viz(ref.current, url, options)
        setVizi(viz);
    }

    useEffect(() => {
        console.log(interact)
        if (interact === true) {
            setWorkbooki(vizi.getWorkbook());
        }
    }, [interact])

    useEffect(() => {
        if (workbooki != null) {
            setDashi(workbooki.getActiveSheet());
        }
    }, [workbooki])

    useEffect(() => {
        if (dashi != null) {
            // do something on dashi being set
        }
    }, [dashi])





    const exportPDF = () => {
        ref.current.showExportPDFDialog();
    }

    const exportImage = () => {
        vizi.showExportImageDialog();
    }

    const exportCrossTab = () => {
        vizi.showExportCrossTabDialog('Total Sales');
    }

    const exportData = () => {
        vizi.showExportDataDialog();
    }

    const revertAll = () => {
        //revertAllAsync does not appear to work
        // workbooki.revertAllAsync();
        workbooki.showCustomViewAsync();
    }

    const refreshData = () => {
        vizi.refreshDataAsync();
    }

    const workbook = () => {
        console.log('click')
        dashi.getFiltersAsync().then((item) => {
            console.log(item[2].getAppliedValues()[0].value)
        })
    }


    useEffect(initViz, [])
    console.log(ref.current)
    return (
        <div>
            <button className="button" onClick={exportImage}>Download Printable Image</button>
            <button className="button" onClick={exportPDF}>Export PDF</button>
            <button className="button" onClick={exportData}>Export Data</button>
            <button className="button" onClick={exportCrossTab}>Export Crosstab</button>
            <button className="button" onClick={revertAll}>Reset Filters</button>
            <button className="button" onClick={refreshData}>Refresh Data</button>
            <button className="button" onClick={workbook}>Workbook</button>
            {/* <button className="button" onClick={toggleFullscreen}>Toggle Fullscreen</button> */}
            <div ref={ref} />
        </div>

    )
}

export default BasicEmbed