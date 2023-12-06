import React, { useContext, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import jStat from "jstat";
import { ReducerContext } from '../ReducerContext';
import Chart from 'chart.js/auto'
import SPData from '../assets/SPData.json'

const CSVtoJSONConverter = () => {
    const [csvFile, setCSVFile] = useState(null);
    const { state, dispatch } = useContext(ReducerContext);
    const [numBins, setNumBins] = useState(state.numBins);
    const [percentile, setPercentile] = useState(state.percentile);
    const [minX, setMinX] = useState(state.ranges.minX);
    const [maxX, setMaxX] = useState(state.ranges.maxX);
    const [cMean, setCMean] = useState(state.custom.cMean);
    const [cStDev, setCStDev] = useState(state.custom.cStDev);
    const [cSkew, setCSkew] = useState(state.custom.cSkew);
    const [cKurt, setCKurt] = useState(state.custom.cKurt);
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

    const computeStats = async (initialData) => {

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

        const NileL = `${Number(jStat.normal.inv(1 - percentile / 100, mean, sStDev * 100)).toFixed(2)}%`
        const TileL = `${Number(jStat.studentt.inv(1 - percentile / 100, df)).toFixed(2)}%`
        const EileL = `${Number(jStat.percentile(returns, 1 - percentile / 100)).toFixed(2)}%`
        const JileL = `Loading...`
        const CileL = `Loading...`
        const NileU = `${Number(jStat.normal.inv(percentile / 100, mean, sStDev * 100)).toFixed(2)}%`
        const TileU = `${Number(jStat.studentt.inv(percentile / 100, df)).toFixed(2)}%`
        const EileU = `${Number(jStat.percentile(returns, percentile / 100)).toFixed(2)}%`
        const JileU = `Loading...`
        const CileU = `Loading...`


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

        setMaxX(Math.ceil(maxReturn * 0.5 / 1000))
        setMinX(Math.floor(minReturn * 0.5 / 1000))

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

        const returns2 = addEmpiricalCDF.slice(1).map(item => parseFloat(item.RankedReturn) / 100)
        dispatch({
            type: 'TEXT',
            payload: `
import numpy as np
from scipy.stats import johnsonsu
import json

json_data = "${JSON.stringify(returns2)}"
data = json.loads(json_data)
r = johnsonsu.fit(data)
r = {'gamma': r[0], 'delta': r[1], 'ksi': r[2], 'lambda': r[3]}
r = json.dumps(r)
print(r)
        `
        });

        const addNormalPDF = addStudentTCDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "NormalPDF": "N/A" };
            } else {
                const normalPDF = `${((jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, mean, sStDev))).toFixed(2)}`
                return { ...item, "NormalPDF": normalPDF };
            }
        });

        const addStudentTPDF = addNormalPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "StudentTPDF": "N/A" };
            } else {
                const studentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((df - 2) / df)), df)) * 100).toFixed(2)}%`
                return { ...item, "StudentTPDF": studentTPDF };
            }
        });

        const addCustomCDF = addStudentTPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomCDF": "N/A" };
            } else {
                const customCDF = `${((jStat.normal.cdf(state.custom.cGamma + state.custom.cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - state.custom.cKsi) / state.custom.cLambda), 0, 1, true)) * 100).toFixed(2)}%`
                return { ...item, "CustomCDF": customCDF };
            }
        });

        const addCustomPDF = addCustomCDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomPDF": "N/A" };
            } else {
                const customPDF = `${(state.custom.cDelta / (state.custom.cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (state.custom.cGamma + state.custom.cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - state.custom.cKsi) / state.custom.cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - state.custom.cKsi) / state.custom.cLambda) ** 2)).toFixed(2)}`
                return { ...item, "CustomPDF": customPDF };
            }
        });

        const addLogCustomPDF = addCustomPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "LogCustomPDF": "N/A" };
            } else {
                const logCustomPDF = `${(Math.log(state.custom.cDelta / (state.custom.cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (state.custom.cGamma + state.custom.cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - state.custom.cKsi) / state.custom.cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - state.custom.cKsi) / state.custom.cLambda) ** 2))).toFixed(2)}`
                return { ...item, "LogCustomPDF": logCustomPDF };
            }
        });

        dispatch({
            type: 'DATA',
            // payload: JSON.stringify(addJohnsonSUCDF)
            payload: addLogCustomPDF
        });

        dispatch({
            type: 'STATS',
            // payload: JSON.stringify(addJohnsonSUCDF)
            payload: {
                'mean': mean,
                'sStDev': sStDev,
                'sSkew': sSkew,
                'sKurt': sKurt,
                'df': df,
                'NileL': NileL,
                'EileL': EileL,
                'TileL': TileL,
                'JileL': JileL,
                'CileL': CileL,
                'NileU': NileU,
                'EileU': EileU,
                'TileU': TileU,
                'JileU': JileU,
                'CileU': CileU,
            }
        });
    }

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

                computeStats(initialData)
            }
        });
    }

    const loadJSON = () => {
        computeStats(SPData)
    }

    useEffect(() => {
        if (state.result.startsWith('{"JileL":')) {
            const data = JSON.parse(state.result)
            dispatch({
                type: 'JILE',
                // payload: JSON.stringify(addJohnsonSUCDF)
                payload: {
                    'JileL': data.JileL,
                    'JileU': data.JileU,
                    'CileL': data.CileL,
                    'CileU': data.CileU,
                }
            });
        }
        if (state.result.startsWith(`{"gamma":`)) {
            const data = JSON.parse(state.result)
            dispatch({
                type: 'STATS',
                // payload: JSON.stringify(addJohnsonSUCDF)
                payload: {
                    'gamma': data.gamma,
                    'delta': data.delta,
                    'ksi': data.ksi,
                    'lambda': data.lambda,
                }
            });
            dispatch({
                type: 'TEXT',
                payload: `
from scipy.stats import johnsonsu
r1 = johnsonsu.ppf(${state.percentile / 100}, ${data.gamma}, ${data.delta}, ${data.ksi}, ${data.lambda})
r2 = johnsonsu.ppf(${1 - state.percentile / 100}, ${data.gamma}, ${data.delta}, ${data.ksi}, ${data.lambda})
r3 = johnsonsu.ppf(${state.percentile / 100}, ${state.custom.cGamma}, ${state.custom.cDelta}, ${state.custom.cKsi}, ${state.custom.cLambda})
r4 = johnsonsu.ppf(${1 - state.percentile / 100}, ${state.custom.cGamma}, ${state.custom.cDelta}, ${state.custom.cKsi}, ${state.custom.cLambda})
print('{"JileL":"', round(r2*100,2),'%","JileU":"',round(r1*100,2),'%","CileL":"',round(r4*100,2),'%","CileU":"',round(r3*100,2),'%"}', sep='')
                `
            });

            const addJohnsonSUCDF = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "JohnsonSUCDF": "N/A" };
                } else {
                    const johnsonSUCDF = `${((jStat.normal.cdf(data.gamma + data.delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - data.ksi) / data.lambda), 0, 1, true)) * 100).toFixed(2)}%`
                    return { ...item, "JohnsonSUCDF": johnsonSUCDF };
                }
            });

            const addJohnsonSUPDF = addJohnsonSUCDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "JohnsonSUPDF": "N/A" };
                } else {
                    const johnsonSUPDF = `${(data.delta / (data.lambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (data.gamma + data.delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - data.ksi) / data.lambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - data.ksi) / data.lambda) ** 2)).toFixed(2)}`
                    return { ...item, "JohnsonSUPDF": johnsonSUPDF };
                }
            });

            const addLogJohnsonSUPDF = addJohnsonSUPDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "LogJohnsonSUPDF": "N/A" };
                } else {
                    const logJohnsonSUPDF = `${(Math.log(data.delta / (data.lambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (data.gamma + data.delta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - data.ksi) / data.lambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - data.ksi) / data.lambda) ** 2))).toFixed(2)}`
                    return { ...item, "LogJohnsonSUPDF": logJohnsonSUPDF };
                }
            });
            dispatch({
                type: 'DATA',
                payload: addLogJohnsonSUPDF
            });
        }
        if (state.result.startsWith(`{"cGamma":`)) {
            const data = JSON.parse(state.result)
            // destructure
            const { cMean, cStDev, cSkew, cKurt, cGamma, cDelta, cKsi, cLambda } = data
            setCMean(cMean * 100)
            setCStDev(cStDev * 100)
            setCSkew(cSkew)
            setCKurt(cKurt)
            dispatch({
                type: 'CUSTOM',
                // payload: JSON.stringify(addJohnsonSUCDF)
                payload: {
                    // "cMean": state.result.cMean, "cStDev": state.result.cStDev, "cSkew": state.result.cSkew, "cKurt": state.result.cKurt, "cGamma": state.result.cGamma, "cDelta": state.result.cDelta, "cKsi": state.result.cKsi, "cLambda": state.result.cLambda
                    cMean: cMean * 100, cStDev: cStDev * 100, cSkew, cKurt, cGamma, cDelta, cKsi, cLambda
                }
            });
            dispatch({
                type: 'TEXT',
                payload: `
from scipy.stats import johnsonsu
r1 = johnsonsu.ppf(${state.percentile / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r2 = johnsonsu.ppf(${1 - state.percentile / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r3 = johnsonsu.ppf(${state.percentile / 100}, ${cGamma}, ${cDelta}, ${cKsi}, ${cLambda})
r4 = johnsonsu.ppf(${1 - state.percentile / 100}, ${cGamma}, ${cDelta}, ${cKsi}, ${cLambda})
print('{"JileL":"', round(r2*100,2),'%","JileU":"',round(r1*100,2),'%","CileL":"',round(r4*100,2),'%","CileU":"',round(r3*100,2),'%"}', sep='')
                `
            });

            const addCustomCDF = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomCDF": "N/A" };
                } else {
                    const customCDF = `${((jStat.normal.cdf(cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda), 0, 1, true)) * 100).toFixed(2)}%`
                    return { ...item, "CustomCDF": customCDF };
                }
            });

            const addCustomPDF = addCustomCDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomPDF": "N/A" };
                } else {
                    const customPDF = `${(cDelta / (cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda) ** 2)).toFixed(2)}`
                    return { ...item, "CustomPDF": customPDF };
                }
            });

            const addLogCustomPDF = addCustomPDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "LogCustomPDF": "N/A" };
                } else {
                    const logCustomPDF = `${(Math.log(cDelta / (cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda) ** 2))).toFixed(2)}`
                    return { ...item, "LogCustomPDF": logCustomPDF };
                }
            });
            dispatch({
                type: 'DATA',
                payload: addLogCustomPDF
            });
        }
    }, [state.result])





    const handleClick = (e, legendItem, legend) => {
        const index = legendItem.datasetIndex;
        const ci = legend.chart;
        let array = [...state.isHidden]
        array[index] = !array[index]
        dispatch({
            type: 'ISHIDDEN',
            payload: array
        });
        if (ci.isDatasetVisible(index)) {
            ci.hide(index);
            legendItem.hidden = true;
        } else {
            ci.show(index);
            legendItem.hidden = false;
        }
        if (index === 3) {
            const returns = state.data.slice(1).map((item) => Number(item.RankedReturn.replace('%', '')) / 100);
            dispatch({
                type: 'TEXT',
                payload: `
import numpy as np
from scipy.stats import johnsonsu
import json

json_data = "${JSON.stringify(returns)}"
data = json.loads(json_data)
r = johnsonsu.fit(data)
r = {'gamma': r[0], 'delta': r[1], 'ksi': r[2], 'lambda': r[3]}
r = json.dumps(r)
print(r)
            `
            });
        }
    }

    useEffect(() => {

        if (state.data) {
            if (state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF'))) {
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
                            max: state.ranges.maxX,
                            //prevent offset between bar charts on x-axis
                            stacked: true,
                        },
                        y: {
                            type: 'linear',
                            ticks: {
                                beginAtZero: true,
                                callback: (value) => `${value}%`,
                            },
                            stacked: false,
                        },
                        //Add secondary axes for %iles
                        yPct: {
                            type: 'linear',
                            display: false,
                            ticks: {
                                maxTicksLimit: 10,
                                suggestedMax: 100,
                                beginAtZero: true,
                                callback: (value) => `${value}%`,
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            onClick: handleClick,
                            // Hide legends for %ile lines
                            labels: {
                                filter: item => item.text !== 'E %ileL' && item.text !== 'N %ileL' && item.text !== 'T %ileL' && item.text !== 'J %ileL' && item.text !== 'C %ileL' && item.text !== 'E %ileU' && item.text !== 'N %ileU' && item.text !== 'T %ileU' && item.text !== 'J %ileU' && item.text !== 'C %ileU'
                            }
                        }
                    },
                };
                const returns = state.data.slice(1).map((item) => Number(item.RankedReturn.replace('%', '')));
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
                const customCDF = state.data.map((item) => item.CustomCDF.replace('%', ''));
                const empiricalPDF = addBins.map((item) => item.Bins);
                const normalPDF = state.data.map((item) => item.NormalPDF.replace('%', ''));
                const johnsonSUPDF = state.data.map((item) => item.JohnsonSUPDF.replace('%', ''));
                const studentTPDF = state.data.map((item) => item.StudentTPDF.replace('%', ''));
                const customPDF = state.data.map((item) => item.CustomPDF.replace('%', ''));

                const chartCDFData = {
                    labels: rankedReturns,
                    datasets: [
                        {
                            label: 'Empirical',
                            data: empiricalCDF,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[0]
                        },
                        {
                            label: 'Normal',
                            data: normalCDF,
                            backgroundColor: 'rgba(75, 83, 196, 0.2)',
                            borderColor: 'rgba(75, 83, 196, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[1],
                        },
                        {
                            label: 'Student T',
                            data: studentTCDF,
                            backgroundColor: 'rgba(144, 75, 196, 0.2)',
                            borderColor: 'rgba(144, 75, 196, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[2],
                        },
                        {
                            label: 'Johnson SU',
                            data: johnsonSUCDF,
                            backgroundColor: 'rgba(196, 75, 75, 0.2)',
                            borderColor: 'rgba(196, 75, 75, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[3],
                        },
                        {
                            label: 'Custom',
                            data: customCDF,
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[4],
                        },
                    ],
                };
                const chartPDFData = {
                    labels: rankedReturns,
                    datasets: state.stats.EileL ? [
                        {
                            type: 'bar',
                            label: 'Empirical',
                            data: empiricalPDF,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[0]
                        },
                        {
                            type: 'line',
                            label: 'Normal',
                            data: normalPDF,
                            backgroundColor: 'rgba(75, 83, 196, 0.2)',
                            borderColor: 'rgba(75, 83, 196, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[1],
                        },
                        {
                            type: 'line',
                            label: 'Student T',
                            data: studentTPDF,
                            backgroundColor: 'rgba(144, 75, 196, 0.2)',
                            borderColor: 'rgba(144, 75, 196, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[2],
                        },
                        {
                            type: 'line',
                            label: 'Johnson SU',
                            data: johnsonSUPDF,
                            backgroundColor: 'rgba(196, 75, 75, 0.2)',
                            borderColor: 'rgba(196, 75, 75, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[3],
                        },
                        {
                            type: 'line',
                            label: 'Custom',
                            data: customPDF,
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            borderWidth: 3,
                            hidden: state.isHidden[4],
                        },
                        {
                            type: 'scatter',
                            label: `E %ileL`,
                            data: [{ x: Number(state.stats.EileL.replace('%', '')), y: 0 }, { x: Number(state.stats.EileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            showLine: true,
                            hidden: state.isHidden[0] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `E %ileU`,
                            data: [{ x: Number(state.stats.EileU.replace('%', '')), y: 0 }, { x: Number(state.stats.EileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            showLine: true,
                            hidden: state.isHidden[0] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `N %ileL`,
                            data: [{ x: Number(state.stats.NileL.replace('%', '')), y: 0 }, { x: Number(state.stats.NileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 83, 196, 0.2)',
                            borderColor: 'rgba(75, 83, 196, 1)',
                            showLine: true,
                            hidden: state.isHidden[1] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `N %ileU`,
                            data: [{ x: Number(state.stats.NileU.replace('%', '')), y: 0 }, { x: Number(state.stats.NileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 83, 196, 0.2)',
                            borderColor: 'rgba(75, 83, 196, 1)',
                            showLine: true,
                            hidden: state.isHidden[1] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `T %ileL`,
                            data: [{ x: Number(state.stats.TileL.replace('%', '')), y: 0 }, { x: Number(state.stats.TileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(144, 75, 196, 0.2)',
                            borderColor: 'rgba(144, 75, 196, 1)',
                            showLine: true,
                            hidden: state.isHidden[2] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `T %ileU`,
                            data: [{ x: Number(state.stats.TileU.replace('%', '')), y: 0 }, { x: Number(state.stats.TileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(144, 75, 196, 0.2)',
                            borderColor: 'rgba(144, 75, 196, 1)',
                            showLine: true,
                            hidden: state.isHidden[2] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `J %ileL`,
                            data: [{ x: Number(state.stats.JileL.replace('%', '')), y: 0 }, { x: Number(state.stats.JileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(196, 75, 75, 0.2)',
                            borderColor: 'rgba(196, 75, 75, 1)',
                            showLine: true,
                            hidden: state.isHidden[3] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `J %ileU`,
                            data: [{ x: Number(state.stats.JileU.replace('%', '')), y: 0 }, { x: Number(state.stats.JileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(196, 75, 75, 0.2)',
                            borderColor: 'rgba(196, 75, 75, 1)',
                            showLine: true,
                            hidden: state.isHidden[3] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `C %ileL`,
                            data: [{ x: Number(state.stats.CileL.replace('%', '')), y: 0 }, { x: Number(state.stats.CileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            showLine: true,
                            hidden: state.isHidden[4] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `C %ileU`,
                            data: [{ x: Number(state.stats.CileU.replace('%', '')), y: 0 }, { x: Number(state.stats.CileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            showLine: true,
                            hidden: state.isHidden[4] || state.isHiddenP
                        },
                    ] : [],
                };

                const myChart = new Chart(chartPDF.current, {
                    type: 'scatter',
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
                    setMinX(Math.floor(minReturn * 0.5 / 1000))
                    setMaxX(Math.ceil(maxReturn * 0.5 / 1000))
                }


                return () => {
                    myChart.destroy();
                    myChart2.destroy();
                };
            }
        }
    }, [state.data, state.numBins, state.ranges.minX, state.ranges.maxX, state.isHidden, state.isHiddenP, state.stats]);

    const handleNumBinsChange = (e) => {
        setNumBins(Number(e.target.value));
    }
    const handleNumBinsMouseUp = (e) => {
        dispatch({
            type: 'BINS',
            payload: Number(e.target.value)
        });
    }

    const handlePercentileChange = (e) => {
        setPercentile(Number(e.target.value));
    }
    const handlePercentileMouseUp = (e) => {
        const returns = state.data.slice(1).map((item) => Number(item.RankedReturn.replace('%', '')));
        const NileL = `${Number(jStat.normal.inv(1 - percentile / 100, state.stats.mean, state.stats.sStDev * 100)).toFixed(2)}%`
        const TileL = `${Number(jStat.studentt.inv(1 - percentile / 100, state.stats.df)).toFixed(2)}%`
        const EileL = `${Number(jStat.percentile(returns, 1 - percentile / 100)).toFixed(2)}%`
        const NileU = `${Number(jStat.normal.inv(percentile / 100, state.stats.mean, state.stats.sStDev * 100)).toFixed(2)}%`
        const TileU = `${Number(jStat.studentt.inv(percentile / 100, state.stats.df)).toFixed(2)}%`
        const EileU = `${Number(jStat.percentile(returns, percentile / 100)).toFixed(2)}%`

        dispatch({
            type: 'TEXT',
            payload: `
from scipy.stats import johnsonsu
r1 = johnsonsu.ppf(${e.target.value / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r2 = johnsonsu.ppf(${1 - e.target.value / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r3 = johnsonsu.ppf(${e.target.value / 100}, ${state.custom.cGamma}, ${state.custom.cDelta}, ${state.custom.cKsi}, ${state.custom.cLambda})
r4 = johnsonsu.ppf(${1 - e.target.value / 100}, ${state.custom.cGamma}, ${state.custom.cDelta}, ${state.custom.cKsi}, ${state.custom.cLambda})
print('{"JileL":"', round(r2*100,2),'%","JileU":"',round(r1*100,2),'%","CileL":"',round(r4*100,2),'%","CileU":"',round(r3*100,2),'%"}', sep='')
            `
        });

        dispatch({
            type: 'PERCENTILE',
            payload: Number(e.target.value)
        });
        dispatch({
            type: 'STATS',
            payload: {
                'NileL': NileL,
                'EileL': EileL,
                'TileL': TileL,
                'NileU': NileU,
                'EileU': EileU,
                'TileU': TileU,
            }
        });
    }

    const handleMinXChange = (e) => {
        setMinX(e.target.value)
    }
    const handleMinXMouseUp = (e) => {
        const value = e.target.value;
        if (Number(value) >= state.ranges.maxX) {
            dispatch({
                type: 'RANGES',
                payload: {
                    'minX': ((Number(state.ranges.maxX).toFixed(2) * 100 - 0.2.toFixed(2) * 100) / 100).toFixed(1),
                    'maxX': state.ranges.maxX,
                    'minXData': state.ranges.minXData,
                    'maxXData': state.ranges.maxXData
                }
            });
            setMinX(((Number(state.ranges.maxX).toFixed(2) * 100 - 0.2.toFixed(2) * 100) / 100).toFixed(1))
        } else {
            dispatch({
                type: 'RANGES',
                payload: {
                    'minX': value,
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
        if (Number(value) <= state.ranges.minX) {
            dispatch({
                type: 'RANGES',
                payload: {
                    'maxX': ((Number(state.ranges.minX).toFixed(2) * 100 + 0.2.toFixed(2) * 100) / 100).toFixed(1),
                    'minX': state.ranges.minX,
                    'minXData': state.ranges.minXData,
                    'maxXData': state.ranges.maxXData
                }
            });
            setMaxX(((Number(state.ranges.minX).toFixed(2) * 100 + 0.2.toFixed(2) * 100) / 100).toFixed(1))
        } else {
            dispatch({
                type: 'RANGES',
                payload: {
                    'maxX': value,
                    'minX': state.ranges.minX,
                    'minXData': state.ranges.minXData,
                    'maxXData': state.ranges.maxXData
                }
            });
        }
    }


    const handleCMeanChange = (e) => {
        setCMean(Number(e.target.value));
    }
    // const handleCMeanMouseUp = (e) => {
    //     dispatch({
    //         type: 'CUSTOM',
    //         payload: { "cMean": Number(e.target.value), "cStDev": state.custom.cStDev, "cSkew": state.custom.cSkew, "cKurt": state.custom.cKurt }
    //     });
    // }
    const handleCStDevChange = (e) => {
        setCStDev(Number(e.target.value));
    }
    // const handleCStDevMouseUp = (e) => {
    //     dispatch({
    //         type: 'CUSTOM',
    //         payload: { "cMean": state.custom.cMean, "cStDev": Number(e.target.value), "cSkew": state.custom.cSkew, "cKurt": state.custom.cKurt }
    //     });
    // }
    const handleCSkewChange = (e) => {
        setCSkew(Number(e.target.value));
    }
    // const handleCSkewMouseUp = (e) => {
    //     dispatch({
    //         type: 'CUSTOM',
    //         payload: { "cMean": state.custom.cMean, "cStDev": state.custom.cStDev, "cSkew": Number(e.target.value), "cKurt": state.custom.cKurt }
    //     });
    // }
    const handleCKurtChange = (e) => {
        setCKurt(Number(e.target.value));
    }
    // const handleCKurtMouseUp = (e) => {
    //     dispatch({
    //         type: 'CUSTOM',
    //         payload: { "cMean": state.custom.cMean, "cStDev": state.custom.cStDev, "cSkew": state.custom.cSkew, "cKurt": Number(e.target.value) }
    //     });
    // }

    const hidePercentiles = () => {
        dispatch({
            type: 'ISHIDDENP',
            payload: !state.isHiddenP
        });
    }

    const reset = () => {
        const cGamma = 0
        const cKsi = 0
        const cDelta = 5.521765
        const cLambda = 0.054318
        dispatch({
            type: 'CUSTOM',
            payload: { "cMean": 0, "cStDev": 1, "cSkew": 0, "cKurt": 3, "cGamma": cGamma, "cKsi": cKsi, "cDelta": cDelta, "cLambda": cLambda }
        });
        setCMean(0)
        setCStDev(1)
        setCSkew(0)
        setCKurt(3)
        dispatch({
            type: 'TEXT',
            payload: `
from scipy.stats import johnsonsu
r1 = johnsonsu.ppf(${state.percentile / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r2 = johnsonsu.ppf(${1 - state.percentile / 100}, ${state.stats.gamma}, ${state.stats.delta}, ${state.stats.ksi}, ${state.stats.lambda})
r3 = johnsonsu.ppf(${state.percentile / 100}, ${cGamma}, ${cDelta}, ${cKsi}, ${cLambda})
r4 = johnsonsu.ppf(${1 - state.percentile / 100}, ${cGamma}, ${cDelta}, ${cKsi}, ${cLambda})
print('{"JileL":"', round(r2*100,2),'%","JileU":"',round(r1*100,2),'%","CileL":"',round(r4*100,2),'%","CileU":"',round(r3*100,2),'%"}', sep='')
            `
        });

        const addCustomCDF = state.data.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomCDF": "N/A" };
            } else {
                const customCDF = `${((jStat.normal.cdf(cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda), 0, 1, true)) * 100).toFixed(2)}%`
                return { ...item, "CustomCDF": customCDF };
            }
        });

        const addCustomPDF = addCustomCDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomPDF": "N/A" };
            } else {
                const customPDF = `${(cDelta / (cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda) ** 2)).toFixed(2)}`
                return { ...item, "CustomPDF": customPDF };
            }
        });

        const addLogCustomPDF = addCustomPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "LogCustomPDF": "N/A" };
            } else {
                const logCustomPDF = `${(Math.log(cDelta / (cLambda * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * (cGamma + cDelta * Math.asinh(((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda)) ** 2) / Math.sqrt(1 + (((parseFloat(item.RankedReturn) / 100) - cKsi) / cLambda) ** 2))).toFixed(2)}`
                return { ...item, "LogCustomPDF": logCustomPDF };
            }
        });
        dispatch({
            type: 'DATA',
            payload: addLogCustomPDF
        });
    }

    const customSolve = () => {
        dispatch({
            type: 'CUSTOM',
            payload: { "cMean": cMean, "cStDev": cStDev, "cSkew": cSkew, "cKurt": cKurt, "cGamma": state.custom.cGamma, "cDelta": state.custom.cDelta, "cKsi": state.custom.cKsi, "cLambda": state.custom.cLambda }
        });
        dispatch({
            type: 'TEXT',
            payload: `
import numpy as np
# import math
import json
from scipy.optimize import minimize

#ValueOf minimise the absolute of variable - value = 0 (i.e. solve variable = value)
def objective(x):
    cMean = x[1]-x[3]*np.exp((x[2]**-2)/2)*np.sinh(x[0]/x[2])
    cStDev = np.sqrt(x[3]**2/2*(np.exp(x[2]**-2)-1)*(np.exp(x[2]**-2)*np.cosh(2*x[0]/x[2])+1))
    cSkew = -(x[3]**3*np.sqrt(np.exp(x[2]**-2))*(np.exp(x[2]**-2)-1)**2*(np.exp(x[2]**-2)*(np.exp(x[2]**-2)+2)*np.sinh(3*x[0]/x[2])+3*np.sinh(2*x[0]/x[2])))/(4*(cStDev**2)**1.5)
    k1 = (np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))**4+2*(np.exp(x[2]**-2))**3+2*(np.exp(x[2]**-2))**2-3)*np.cosh(4*x[0]/x[2])
    k2 = 4*(np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))+2)*np.cosh(3*x[0]/x[2])
    k3 = 3*(2*(np.exp(x[2]**-2))+1)
    cKurt = (x[3]**4*(np.exp(x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
    #Multiply cMean and cStDev by 100 to make them more sensitive in minimisation
    return ${state.fix[0] ? `0` : `abs(cMean - ${cMean / 100})*100`}  ${state.fix[1] ? ` ` : ` + abs(cStDev - ${cStDev / 100})*1000`} ${state.fix[2] ? ` ` : ` + abs(cSkew - ${cSkew}) `} ${state.fix[3] ? ` ` : ` + abs(cKurt - ${cKurt})*1000`}
x0 = [${state.custom.cGamma},${state.custom.cKsi},${state.custom.cDelta},${state.custom.cLambda}]
a = (0, 1)
${Math.abs(cSkew) < 1 ? `bnds = ((-0.01,0.01),(-0.1,0.1),(0, 4),a)` : `bnds = ((-1,1),(-0.1,0.1),(0, 4),a)`}
# sol = minimize(objective,x0,method='Nelder-Mead',bounds=bnds)
sol = minimize(objective,x0,method='SLSQP',bounds=bnds)
# sol = minimize(objective,x0,method='Powell',bounds=bnds)
cMean = sol.x[1]-sol.x[3]*np.exp((sol.x[2]**-2)/2)*np.sinh(sol.x[0]/sol.x[2])
cStDev = np.sqrt(sol.x[3]**2/2*(np.exp(sol.x[2]**-2)-1)*(np.exp(sol.x[2]**-2)*np.cosh(2*sol.x[0]/sol.x[2])+1))
cSkew = -(sol.x[3]**3*np.sqrt(np.exp(sol.x[2]**-2))*(np.exp(sol.x[2]**-2)-1)**2*(np.exp(sol.x[2]**-2)*(np.exp(sol.x[2]**-2)+2)*np.sinh(3*sol.x[0]/sol.x[2])+3*np.sinh(2*sol.x[0]/sol.x[2])))/(4*(cStDev**2)**1.5)
k1 = (np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))**4+2*(np.exp(sol.x[2]**-2))**3+2*(np.exp(sol.x[2]**-2))**2-3)*np.cosh(4*sol.x[0]/sol.x[2])
k2 = 4*(np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))+2)*np.cosh(3*sol.x[0]/sol.x[2])
k3 = 3*(2*(np.exp(sol.x[2]**-2))+1)
cKurt = (sol.x[3]**4*(np.exp(sol.x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
sol = {"cGamma": sol.x[0], "cDelta": sol.x[2], "cKsi": sol.x[1], "cLambda": sol.x[3], "cMean": cMean,"cStDev": cStDev,"cSkew": cSkew,"cKurt": cKurt}
sol = json.dumps(sol)
print(sol)
            `
        });
    }

    console.log(state.custom)

    const handleCheckbox = (x) => {
        let array = [...state.fix]
        array[x] = !array[x]
        dispatch({
            type: 'FIX',
            payload: array
        });
        if (x === 0) {
            setCMean(state.custom.cMean)
        } else if (x === 1) {
            setCStDev(state.custom.cStDev)
        } else if (x === 2) {
            setCSkew(state.custom.cSkew)
        } else if (x === 3) {
            setCKurt(state.custom.cKurt)
        }
    };

    const altRowStyles = {
        background: 'white',
    };

    const rowStyles = {
        background: '#d4e5ff',
    };

    const gridCont = {
    }
    const gridItem = {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(0, 0, 0, 1.0)',
        // padding: '20px',
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 1.0)',
        textAlign: 'center'
    }
    const gridItem2 = {
        backgroundColor: 'rgba(180, 180, 180, 0.8)',
        border: '1px solid rgba(0, 0, 0, 1.0)',
        // padding: '20px',
        fontSize: '14px',
        color: 'rgba(100, 100, 100, 1.0)',
        textAlign: 'center'
    }

    const visibility = state.data.length != 0 ? 'visible' : 'hidden'

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={convertCSVtoJSON}>Convert</button>
            <button onClick={loadJSON}>Local Data</button>
            {state.stats.mean && (
                <div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '250px 250px 330px',
                        paddingLeft: '10px'
                    }}>
                        <div>
                            <h1>Sample Estimators</h1>
                            <div style={{
                                width: '180px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                display: 'grid',
                                gridTemplateColumns: '100px 80px',
                                padding: '10px',
                                marginLeft: '10px'
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
                        <div>
                            <h1>Johnson SU MLE</h1>
                            <div style={{
                                width: '180px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                display: 'grid',
                                gridTemplateColumns: '100px 80px',
                                padding: '10px',

                            }}>
                                <div style={gridItem}>Gamma</div>
                                <div style={gridItem}>{state.stats.gamma ? `${(state.stats.gamma).toFixed(4)}` : 'Loading...'}</div>
                                <div style={gridItem}>Ksi</div>
                                <div style={gridItem}>{state.stats.ksi ? `${(state.stats.ksi).toFixed(4)}` : 'Loading...'}</div>
                                <div style={gridItem}>Delta</div>
                                <div style={gridItem}>{state.stats.delta ? (state.stats.delta).toFixed(4) : 'Loading...'}</div>
                                <div style={gridItem}>Lambda</div>
                                <div style={gridItem}>{state.stats.lambda ? (state.stats.lambda).toFixed(4) : 'Loading...'}</div>
                            </div>
                        </div>
                        <div>
                            <h1 style={{ marginBottom: '0px' }}>Custom Distribution</h1>
                            <div style={{
                                width: '370px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                display: 'grid',
                                gridTemplateColumns: '100px 80px 150px 40px',
                                paddingTop: '6px',
                                paddingBottom: '10px',
                                paddingLeft: '10px',
                                paddingRight: '10px'
                            }}>
                                <div />
                                <button onClick={reset}>Reset</button>
                                <div />
                                <div style={gridItem}>Flex?</div>
                                <div style={state.fix[0] ? gridItem2 : gridItem}>Mean</div>
                                <div style={state.fix[0] ? gridItem2 : gridItem}>{`${(cMean).toFixed(2)}%`}</div>
                                <div style={state.fix[0] ? gridItem2 : gridItem}>
                                    <input type="range" min={state.stats.mean - state.stats.sStDev * 100} max={state.stats.mean + state.stats.sStDev * 100} value={cMean} step={0.1} onChange={(value) => handleCMeanChange(value)} disabled={state.fix[0]} />
                                </div>
                                <div style={state.fix[0] ? gridItem2 : gridItem}><input type="checkbox" checked={state.fix[0]} onChange={() => handleCheckbox(0)} /></div>
                                {/* <div style={gridItem}><input type="checkbox" /></div> */}
                                <div style={state.fix[1] ? gridItem2 : gridItem}>StDev</div>
                                <div style={state.fix[1] ? gridItem2 : gridItem}>{`${(cStDev).toFixed(2)}%`}</div>
                                <div style={state.fix[1] ? gridItem2 : gridItem}>
                                    <input type="range" min={state.stats.sStDev * 100 * 0.1} max={state.stats.sStDev * 100 * 3} value={cStDev} step={0.1} onChange={(value) => handleCStDevChange(value)} disabled={state.fix[1]} />
                                </div>
                                <div style={state.fix[1] ? gridItem2 : gridItem}><input type="checkbox" checked={state.fix[1]} onChange={() => handleCheckbox(1)} /></div>
                                <div style={state.fix[2] ? gridItem2 : gridItem}>Skew</div>
                                <div style={state.fix[2] ? gridItem2 : gridItem}>{(cSkew).toFixed(2)}</div>
                                <div style={state.fix[2] ? gridItem2 : gridItem}>
                                    <input type="range" min={-3} max={3} value={cSkew} step={0.1} onChange={(value) => handleCSkewChange(value)} disabled={state.fix[2]} />
                                </div>
                                <div style={state.fix[2] ? gridItem2 : gridItem}><input type="checkbox" checked={state.fix[2]} onChange={() => handleCheckbox(2)} /></div>
                                <div style={state.fix[3] ? gridItem2 : gridItem}>ExKurt</div>
                                <div style={state.fix[3] ? gridItem2 : gridItem}>{(cKurt).toFixed(2)}</div>
                                <div style={state.fix[3] ? gridItem2 : gridItem}>
                                    <input type="range" min={3} max={30} value={cKurt} step={0.5} onChange={(value) => handleCKurtChange(value)} disabled={state.fix[3]} />
                                </div>
                                <div style={state.fix[3] ? gridItem2 : gridItem}><input type="checkbox" checked={state.fix[3]} onChange={() => handleCheckbox(3)} /></div>
                                <div />
                                <div />
                                <button onClick={customSolve}>Optimise/Solve</button>
                                <div />

                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                paddingLeft: '10px',
                visibility: visibility
            }}>
                <div>
                    <h1>PDFs</h1>
                    <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>
                        Number of bins: {numBins} <input type="range" min={3} max={250} value={numBins} onMouseUp={(value) => handleNumBinsMouseUp(value)} onChange={(value) => handleNumBinsChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} />
                    </label>
                    <div style={{
                        width: '500px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: 'rgba(0, 0, 0, 1.0)',
                        padding: '10px'
                    }}>
                        <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '388px', lineHeight: '26px', marginBottom: '10px' }}>
                            Percentile: {percentile}% <input type="range" min={90} max={99.9} value={percentile} step={0.1} onMouseUp={(value) => handlePercentileMouseUp(value)} onChange={(value) => handlePercentileChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} />
                            <button onClick={hidePercentiles}>{state.isHiddenP ? 'Show' : `'Hide'`}</button>
                        </label>

                        <div style={{
                            width: '480px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            display: 'grid',
                            gridTemplateColumns: '80px 80px 80px 80px 80px 80px',
                            padding: '10px'
                        }}>
                            <div style={gridItem}>Dist.</div>
                            <div style={gridItem}>Empirical</div>
                            <div style={gridItem}>Normal</div>
                            <div style={gridItem}>Student T</div>
                            <div style={gridItem}>Johnson SU</div>
                            <div style={gridItem}>Custom</div>
                            <div style={gridItem}>Lower %ile</div>
                            <div style={gridItem}>{state.stats.EileL}</div>
                            <div style={gridItem}>{state.stats.NileL}</div>
                            <div style={gridItem}>{state.stats.TileL}</div>
                            <div style={gridItem}>{state.stats.JileL}</div>
                            <div style={gridItem}>{state.stats.CileL}</div>
                            <div style={gridItem}>Upper %ile</div>
                            <div style={gridItem}>{state.stats.EileU}</div>
                            <div style={gridItem}>{state.stats.NileU}</div>
                            <div style={gridItem}>{state.stats.TileU}</div>
                            <div style={gridItem}>{state.stats.JileU}</div>
                            <div style={gridItem}>{state.stats.CileU}</div>
                        </div>
                    </div>
                </div>
                <div>
                    <h1>CDFs</h1>
                    <h2>K-S Tests</h2>
                    <div style={{
                        width: '400px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'grid',
                        gridTemplateColumns: '80px 80px 80px 80px 80px',
                        padding: '10px'
                    }}>
                        <div style={gridItem}>Empirical</div>
                        <div style={gridItem}>Normal</div>
                        <div style={gridItem}>Student T</div>
                        <div style={gridItem}>Johnson SU</div>
                        <div style={gridItem}>Custom</div>
                        <div style={gridItem}>1</div>
                        <div style={gridItem}>2</div>
                        <div style={gridItem}>3</div>
                        <div style={gridItem}>4</div>
                        <div style={gridItem}>5</div>
                    </div>
                </div>
                <div style={{ width: '45vw', height: '50vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartPDF}></canvas> : `Loading...`}</div>
                <div style={{ width: '45vw', height: '50vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartCDF}></canvas> : `Loading...`}</div>
                <div>
                    <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MinX: {minX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={minX} step={0.2} onMouseUp={(value) => handleMinXMouseUp(value)} onChange={(value) => handleMinXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                    <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MaxX: {maxX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={maxX} step={0.2} onMouseUp={(value) => handleMaxXMouseUp(value)} onChange={(value) => handleMaxXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                </div>
            </div>

            {state.data.length != 0 && (
                <div style={{ paddingLeft: '10px', }}>
                    <h1>Data</h1>
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
                                <th style={{ border: '1px solid black', padding: '8px' }}>Custom CDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Normal PDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Student T PDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Johnson SU PDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Log Johnson SU PDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Custom PDF</th>
                                <th style={{ border: '1px solid black', padding: '8px' }}>Log Custom PDF</th>
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
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.CustomCDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.NormalPDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.StudentTPDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.JohnsonSUPDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.LogJohnsonSUPDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.CustomPDF}</td>
                                    <td style={{ border: '1px solid black', padding: '8px', color: 'black' }}>{item.LogCustomPDF}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CSVtoJSONConverter;