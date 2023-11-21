import React, { useContext, useState } from "react";
import Papa from "papaparse";
import jStat from "jstat";
import { ReducerContext } from '../ReducerContext';

const CSVtoJSONConverter = () => {
    const [csvFile, setCSVFile] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const { state, dispatch } = useContext(ReducerContext);



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCSVFile(file);
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
                const stdevS = jStat.stdev(returns, true) / 100;

                const addNormalCDF = addEmpiricalCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "NormalCDF": "N/A" };
                    } else {
                        const normalCDF = `${((jStat.normal.cdf(parseFloat(item.RankedReturn) / 100, mean, stdevS, true)) * 100).toFixed(2)}%`
                        // console.log(parseFloat(item.RankedReturn) / 100)
                        return { ...item, "NormalCDF": normalCDF };
                    }
                });

                const gamma = 0.0407402307483621
                const ksi = 0.000844392516855458
                const delta = 1.04934098635626
                const lambda = 0.00567675421526854

                const addJohnsonSUCDF = addNormalCDF.map((item, index) => {
                    if (index === 0) {
                        // First entry, no return calculation possible
                        return { ...item, "JohnsonSUCDF": "N/A" };
                    } else {
                        const johnsonSUCDF = `${((jStat.normal.cdf(gamma + delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - ksi) / lambda), 0, 1, true)) * 100).toFixed(2)}%`
                        // console.log(parseFloat(item.RankedReturn) / 100)
                        return { ...item, "JohnsonSUCDF": johnsonSUCDF };
                    }
                });

                setJsonData(addJohnsonSUCDF);

                dispatch({
                    type: 'DATA',
                    // payload: JSON.stringify(addJohnsonSUCDF)
                    payload: addJohnsonSUCDF
                });

                console.log(state)
            },
        });
    };


    const altRowStyles = {
        background: 'white',
    };

    const rowStyles = {
        background: '#d4e5ff',
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={convertCSVtoJSON}>Convert</button>
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
                            <th style={{ border: '1px solid black', padding: '8px' }}>Johnson SU CDF</th>
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
                                <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.JohnsonSUCDF}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CSVtoJSONConverter;