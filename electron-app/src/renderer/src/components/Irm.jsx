import React, { useState, useContext, useEffect } from "react";
import Papa from "papaparse";
import { ReducerContext } from '../ReducerContext';
import FngPf from '../assets/FngPf.json'

const IRM = () => {
    const { state, dispatch } = useContext(ReducerContext);
    const [csvFile, setCSVFile] = useState(null);
    const [inputOption, setInputOption] = useState('local');
    const [user, setUser] = useState(state.userICA);
    const [pass, setPass] = useState(state.passICA);
    const [token, setToken] = useState(state.tokenICA);
    const [result, setResult] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCSVFile(file);
    };

    const handleInputChange = (e) => {
        setInputOption(e.target.value);
    };

    const convertCSVtoJSON = () => {
        Papa.parse(csvFile, {
            complete: (results) => {
                const { data } = results;

                // Assuming the first row contains headers
                const headers = data[0];
                const initialData = data.slice(1, data.length - 1).map((row) =>
                    headers.reduce(
                        (obj, header, index) => ({ ...obj, [header]: row[index] }),
                        {}
                    )
                );

                dispatch({
                    type: 'PORTFOLIO',
                    payload: initialData
                });
            }
        });
    }

    const loadJSON = () => {
        dispatch({
            type: 'PORTFOLIO',
            payload: FngPf
        });
    }

    const signIn = async () => {
        // may need to change hard coded api value with future tableau server releases
        const url = `https://ica.ice.com/ICA/Api/v1/Authenticate`
        const resTok = await window.api.authenicate(user, pass, url)
        setToken(resTok);
        dispatch({
            type: 'TOKEN_ICA',
            payload: resTok
        });
    };

    const calcIRM = async () => {
        // may need to change hard coded api value with future tableau server releases
        const url = `https://ica.ice.com/ICA/Api/v1/CalculateIrmIm`

        {
            state.portfolio.map((item, index) => (
                <tr key={index} style={index % 2 === 0 ? rowStyles : altRowStyles}>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.id}</td>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.exch}</td>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.commodity}</td>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.secType}</td>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.expiry}</td>
                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.longQty}</td>
                </tr>
            ))
        }

        const pf = {
            "portfolios": [
                {
                    "id": "Pf1",
                    "positions": state.portfolio.map(item => ({
                        "id": item.id,
                        "exch": item.exch,
                        "commodity": item.commodity,
                        "secType": item.secType,
                        "expiry": item.expiry,
                        "longQty": item.longQty
                    }))
                }
            ]
        }
        const res = await window.api.calcIRM(pf, token, url)
        console.log(res)
        res.portfolios ? setResult(res.portfolios[0].currencies[0].im) : setResult(res.errorDescription);
    };

    const handleUserChange = (e) => {
        setUser(e.target.value);
        dispatch({
            type: 'USER_ICA',
            payload: e.target.value
        });
    };
    const handlePassChange = (e) => {
        setPass(e.target.value);
        dispatch({
            type: 'PASS_ICA',
            payload: e.target.value
        });
    };

    useEffect(() => {
        console.log(state.portfolio);
    }, [state.portfolio]);

    const altRowStyles = {
        background: 'white',
    };

    const rowStyles = {
        background: '#d4e5ff',
    };

    return (
        <div>
            <h1 style={{ margin: '0px', textAlign: 'center' }}>ICE Risk Model (IRM)</h1>
            <div style={{ paddingLeft: '10px', }}>
                <div style={{
                    width: '390px',
                    display: 'grid',
                    gridTemplateColumns: '60px 150px 350px 120px 80px',
                }}>
                    <h1 style={{ margin: '5px', }}>Data</h1>
                    <div style={{
                        margin: 'auto auto 12px 0px',
                        padding: '0 20px',
                    }}>
                        <select value={inputOption} onChange={handleInputChange} style={{
                            backgroundColor: 'rgba(192, 227, 227, 1)',
                            width: '130px',
                        }}>
                            <option value="local">Local</option>
                            <option value="csv">CSV</option>
                            <option value="sqlapi">SQL API</option>
                            <option value="sqllocal">SQL Local</option>
                            <option value="tableau">Tableau</option>
                        </select>
                    </div>
                    {
                        inputOption === 'local' ?
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto',
                                paddingLeft: '10px',
                                paddingTop: '10px'
                            }}>
                                <div>
                                    <button onClick={loadJSON}>Load Data</button>
                                </div>
                            </div>
                            : inputOption === 'csv' ?
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto',
                                    paddingLeft: '10px',
                                    paddingTop: '10px'
                                }}>
                                    <div>
                                        <input type="file" onChange={handleFileChange} />
                                        <button onClick={convertCSVtoJSON}>Load Data</button>
                                    </div>
                                </div>
                                : inputOption === 'sqlapi' ? <div />
                                    : inputOption === 'sqllocal' ? <div />
                                        : inputOption === 'tableau' ?
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'auto',
                                                paddingLeft: '10px',
                                                paddingTop: '10px'
                                            }}>
                                                <div>
                                                    <button>Load Data</button>
                                                </div>
                                            </div>
                                            : null
                    }
                </div>
            </div>
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
            <div style={{ maxWidth: '830px' }}>
                <button onClick={signIn}>Sign In</button>
            </div>
            <div style={{ maxWidth: '830px' }}>
                <button onClick={calcIRM}>Calculate</button>
            </div>
            <div style={{ maxWidth: '830px' }}>
                Result: {result < 0 ? `$${Math.abs(result).toLocaleString()}` : result}
            </div>
            <div>
                <h1>Positions</h1>
                <div style={{
                    // width: '480px',
                    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'grid',
                    gridTemplateColumns: '300px 50px auto',
                    padding: '10px'
                }}>
                    <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#1c478a', color: 'white', fontWeight: 'bold' }}>
                                <th style={{ border: '1px solid black', padding: '0px 29px' }}>Id</th>
                                <th style={{ border: '1px solid black', padding: '0px 8px' }}>Exch</th>
                                <th style={{ border: '1px solid black', padding: '0px 8px' }}>Commodity</th>
                                <th style={{ border: '1px solid black', padding: '0px 8px' }}>SecType</th>
                                <th style={{ border: '1px solid black', padding: '0px 8px' }}>Expiry</th>
                                <th style={{ border: '1px solid black', padding: '0px 8px' }}>LongQty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {state.portfolio.map((item, index) => (
                                <tr key={index} style={index % 2 === 0 ? rowStyles : altRowStyles}>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.id}</td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.exch}</td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.commodity}</td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.secType}</td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.expiry}</td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.longQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default IRM;