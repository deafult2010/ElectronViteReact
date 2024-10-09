import React, { useState } from "react";

const LIQ = () => {

    const [inputOption, setInputOption] = useState('local');

    const handleInputChange = (e) => {
        setInputOption(e.target.value);
    };

    return (
        <div>
            <h1 style={{ margin: '0px', textAlign: 'center' }}>Liquidity</h1>
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
                                    <button>Load Data</button>
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
                                        <input type="file" />
                                        <button>Load Data</button>
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
        </div >
    );
};

export default LIQ;