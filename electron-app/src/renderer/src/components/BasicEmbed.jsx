import React, { useRef, useEffect, useState, useContext } from 'react'
import { ReducerContext } from '../ReducerContext';


const { tableau } = window;

function BasicEmbed() {
    const { state, dispatch } = useContext(ReducerContext);
    const ref = useRef(null);
    const [vizi, setVizi] = useState(null);
    const [interact, setInteract] = useState(false);
    const [workbooki, setWorkbooki] = useState(null);
    const [dashi, setDashi] = useState(null);
    const [sumData, setSumData] = useState(null);
    const [paramData, setParamData] = useState(state.param);
    const [tabData, setTabData] = useState(state.tabData);
    const [paramDataSer, setParamDataSer] = useState(state.paramSer);
    const [tabDataSer, setTabDataSer] = useState(state.tabDataSer);
    const [publicUrl, setPublicUrl] = useState(state.url);
    const [serverUrl, setServerUrl] = useState(state.serverurl);
    const [user, setUser] = useState(state.user);
    const [pass, setPass] = useState(state.pass);
    const [urlOption, setUrlOption] = useState(state.urloption);
    // const url = 'https://public.tableau.com/views/JSAPI-Superstore/Overview?:language=en&:display_count=y&publish=yes&:origin=viz_share_link'

    const handleUrlOptionChange = (e) => {
        setUrlOption(e.target.value);
        dispatch({
            type: 'URLOPTION',
            payload: e.target.value
        });
    };
    const handlePublicUrlChange = (e) => {
        setPublicUrl(e.target.value);
        dispatch({
            type: 'URLPUB',
            payload: e.target.value
        });
    };
    const handleServerUrlChange = (e) => {
        setServerUrl(e.target.value);
        dispatch({
            type: 'URLSER',
            payload: e.target.value
        });
    };
    const handleUserChange = (e) => {
        setUser(e.target.value);
        dispatch({
            type: 'USER',
            payload: e.target.value
        });
    };
    const handlePassChange = (e) => {
        setPass(e.target.value);
        dispatch({
            type: 'PASS',
            payload: e.target.value
        });
    };


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
        urlOption === 'public' ? viz = new tableau.Viz(ref.current, publicUrl, options) : viz = new tableau.Viz(ref.current, publicUrl, options)
        // vizServer = new tableau.Viz(ref.current, serverUrl, options)
        setVizi(viz);
        // setViziServer(viz);
    }

    const onParamSelection = (paramEvent) => {
        const param = paramEvent.getParameterAsync()
        param.then(p => {
            urlOption === 'public' ? setParamData(p.getCurrentValue().value) : setParamDataSer(p.getCurrentValue().value)
        })
    }

    useEffect(() => {
        if (interact === true) {
            setWorkbooki(vizi.getWorkbook());
            vizi.addEventListener(tableau.TableauEventName.PARAMETER_VALUE_CHANGE, onParamSelection);
        }
    }, [interact])

    useEffect(() => {
        if (workbooki != null) {
            setDashi(workbooki.getActiveSheet());
            // get Param from context
            if (urlOption === 'public') {
                const param = workbooki.changeParameterValueAsync('ReturnParam', paramData);
                param.then(p => {
                    setParamData(p.getCurrentValue().value)
                })
            } else {
                const param = workbooki.changeParameterValueAsync('ReturnParam', paramDataSer);
                param.then(p => {
                    setParamDataSer(p.getCurrentValue().value)
                })
            }
        }
    }, [workbooki])

    useEffect(() => {
        if (dashi != null) {
            // do something on dashi being set
            // setSumData(dashi.getSummaryDataAsync())
            setSumData(dashi.getWorksheets()[0].getSummaryDataAsync())
        }
    }, [dashi])

    useEffect(() => {
        if (sumData != null) {
            sumData.then(t => {
                // note the t.getData() incorrectly returns this.$0.get_rows() where instead it should return this.$0.$3
                const json = t.$0.$3
                const prices = json.map((subArr) => {
                    const [dateArr, valArr] = subArr;
                    if (valArr.value != 'null') {
                        return { Date: dateArr.value, Price: Number(parseFloat(valArr.value).toFixed(2)) };
                    }
                    return null;
                }).filter(Boolean);
                urlOption === 'public' ? setTabData(prices) : setTabDataSer(prices)
            })
        }
    }, [sumData])

    useEffect(() => {
        if (dashi != null) {
            // setSumData(dashi.getSummaryDataAsync())
            setSumData(dashi.getWorksheets()[0].getSummaryDataAsync())
        }
    }, [paramData, paramDataSer])

    useEffect(() => {
        if (dashi != null) {
            dispatch({
                type: 'TABDATA',
                payload: tabData
            });
            dispatch({
                type: 'PARAM',
                payload: paramData
            });
            dispatch({
                type: 'TABDATA_SER',
                payload: tabDataSer
            });
            dispatch({
                type: 'PARAM_SER',
                payload: paramDataSer
            });
        }
    }, [tabData, tabDataSer])

    const loadDashboard = () => {
        console.log('click')
    }

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

        dispatch({
            type: 'TABDATA',
            payload: tabData
        });

        dispatch({
            type: 'PARAM',
            payload: paramData
        });

        dispatch({
            type: 'TABDATA_SER',
            payload: tabDataSer
        });

        dispatch({
            type: 'PARAM_SER',
            payload: paramDataSer
        });

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

        // if (dashi != null) {
        //     // Get Data by setting state which will trigger the above useEffect
        //     // setSumData(dashi.getSummaryDataAsync())
        //     setSumData(dashi.getWorksheets()[0].getSummaryDataAsync())
        // }
    }

    useEffect(() => {
        initViz();
        return () => {
            setInteract(false)
        }
    }, [urlOption])
    return (
        <div>
            Source: <select value={urlOption} onChange={handleUrlOptionChange} style={{
                backgroundColor: 'rgba(192, 227, 227, 1)',
                width: '130px',
            }}>
                <option value="public">Tableau Public</option>
                <option value="server">Tableau Server</option>
            </select>
            {urlOption === 'server' &&
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px minmax(auto, 122px) 20px 60px minmax(auto, 150px) 150px auto',
                }}>
                    <div>
                        User:
                    </div>
                    <div>
                        <input value={user} onChange={(value) => handleUserChange(value)} style={{ width: '100%' }}></input>
                    </div>
                    <div />
                    <div>
                        Pass:
                    </div>
                    <div >
                        <input type="password" value={pass} onChange={(value) => handlePassChange(value)} style={{ width: '100%' }}></input>
                    </div>
                </div>
            }
            <div style={{
                display: 'grid',
                gridTemplateColumns: '60px minmax(auto, 800px) 20px 130px',
            }}>
                <div>
                    URL:
                </div>
                <div style={{ maxWidth: '830px' }}>
                    {urlOption === 'public' ? <input value={publicUrl} onChange={(value) => handlePublicUrlChange(value)} style={{ width: '100%', maxWidth: '830px' }}></input> : <input value={serverUrl} onChange={(value) => handleServerUrlChange(value)} style={{ width: '100%', maxWidth: '830px' }}></input>}
                </div>
                <div />
                <div style={{ maxWidth: '830px' }}>
                    <button onClick={loadDashboard}>Load Dashboard</button>
                </div>
            </div>
            <button onClick={exportImage}>Download Printable Image</button>
            <button onClick={exportPDF}>Export PDF</button>
            <button onClick={exportData}>Export Data</button>
            <button onClick={exportCrossTab}>Export Crosstab</button>
            <button onClick={revertAll}>Reset Filters</button>
            <button onClick={refreshData}>Refresh Data</button>
            <button onClick={workbook}>Workbook</button>
            {/* <button onClick={toggleFullscreen}>Toggle Fullscreen</button> */}
            <div ref={ref} style={{ display: 'inline' }} />

        </div>

    )
}

export default BasicEmbed