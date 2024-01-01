import React, { useRef, useEffect, useState } from 'react'


const { tableau } = window;

function BasicEmbed() {
    const ref = useRef(null);
    const [vizi, setVizi] = useState(null);
    const [interact, setInteract] = useState(false);
    const [workbooki, setWorkbooki] = useState(null);
    const [dashi, setDashi] = useState(null);
    const [sumData, setSumData] = useState(null);
    const [paramData, setParamData] = useState(null);
    const [data, setData] = useState(null);
    // const url = 'https://public.tableau.com/views/JSAPI-Superstore/Overview?:language=en&:display_count=y&publish=yes&:origin=viz_share_link'
    const url = 'https://public.tableau.com/views/Returns_17038617360470/Returns?:language=en-US&:display_count=n&:origin=viz_share_link'

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

    const onParamSelection = (paramEvent) => {
        const abc = paramEvent.getParameterAsync()
        abc.then(p => {
            setParamData(p.getCurrentValue().value)
        })
    }

    useEffect(() => {
        console.log(interact)
        if (interact === true) {
            setWorkbooki(vizi.getWorkbook());
            vizi.addEventListener(tableau.TableauEventName.PARAMETER_VALUE_CHANGE, onParamSelection);
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
            setSumData(dashi.getSummaryDataAsync())
        }
    }, [dashi])

    useEffect(() => {
        if (sumData != null) {
            sumData.then(t => {
                // note the t.getData() incorrectly returns this.$0.get_rows() where instead it should return this.$0.$3
                const json = t.$0.$3
                const pig = json.map((subArr) => {
                    const [dateArr, typeArr, val1Arr, val2Arr] = subArr;
                    if (val2Arr.value != 'null') {
                        return { date: dateArr.value, price: val2Arr.value };
                    }
                    return null;
                }).filter(Boolean);
                setData(pig)
                console.log(pig)
            })
        }
    }, [sumData])

    useEffect(() => {
        if (paramData != null) {
            setSumData(dashi.getSummaryDataAsync())
        }
    }, [paramData])

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

        // Get Filters Data
        // dashi.getFiltersAsync().then((item) => {
        //     console.log(item[2].getAppliedValues()[0].value)
        // })

        // Get Param Data
        // const paramObjs = workbooki.getParametersAsync()
        // paramObjs.then(function (paramObjs) {
        //     for (var i = 0; i < paramObjs.length; i++) {
        //         try {
        //             // console.log(paramObjs[0].getName())
        //             console.log(paramObjs[0])
        //             console.log(paramObjs[0].getAllowableValues())
        //             var name = paramObjs[i].getName();
        //             var value = paramObjs[i].getCurrentValue();
        //             params[name] = value.value;
        //         } catch (e) { }
        //     }
        // });


        // // Update a Param
        // workbooki.changeParameterValueAsync('ReturnParam', 'Norm').then(function (updateParameter) {
        //     console.log('updateParameter : ', updateParameter);
        // });
        // // Approach 2
        // setParamData(workbooki.changeParameterValueAsync('ReturnParam', 'Norm'));


        // getUnderlyingTableDataAsync does not work on Tableau Public
        // const tableData = dashi.getUnderlyingTableDataAsync()
        // tableData.then(t => {
        //     console.log(t)
        // })

        if (dashi != null) {
            // Get Data by setting state which will trigger the above useEffect
            setSumData(dashi.getSummaryDataAsync())
        }
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