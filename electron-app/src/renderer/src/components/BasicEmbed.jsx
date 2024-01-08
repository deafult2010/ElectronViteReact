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
    const [token, setToken] = useState(state.token);
    const [server, setServer] = useState(state.server);
    const [site, setSite] = useState(state.site);
    const [ds, setDs] = useState(state.ds);
    const [view, setView] = useState(state.view);
    // const url = 'https://public.tableau.com/views/JSAPI-Superstore/Overview?:language=en&:display_count=y&publish=yes&:origin=viz_share_link'

    console.log(urlOption)
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

    const handleSiteChange = (e) => {
        setSite(e.target.value);
        dispatch({
            type: 'SITE',
            payload: e.target.value
        });
    };
    const handleServerChange = (e) => {
        setServer(e.target.value);
        dispatch({
            type: 'SERVER',
            payload: e.target.value
        });
    };
    const handleDsChange = (e) => {
        setDs(e.target.value);
        dispatch({
            type: 'DS',
            payload: e.target.value
        });
    };
    const handleViewChange = (e) => {
        setView(e.target.value);
        dispatch({
            type: 'VIEW',
            payload: e.target.value
        });
    };

    const signIn = async () => {
        // may need to change hard coded api value with future tableau server releases
        const url = `${server}/api/3.17/auth/signin`
        const resTok = await window.api.login(user, pass, url)
        setToken(resTok);
        dispatch({
            type: 'TOKEN',
            payload: resTok
        });
    };

    const loadData = async () => {
        // may need to change hard coded api value with future tableau server releases
        const url = `${server}/api/3.17/sites/${site}/views/${view}/data`
        const resData = await window.api.data(token, url)
        console.log(resData)
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
        urlOption === 'public' ? viz = new tableau.Viz(ref.current, publicUrl, options) : viz = new tableau.Viz(ref.current, serverUrl, options)
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

    const workbook = async () => {
        console.log('click')



        // dispatch({
        //     type: 'TABDATA',
        //     payload: tabData
        // });

        // dispatch({
        //     type: 'PARAM',
        //     payload: paramData
        // });

        // dispatch({
        //     type: 'TABDATA_SER',
        //     payload: tabDataSer
        // });

        // dispatch({
        //     type: 'PARAM_SER',
        //     payload: paramDataSer
        // });

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
                <option value="restapi">REST API</option>
            </select>
            {urlOption !== 'public' &&
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
            {urlOption != 'restapi' &&
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
            }
            {urlOption === 'restapi' &&
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px minmax(auto, 122px) 20px 60px minmax(auto, 150px) 200px',
                }}>
                    <div>
                        Server:
                    </div>
                    <div>
                        <input value={server} onChange={(value) => handleServerChange(value)} style={{ width: '100%' }}></input>
                    </div>
                    <div />
                    <div>
                        Site ID:
                    </div>
                    <div >
                        <input type="password" value={site} onChange={(value) => handleSiteChange(value)} style={{ width: '100%' }}></input>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto',
                        paddingLeft: '10px',
                    }}>
                        <div style={{ maxWidth: '830px' }}>
                            <button onClick={signIn}>Sign In</button>
                        </div>
                    </div>
                    <div>
                        DS ID:
                    </div>
                    <div>
                        <input value={ds} onChange={(value) => handleDsChange(value)} style={{ width: '100%' }}></input>
                    </div>
                    <div />
                    <div>
                        View ID:
                    </div>
                    <div >
                        <input type="password" value={view} onChange={(value) => handleViewChange(value)} style={{ width: '100%' }}></input>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto',
                        paddingLeft: '10px',
                    }}>
                        <div style={{ maxWidth: '830px' }}>
                            <button onClick={loadData}>Load Data</button>
                        </div>
                    </div>
                </div>
            }
            {urlOption != 'restapi' ?
                <div>
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
                : <div ref={ref} style={{ display: 'none' }} />}
        </div>

    )
}

export default BasicEmbed