import React, { useContext, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import jStat from "jstat";
import { ReducerContext } from '../ReducerContext';
import Chart from 'chart.js/auto'

const CSVtoJSONConverter = () => {
    const [csvFile, setCSVFile] = useState(null);
    const { state, dispatch } = useContext(ReducerContext);
    const [numBins, setNumBins] = useState(state.numBins);
    const [minX, setMinX] = useState(state.ranges.minX);
    const [maxX, setMaxX] = useState(state.ranges.maxX);
    const chartPDF = useRef(null);
    const chartCDF = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCSVFile(file);
    };

    const ComputeBins = (returns) => {
        // Add bins
        const minReturn = Math.min(...returns.map(item => item * 1000));
        const maxReturn = Math.max(...returns.map(item => item * 1000));
        const binWidth = Math.ceil((maxReturn - minReturn) / state.numBins);

        // Initialize bins
        const bins = Array(state.numBins).fill(0);

        // Distribute returns into bins
        returns.forEach(item => {
            const binIndex = Math.floor((item * 1000 * 0.9999999 - minReturn) / binWidth);
            if (binIndex >= 0 && binIndex < state.numBins) {
                bins[binIndex]++;
            }
        });
        // Compute the count of data points
        const binsSum = bins.reduce((acc, curr) => acc + curr, 0);
        // Divide by the count to ensure the sum = 1
        const bins2 = bins.map(item => `${(item * 100000 / binWidth / binsSum).toFixed(2)}`)

        return [bins2, minReturn, maxReturn, binWidth]
    }



    // const convertCSVtoJSON = useCallback(() => {
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

                const orderedData = initialData.sort((a, b) =>
                    new Date(a.Date) - new Date(b.Date)
                );

                const updatedData = orderedData.map((data, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...data, "OneDayReturn": "N/A" };
                    } else {
                        const previousPrice = parseFloat(initialData[index - 1].Price);
                        const currentPrice = parseFloat(data.Price);
                        const oneDayReturn = ((currentPrice - previousPrice) / previousPrice) * 100;
                        return { ...data, "OneDayReturn": `${oneDayReturn.toFixed(2)}%` };
                    }
                });

                const rankedData = updatedData.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "Rank": "N/A" };
                    } else {
                        return { ...item, "Rank": index };
                    }
                });

                // Sort data by OneDayReturn in ascending order
                const oneDayReturns = rankedData.map(obj => obj.OneDayReturn)

                // Sort data by OneDayReturn in ascending order
                const oneDayReturnsSorted = oneDayReturns.sort((a, b) => {
                    return parseFloat(a) - parseFloat(b);
                });

                for (let i = 0; i < rankedData.length; i++) {
                    rankedData[i].RankedReturn = oneDayReturnsSorted[i];
                }

                const addEmpiricalCDF = rankedData.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "EmpiricalCDF": "N/A" };
                    } else {
                        const empiricalCDF = `${((index / (rankedData.length - 1)) * 100).toFixed(2)}%`
                        return { ...item, "EmpiricalCDF": empiricalCDF };
                    }
                });

                const returns = addEmpiricalCDF.slice(1).map(item => parseFloat(item.RankedReturn));
                const mean = jStat.mean(returns) / 100;
                const sStDev = jStat.stdev(returns, true) / 100;
                const sSkew = jStat.skewness(returns);
                const sKurt = jStat.kurtosis(returns);
                const df = 6 / sKurt + 4

                const [bins2, minReturn, maxReturn, binWidth] = ComputeBins(returns)

                const addBins = addEmpiricalCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "Bins": "N/A" };
                    } else {
                        const binIndex = Math.floor((parseFloat(item.RankedReturn) * 1000 - minReturn) / binWidth);
                        return { ...item, "Bins": bins2[binIndex] };
                    }
                });

                dispatch({
                    type: 'RANGES',
                    payload: {
                        'minX': Math.floor(minReturn * 0.5 / 1000),
                        'maxX': Math.ceil(maxReturn * 0.5 / 1000),
                        'minXData': Math.floor(minReturn / 1000),
                        'maxXData': Math.ceil(maxReturn / 1000),
                    }
                });

                const addNormalCDF = addBins.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "NormalCDF": "N/A" };
                    } else {
                        const normalCDF = `${((jStat.normal.cdf(parseFloat(item.RankedReturn) / 100, mean, sStDev, true)) * 100).toFixed(2)}%`
                        return { ...item, "NormalCDF": normalCDF };
                    }
                });

                const addStudentTCDF = addNormalCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "StudentTCDF": "N/A" };
                    } else {
                        const studentTCDF = `${((jStat.studentt.cdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((df - 2) / df)), df)) * 100).toFixed(2)}%`
                        return { ...item, "StudentTCDF": studentTCDF };
                    }
                });

                const gamma = 0.0407402307483621
                const ksi = 0.000844392516855458
                const delta = 1.04934098635626
                const lambda = 0.00567675421526854

                const addJohnsonSUCDF = addStudentTCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "JohnsonSUCDF": "N/A" };
                    } else {
                        const johnsonSUCDF = `${((jStat.normal.cdf(gamma + delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - ksi) / lambda), 0, 1, true)) * 100).toFixed(2)}%`
                        return { ...item, "JohnsonSUCDF": johnsonSUCDF };
                    }
                });

                const addNormalPDF = addJohnsonSUCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "NormalPDF": "N/A" };
                    } else {
                        const normalPDF = `${((jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, mean, sStDev))).toFixed(2)}`
                        return { ...item, "NormalPDF": normalPDF };
                    }
                });

                // const addStudentTPDF = addNormalPDF.map((item, index) => {
                //     if (index === 0) {
                //         // First entry, no return calculation possible
                //         return { ...item, "StudentTPDF": "N/A" };
                //     } else {
                //         const studentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((df - 2) / df)), df)) * 100).toFixed(2)}%`
                //         return { ...item, "StudentTPDF": studentTPDF };
                //     }
                // });

                const addStudentTPDF = addNormalPDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "StudentTPDF": "N/A" };
                    } else {
                        const studentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((df - 2) / df)), df)) * 100).toFixed(2)}%`
                        return { ...item, "StudentTPDF": studentTPDF };
                    }
                });

                const addJohnsonSUPDF = addStudentTPDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "JohnsonSUPDF": "N/A" };
                    } else {
                        const johnsonSUPDF = `${(delta / (lambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (gamma - delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - ksi) / lambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - ksi) / lambda) ** 2)).toFixed(2)}`
                        return { ...item, "JohnsonSUPDF": johnsonSUPDF };
                    }
                });

                dispatch({
                    type: 'DATA',
                    // payload: JSON.stringify(addJohnsonSUCDF)
                    payload: addJohnsonSUPDF
                });

                dispatch({
                    type: 'STATS',
                    // payload: JSON.stringify(addJohnsonSUCDF)
                    payload: {
                        'mean': mean,
                        'sStDev': sStDev,
                        'sSkew': sSkew,
                        'sKurt': sKurt,
                        'df': df
                    }
                });
            },
        });
    }
    // }, [csvFile, numBins]);


    const altRowStyles = {
        background: 'white',
    };

    const rowStyles = {
        background: '#d4e5ff',
    };

    const gridCont = {
    }
    const gridItem = {
        // backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(0, 0, 0, 1.0)',
        // padding: '20px',
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 1.0)',
        textAlign: 'center'
    }

    useEffect(() => {

        if (state.data) {
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    numbers: { duration: 1 },
                    colors: {
                        type: "color",
                        duration: 1,
                        from: "transparent",
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                scales: {
                    x: {
                        type: "linear",
                        ticks: {
                            beginAtZero: true,
                            callback: (value) =>
                                value > 0 ? `+${value}%` : `${value}%`,
                        },
                        // clip off data
                        min: state.ranges.minX,
                        max: state.ranges.maxX
                    },
                    y: {
                        type: 'linear',
                        ticks: {
                            beginAtZero: true,
                            callback: (value) => `${value}%`,
                        },
                    },
                },
            };
            const returns = state.data.slice(1).map((item) => item.RankedReturn.replace('%', ''));
            const [bins2, minReturn, maxReturn, binWidth] = ComputeBins(returns)

            const addBins = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "Bins": "N/A" };
                } else {
                    const binIndex = Math.floor((parseFloat(item.RankedReturn) * 1000 - minReturn) / binWidth);
                    return { ...item, "Bins": bins2[binIndex] };
                }
            });

            const rankedReturns = state.data.map((item) => item.RankedReturn.replace('%', ''));
            const empiricalCDF = state.data.map((item) => item.EmpiricalCDF.replace('%', ''));
            const johnsonSUCDF = state.data.map((item) => item.JohnsonSUCDF.replace('%', ''));
            const normalCDF = state.data.map((item) => item.NormalCDF.replace('%', ''));
            const studentTCDF = state.data.map((item) => item.StudentTCDF.replace('%', ''));
            const empiricalPDF = addBins.map((item) => item.Bins);
            const normalPDF = state.data.map((item) => item.NormalPDF.replace('%', ''));
            const johnsonSUPDF = state.data.map((item) => item.JohnsonSUPDF.replace('%', ''));
            const studentTPDF = state.data.map((item) => item.StudentTPDF.replace('%', ''));

            const chartCDFData = {
                labels: rankedReturns,
                datasets: [
                    {
                        label: 'Empirical CDF',
                        data: empiricalCDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Normal CDF',
                        data: normalCDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Student T CDF',
                        data: studentTCDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Johnson SU CDF',
                        data: johnsonSUCDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };

            const chartPDFData = {
                labels: rankedReturns,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Empirical PDF',
                        data: empiricalPDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {

                        type: 'line',
                        label: 'Normal PDF',
                        data: normalPDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {

                        type: 'line',
                        label: 'Student T PDF',
                        data: studentTPDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                    {

                        type: 'line',
                        label: 'Johnson SU PDF',
                        data: johnsonSUPDF,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };

            const myChart = new Chart(chartPDF.current, {
                data: chartPDFData,
                options: chartOptions,
            });

            const myChart2 = new Chart(chartCDF.current, {
                type: 'line',
                data: chartCDFData,
                options: chartOptions,
            });

            if (state.ranges.minX === -9999) {
                dispatch({
                    type: 'RANGES',
                    payload: {
                        'minX': Math.floor(minReturn * 0.5 / 1000),
                        'maxX': Math.ceil(maxReturn * 0.5 / 1000),
                        'minXData': Math.floor(minReturn / 1000),
                        'maxXData': Math.ceil(maxReturn / 1000),
                    }
                });
            }


            return () => {
                myChart.destroy();
                myChart2.destroy();
            };
        }

    }, [state.data, state.numBins, state.ranges.minX, state.ranges.maxX]);

    const handleNumBinsChange = (e) => {
        setNumBins(Number(e.target.value));
    }
    const handleNumBinsMouseUp = (e) => {
        dispatch({
            type: 'BINS',
            payload: Number(e.target.value)
        });
    }

    const handleMinXChange = (e) => {
        setMinX(e.target.value)
    }
    const handleMinXMouseUp = (e) => {
        const value = e.target.value;
        dispatch({
            type: 'RANGES',
            payload: {
                'minX': value,
                'maxX': state.ranges.maxX,
                'minXData': state.ranges.minXData,
                'maxXData': state.ranges.maxXData
            }
        });
        if (value >= state.ranges.maxX) {
            dispatch({
                type: 'RANGES',
                payload: {
                    'minX': state.ranges.maxX,
                    'maxX': state.ranges.maxX,
                    'minXData': state.ranges.minXData,
                    'maxXData': state.ranges.maxXData
                }
            });
        }
    }
    const handleMaxXChange = (e) => {
        setMaxX(e.target.value)
    }
    const handleMaxXMouseUp = (e) => {
        const value = e.target.value;
        dispatch({
            type: 'RANGES',
            payload: {
                'maxX': value,
                'minX': state.ranges.minX,
                'minXData': state.ranges.minXData,
                'maxXData': state.ranges.maxXData
            }
        });
        if (value <= state.ranges.minX) {
            dispatch({
                type: 'RANGES',
                payload: {
                    'maxX': state.ranges.minX,
                    'minX': state.ranges.minX,
                    'minXData': state.ranges.minXData,
                    'maxXData': state.ranges.maxXData
                }
            });
        }
    }

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={convertCSVtoJSON}>Convert</button>
            {state.stats.mean && (
                <div>
                    <h1>Sample Stats</h1>
                    <div style={{
                        width: '180px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'grid',
                        gridTemplateColumns: '100px 80px',
                        padding: '10px'
                    }}>
                        <div style={gridItem}>Mean</div>
                        <div style={gridItem}>{`${(state.stats.mean).toFixed(2)}%`}</div>
                        <div style={gridItem}>StDev</div>
                        <div style={gridItem}>{`${(state.stats.sStDev * 100).toFixed(2)}%`}</div>
                        <div style={gridItem}>Skew</div>
                        <div style={gridItem}>{(state.stats.sSkew).toFixed(2)}</div>
                        <div style={gridItem}>ExKurt</div>
                        <div style={gridItem}>{(state.stats.sKurt).toFixed(2)}</div>
                        <div style={gridItem}>TDist DoF</div>
                        <div style={gridItem}>{(state.stats.df).toFixed(2)}</div>
                    </div>
                </div>
            )}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                padding: '10px'
            }}>
                <div><h1>PDFs</h1><label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>Number of bins: {numBins} <input type="range" min={3} max={500} value={numBins} onMouseUp={(value) => handleNumBinsMouseUp(value)} onChange={(value) => handleNumBinsChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label></div>
                <div><h1>CDFs</h1></div>
                <div style={{ width: '45vw', height: '50vh' }}><canvas ref={chartPDF}></canvas></div>
                <div style={{ width: '45vw', height: '50vh' }}><canvas ref={chartCDF}></canvas></div>
                <div>
                    <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MinX: {minX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={minX} step={0.2} onMouseUp={(value) => handleMinXMouseUp(value)} onChange={(value) => handleMinXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                    <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MaxX: {maxX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={maxX} step={0.2} onMouseUp={(value) => handleMaxXMouseUp(value)} onChange={(value) => handleMaxXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                </div>
            </div>
            <h1>Data</h1>
            {state.data && (
                <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: '300px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1c478a', color: 'white', fontWeight: 'bold' }}>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Date</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Price</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>One Day Return</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Rank</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Returns Ranked</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Empirical CDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Normal CDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Student T CDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Johnson SU CDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Normal PDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Student T PDF</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Johnson SU PDF</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.data.map((item, index) => (
                            <tr key={index} style={index % 2 === 0 ? rowStyles : altRowStyles}>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.Date}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.Price}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.OneDayReturn}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.Rank}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.RankedReturn}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.EmpiricalCDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.NormalCDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.StudentTCDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.JohnsonSUCDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.NormalPDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.StudentTPDF}</td>
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.JohnsonSUPDF}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CSVtoJSONConverter;