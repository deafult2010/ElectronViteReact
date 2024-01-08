import React, { useContext, useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import jStat from "jstat";
import { ReducerContext } from '../ReducerContext';
import Chart from 'chart.js/auto'
import SPData from '../assets/SPData.json'
import { multipleLinearRegression } from './MultLinReg.js';

const PVaR = () => {
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
    const [cGamma, setCGamma] = useState(state.custom.cGamma);
    const [cKsi, setCKsi] = useState(state.custom.cKsi);
    const [cDelta, setCDelta] = useState(state.custom.cDelta);
    const [cLambda, setCLambda] = useState(state.custom.cLambda);
    const [cMu, setCMu] = useState(state.custom.cMu);
    const [cSigma, setCSigma] = useState(state.custom.cSigma);
    const [cDf, setCDf] = useState(state.custom.cDf);
    const [cMLE, setCMLE] = useState(state.custom.cMLE);
    const [cNormMLE, setCNormMLE] = useState(state.custom.cNormMLE);
    const [cStudtMLE, setCStudtMLE] = useState(state.custom.cStudtMLE);
    const chartPDF = useRef(null);
    const chartCDF = useRef(null);
    const chartACF = useRef(null);
    const chartARCH = useRef(null);
    // save to csv
    const [dataFile, setdataFile] = useState('local');
    const [distOption, setDistOption] = useState('custom');
    const [uploadOption, setUploadOption] = useState('csv');
    const [inputOption, setInputOption] = useState('local');
    const [tabData, setTabData] = useState(state.tabData);
    const [tabDataSer, setTabDataSer] = useState(state.tabDataSer);
    const [urlOption, setUrlOption] = useState(state.urloption);
    const today = new Date();
    const [date, setDate] = useState(`${today.getDate().toString().padStart(2, "0")}-${today.toLocaleString('default', { month: 'short' })}-${today.getFullYear().toString().slice(-2)}`)
    const [riskFactor, setRiskFactor] = useState('SP500')
    const [tenor, setTenor] = useState(0)
    const [quoteType, setQuoteType] = useState('Price')
    const [returnPeriod, setReturnPeriod] = useState(1)
    const [varModel, setVarModel] = useState('PARAMETRIC')
    const [lookback, setLookback] = useState(1000)
    const [valAtRisk, setValAtRisk] = useState(0)
    const [fatTailMult, setFatTailMult] = useState(0)
    const [localLoc, setLocalLoc] = useState(state.localLoc)
    const [sshLoc, setSshLoc] = useState(state.sshLoc)
    const [user, setUser] = useState(state.sshUser)
    const [pass, setPass] = useState(state.sshPass)
    const [host, setHost] = useState(state.host)

    const handleUserChange = (e) => {
        setUser(e.target.value);
        dispatch({
            type: 'SSHUSER',
            payload: e.target.value
        });
    }
    const handlePassChange = (e) => {
        setPass(e.target.value);
        dispatch({
            type: 'SSHPASS',
            payload: e.target.value
        });
    }

    const handleSshLocChange = (e) => {
        setSshLoc(e.target.value);
        dispatch({
            type: 'SSHPASS',
            payload: e.target.value
        });
    }
    const handleLocalLocChange = (e) => {
        setLocalLoc(e.target.value);
        dispatch({
            type: 'SSHPASS',
            payload: e.target.value
        });
    }

    const handleHostChange = (e) => {
        setHost(e.target.value);
        dispatch({
            type: 'HOST',
            payload: e.target.value
        });
    }

    const handleDistChange = (e) => {
        setDistOption(e.target.value);
        setValAtRisk(e.target.value === 'custom' ? state.stats.CileL : e.target.value === 'johnsonsu' ? state.stats.CileL : e.target.value === 'normal' ? state.stats.CNileL : state.stats.CTileL)
        // Uses StudT FTM regardless of selection
        setFatTailMult(e.target.value === 'custom' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : e.target.value === 'johnsonsu' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : e.target.value === 'normal' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2))
    };
    const handleUploadChange = (e) => {
        setUploadOption(e.target.value);
    };
    const handleInputChange = (e) => {
        setInputOption(e.target.value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCSVFile(file);
    };

    const handleDownload = () => {
        const data = [{ BUSINESS_DATE: date, RISK_FACTOR: riskFactor, YEARS_TO_MATURITY: tenor, QUOTE_TYPE: quoteType, RETURN_PERIOD: returnPeriod, VAR_MODEL: varModel, OBSERVATIONS: lookback, VAR: valAtRisk }]
        const fileName = `ICEU_HaircutVARs_${Date.now()}.xlsx`
        // const fileName = `ICEU_HaircutVARs_${Date.now()}.csv`
        console.log(data)
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        // const csv = Papa.unparse(data);
        // const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        if (uploadOption === 'csv') {
            window.api.saveBlob(blob, localLoc + fileName);
        } else if (uploadOption === 'tableau') {
            window.api.uploadBlob(blob, localLoc + fileName, host, sshLoc + fileName, user, pass);
            // wait 3 seconds for ssh upload to occur then run an extract refresh
            setTimeout(() => {
                // may need to change hard coded api value with future tableau server releases
                const url = `${state.server}/api/3.17/sites/${state.site}/datasources/${state.ds}/refresh`
                window.api.refresh(state.token, url);
            }, 3000);
        }
    };

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };
    const handleRiskFactorChange = (e) => {
        setRiskFactor(e.target.value);
    };
    const handleTenorChange = (e) => {
        setTenor(e.target.value);
    };
    const handleQuoteTypeChange = (e) => {
        setQuoteType(e.target.value);
    };
    const handleReturnPeriodChange = (e) => {
        setReturnPeriod(e.target.value);
    };
    const handleVarModelChange = (e) => {
        setVarModel(e.target.value);
    };
    const handleLookbackChange = (e) => {
        setLookback(e.target.value);
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
                return { ...data, "Return1D": "N/A", "Return2D": "N/A" };
            } else if (index === 1) {
                const previousPrice = parseFloat(initialData[index - 1].Price);
                const currentPrice = parseFloat(data.Price);
                const oneDayReturn = ((currentPrice - previousPrice) / previousPrice) * 100;
                return { ...data, "Return1D": `${oneDayReturn.toFixed(2)}%`, "Return2D": "N/A" };
            } else {
                const prevPrevPrice = parseFloat(initialData[index - 2].Price);
                const previousPrice = parseFloat(initialData[index - 1].Price);
                const currentPrice = parseFloat(data.Price);
                const oneDayReturn = ((currentPrice - previousPrice) / previousPrice) * 100;
                const twoDayReturn = ((currentPrice - prevPrevPrice) / prevPrevPrice) * 100;
                return { ...data, "Return1D": `${oneDayReturn.toFixed(2)}%`, "Return2D": `${twoDayReturn.toFixed(2)}%` };
            }
        });

        const rankedData = updatedData.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "Rank1D": "N/A" };
            } else {
                return { ...item, "Rank1D": index };
            }
        });

        const rankedData2 = rankedData.map((item, index) => {
            if (index <= 1) {
                // First entry, no return calculation possible
                return { ...item, "Rank2D": "N/A" };
            } else {
                return { ...item, "Rank2D": index - 1 };
            }
        });

        const oneDayReturns = rankedData2.map(obj => obj.Return1D)
        const twoDayReturns = rankedData2.map(obj => obj.Return2D)

        // Sort data by Return in ascending order
        const oneDayReturnsSorted = oneDayReturns.sort((a, b) => {
            return parseFloat(a) - parseFloat(b);
        });
        const twoDayReturnsSorted = twoDayReturns.sort((a, b) => {
            return parseFloat(a) - parseFloat(b);
        });

        for (let i = 0; i < rankedData2.length; i++) {
            rankedData2[i].RankedReturn1D = oneDayReturnsSorted[i];
            rankedData2[i].RankedReturn2D = twoDayReturnsSorted[i];
            if (1 === 1) {
                rankedData2[i].RankedReturn = oneDayReturnsSorted[i];
            } else {
                rankedData2[i].RankedReturn = twoDayReturnsSorted[i];
            }
        }

        const addEmpiricalCDF = rankedData2.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "EmpiricalCDF": "N/A" };
            } else {
                const empiricalCDF = `${((index / (rankedData2.length - 1)) * 100).toFixed(2)}%`
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
        const CNileL = `${Number(jStat.normal.inv(1 - percentile / 100, cMu, cSigma * 100)).toFixed(2)}%`
        const CTileL = `${Number(jStat.studentt.inv(1 - percentile / 100, cDf)).toFixed(2)}%`
        const NileU = `${Number(jStat.normal.inv(percentile / 100, mean, sStDev * 100)).toFixed(2)}%`
        const TileU = `${Number(jStat.studentt.inv(percentile / 100, df)).toFixed(2)}%`
        const EileU = `${Number(jStat.percentile(returns, percentile / 100)).toFixed(2)}%`
        const JileU = `Loading...`
        const CileU = `Loading...`
        const CNileU = `${Number(jStat.normal.inv(percentile / 100, cMu, cSigma * 100)).toFixed(2)}%`
        const CTileU = `${Number(jStat.studentt.inv(percentile / 100, cDf)).toFixed(2)}%`

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

        // similar to returns but divide by 100
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
                const normalPDF = `${(jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, mean, sStDev)).toFixed(2)}`
                return { ...item, "NormalPDF": normalPDF };
            }
        });

        const addStudentTPDF = addNormalPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "StudentTPDF": "N/A" };
            } else {
                const studentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev), df)) * 100 / (100 * sStDev)).toFixed(2)}`
                // const studentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((df - 2) / df)), df)) * 100).toFixed(2)}`
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

        const addCustomNormalCDF = addLogCustomPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomNormalCDF": "N/A" };
            } else {
                const customNormalCDF = `${((jStat.normal.cdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma, true)) * 100).toFixed(2)}%`
                return { ...item, "CustomNormalCDF": customNormalCDF };
            }
        });

        const addCustomNormalPDF = addCustomNormalCDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomNormalPDF": "N/A" };
            } else {
                const customNormalPDF = `${(jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma)).toFixed(2)}`
                return { ...item, "CustomNormalPDF": customNormalPDF };
            }
        });

        const addLogCustomNormalPDF = addCustomNormalPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "LogCustomNormalPDF": "N/A" };
            } else {
                const logCustomNormalPDF = `${(Math.log(jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma))).toFixed(2)}`
                return { ...item, "LogCustomNormalPDF": logCustomNormalPDF };
            }
        });

        const addCustomStudentTCDF = addLogCustomNormalPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomStudentTCDF": "N/A" };
            } else {
                const customStudentTCDF = `${((jStat.studentt.cdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((cDf - 2) / cDf)), cDf)) * 100).toFixed(2)}%`
                return { ...item, "CustomStudentTCDF": customStudentTCDF };
            }
        });

        const addCustomStudentTPDF = addCustomStudentTCDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "CustomStudentTPDF": "N/A" };
            } else {
                const customStudentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev), cDf)) * 100 / (100 * sStDev)).toFixed(2)}`
                // const customStudentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((cDf - 2) / cDf)), cDf)) * 100).toFixed(2)}`
                return { ...item, "CustomStudentTPDF": customStudentTPDF };
            }
        });

        const addLogCustomStudentTPDF = addCustomStudentTPDF.map((item, index) => {
            if (index === 0) {
                // First entry, no return calculation possible
                return { ...item, "LogCustomStudentTPDF": "N/A" };
            } else {
                const LogCustomStudentTPDF = `${(Math.log((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev), cDf)) * 100 / (100 * sStDev))).toFixed(2)}`
                // const LogCustomStudentTPDF = `${(Math.log((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - mean) / (sStDev * Math.sqrt((cDf - 2) / cDf)), cDf)) * 100)).toFixed(2)}`
                return { ...item, "LogCustomStudentTPDF": LogCustomStudentTPDF };
            }
        });

        let sum1 = 0;
        for (let i = 0; i < addLogCustomPDF.length; i++) {
            if (addLogCustomPDF[i].LogCustomPDF != "N/A") {
                sum1 += Number(addLogCustomPDF[i].LogCustomPDF);
            }
        }
        setCMLE(sum1)
        let sum2 = 0;
        for (let i = 0; i < addLogCustomNormalPDF.length; i++) {
            if (addLogCustomNormalPDF[i].LogCustomNormalPDF != "N/A") {
                sum2 += Number(addLogCustomNormalPDF[i].LogCustomNormalPDF);
            }
        }
        setCNormMLE(sum2)
        let sum3 = 0;
        for (let i = 0; i < addLogCustomStudentTPDF.length; i++) {
            if (addLogCustomStudentTPDF[i].LogCustomStudentTPDF != "N/A") {
                sum3 += Number(addLogCustomStudentTPDF[i].LogCustomStudentTPDF);
            }
        }
        setCStudtMLE(sum3)

        const addResids = addLogCustomStudentTPDF.map((item, index) => {
            const Resid = Number(addLogCustomStudentTPDF[index].Return1D.replace('%', '')) / 100 - mean
            return { ...item, "Resid": Resid, "Resid2": Resid ** 2 };
        });

        const resids = addResids.slice(1).map(item => item.Resid);
        const residsMean = jStat.mean(resids);
        const resids2 = addResids.slice(1).map(item => item.Resid2);
        const resids2Mean = jStat.mean(resids2);


        const Lags = addResids.map((item, index) => {
            const rl0 = (addResids[index].Resid - residsMean) * (addResids[index - 0].Resid - residsMean)
            const rl1 = index <= 1 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 1].Resid - residsMean)
            const rl2 = index <= 2 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 2].Resid - residsMean)
            const rl3 = index <= 3 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 3].Resid - residsMean)
            const rl4 = index <= 4 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 4].Resid - residsMean)
            const rl5 = index <= 5 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 5].Resid - residsMean)
            const rl6 = index <= 6 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 6].Resid - residsMean)
            const rl7 = index <= 7 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 7].Resid - residsMean)
            const rl8 = index <= 8 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 8].Resid - residsMean)
            const rl9 = index <= 9 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 9].Resid - residsMean)
            const rl10 = index <= 10 ? 0 : (addResids[index].Resid - residsMean) * (addResids[index - 10].Resid - residsMean)
            const r2l0 = (addResids[index].Resid2 - resids2Mean) * (addResids[index - 0].Resid2 - resids2Mean)
            const r2l1 = index <= 1 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 1].Resid2 - resids2Mean)
            const r2l2 = index <= 2 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 2].Resid2 - resids2Mean)
            const r2l3 = index <= 3 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 3].Resid2 - resids2Mean)
            const r2l4 = index <= 4 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 4].Resid2 - resids2Mean)
            const r2l5 = index <= 5 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 5].Resid2 - resids2Mean)
            const r2l6 = index <= 6 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 6].Resid2 - resids2Mean)
            const r2l7 = index <= 7 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 7].Resid2 - resids2Mean)
            const r2l8 = index <= 8 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 8].Resid2 - resids2Mean)
            const r2l9 = index <= 9 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 9].Resid2 - resids2Mean)
            const r2l10 = index <= 10 ? 0 : (addResids[index].Resid2 - resids2Mean) * (addResids[index - 10].Resid2 - resids2Mean)
            return { ...item, "rl0": rl0, "rl1": rl1, "rl2": rl2, "rl3": rl3, "rl4": rl4, "rl5": rl5, "rl6": rl6, "rl7": rl7, "rl8": rl8, "rl9": rl9, "rl10": rl10, "r2l0": r2l0, "r2l1": r2l1, "r2l2": r2l2, "r2l3": r2l3, "r2l4": r2l4, "r2l5": r2l5, "r2l6": r2l6, "r2l7": r2l7, "r2l8": r2l8, "r2l9": r2l9, "r2l10": r2l10 };
        });

        const rdevSq = jStat.variance(Lags.slice(1).map(item => item.Resid), true) * (Lags.slice(1).length - 1);
        const r_0 = jStat.sum(Lags.slice(1).map(item => item.rl0)) / rdevSq
        const r_1 = jStat.sum(Lags.slice(1).map(item => item.rl1)) / rdevSq
        const r_2 = jStat.sum(Lags.slice(1).map(item => item.rl2)) / rdevSq
        const r_3 = jStat.sum(Lags.slice(1).map(item => item.rl3)) / rdevSq
        const r_4 = jStat.sum(Lags.slice(1).map(item => item.rl4)) / rdevSq
        const r_5 = jStat.sum(Lags.slice(1).map(item => item.rl5)) / rdevSq
        const r_6 = jStat.sum(Lags.slice(1).map(item => item.rl6)) / rdevSq
        const r_7 = jStat.sum(Lags.slice(1).map(item => item.rl7)) / rdevSq
        const r_8 = jStat.sum(Lags.slice(1).map(item => item.rl8)) / rdevSq
        const r_9 = jStat.sum(Lags.slice(1).map(item => item.rl9)) / rdevSq
        const r_10 = jStat.sum(Lags.slice(1).map(item => item.rl10)) / rdevSq
        const r2devSq = jStat.variance(Lags.slice(1).map(item => item.Resid2), true) * (Lags.slice(1).length - 1);
        const r2_0 = jStat.sum(Lags.slice(1).map(item => item.r2l0)) / r2devSq
        const r2_1 = jStat.sum(Lags.slice(1).map(item => item.r2l1)) / r2devSq
        const r2_2 = jStat.sum(Lags.slice(1).map(item => item.r2l2)) / r2devSq
        const r2_3 = jStat.sum(Lags.slice(1).map(item => item.r2l3)) / r2devSq
        const r2_4 = jStat.sum(Lags.slice(1).map(item => item.r2l4)) / r2devSq
        const r2_5 = jStat.sum(Lags.slice(1).map(item => item.r2l5)) / r2devSq
        const r2_6 = jStat.sum(Lags.slice(1).map(item => item.r2l6)) / r2devSq
        const r2_7 = jStat.sum(Lags.slice(1).map(item => item.r2l7)) / r2devSq
        const r2_8 = jStat.sum(Lags.slice(1).map(item => item.r2l8)) / r2devSq
        const r2_9 = jStat.sum(Lags.slice(1).map(item => item.r2l9)) / r2devSq
        const r2_10 = jStat.sum(Lags.slice(1).map(item => item.r2l10)) / r2devSq

        const mlrRArray = addResids.slice(1).map((item, index) => [1, index <= 1 ? 0 : addResids[index - 1].Resid, index <= 2 ? 0 : addResids[index - 2].Resid, index <= 3 ? 0 : addResids[index - 3].Resid, index <= 4 ? 0 : addResids[index - 4].Resid, index <= 5 ? 0 : addResids[index - 5].Resid,])
        const rArray = addResids.slice(1).map((item) => [item.Resid])
        const rCoeffs = multipleLinearRegression(mlrRArray, rArray)
        const acfQStat = jStat.sumsqrd(rCoeffs) * addResids.slice(1).length
        const acfPVal = 1 - jStat.chisquare.cdf(acfQStat, 5)

        const mlrR2Array = addResids.slice(1).map((item, index) => [1, index <= 1 ? 0 : addResids[index - 1].Resid2, index <= 2 ? 0 : addResids[index - 2].Resid2, index <= 3 ? 0 : addResids[index - 3].Resid2, index <= 4 ? 0 : addResids[index - 4].Resid2, index <= 5 ? 0 : addResids[index - 5].Resid2,])
        const r2Array = addResids.slice(1).map((item) => [item.Resid2])
        const r2Coeffs = multipleLinearRegression(mlrR2Array, r2Array)
        const archQStat = jStat.sumsqrd(r2Coeffs) * addResids.slice(1).length
        const archPVal = 1 - jStat.chisquare.cdf(archQStat, 5)

        dispatch({
            type: 'ACF',
            payload: { r_0, r_1, r_2, r_3, r_4, r_5, r_6, r_7, r_8, r_9, r_10, r2_0, r2_1, r2_2, r2_3, r2_4, r2_5, r2_6, r2_7, r2_8, r2_9, r2_10, acfQStat, acfPVal, archQStat, archPVal }
        });

        dispatch({
            type: 'CUSTOM',
            payload: { "cMean": state.custom.cMean, "cStDev": state.custom.cStDev, "cSkew": state.custom.cSkew, "cKurt": state.custom.cKurt, "cGamma": state.custom.cGamma, "cDelta": state.custom.cDelta, "cKsi": state.custom.cKsi, "cLambda": state.custom.cLambda, "cMLE": sum1, "cMu": state.custom.cMu, "cSigma": state.custom.cSigma, "cDf": state.custom.cDf, "cNormMLE": sum2, "cStudtMLE": sum3 }
        });

        dispatch({
            type: 'DATA',
            payload: addLogCustomStudentTPDF
        });

        dispatch({
            type: 'STATS',
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
                'CNileL': CNileL,
                'CTileL': CTileL,
                'NileU': NileU,
                'EileU': EileU,
                'TileU': TileU,
                'JileU': JileU,
                'CileU': CileU,
                'CNileU': CNileU,
                'CTileU': CTileU,
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

    const loadTableau = () => {
        if (urlOption === 'public') {
            if (tabData.length > 1) {
                computeStats(tabData)
            } else {
                computeStats(SPData)
            }
        }
        else if (urlOption === 'server') {
            if (tabDataSer.length > 1) {
                computeStats(tabDataSer)
            } else {
                computeStats(SPData)
            }
        }
    }

    const customData = (data) => {
        // destructure
        const { cMean, cStDev, cSkew, cKurt, cGamma, cDelta, cKsi, cLambda } = data
        setCMean(cMean * 100)
        setCStDev(cStDev * 100)
        setCSkew(cSkew)
        setCKurt(cKurt)
        setCGamma(cGamma)
        setCKsi(cKsi)
        setCDelta(cDelta)
        setCLambda(cLambda)
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
        let sum = 0;
        for (let i = 0; i < addLogCustomPDF.length; i++) {
            if (addLogCustomPDF[i].LogCustomPDF != "N/A") {
                sum += Number(addLogCustomPDF[i].LogCustomPDF);
            }
        }
        setCMLE(sum)
        dispatch({
            type: 'CUSTOM',
            payload: {
                cMean: cMean * 100, cStDev: cStDev * 100, cSkew, cKurt, cGamma, cDelta, cKsi, cLambda, cMLE: sum, cMu: state.custom.cMu, cSigma: state.custom.cSigma, cDf: state.custom.cDf, cNormMLE: state.custom.cNormMLE, cStudtMLE: state.custom.cStudtMLE
            }
        });
        dispatch({
            type: 'DATA',
            payload: addLogCustomPDF
        });
    }

    useEffect(() => {
        if (state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF'))) {
            const addCDFDiffs = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "NDiff": "N/A", "TDiff": "N/A", "JDiff": "N/A", "CDiff": "N/A", "CNDiff": "N/A", "CTDiff": "N/A" };
                } else {
                    const NDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.NormalCDF.replace('%', '')) / 100);
                    const TDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.StudentTCDF.replace('%', '')) / 100)
                    const JDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.JohnsonSUCDF.replace('%', '')) / 100)
                    const CDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.CustomCDF.replace('%', '')) / 100)
                    const CNDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.CustomNormalCDF.replace('%', '')) / 100)
                    const CTDiff = Math.abs(Number(item.EmpiricalCDF.replace('%', '')) / 100 - Number(item.CustomStudentTCDF.replace('%', '')) / 100)
                    return { ...item, "NDiff": NDiff, "TDiff": TDiff, "JDiff": JDiff, "CDiff": CDiff, "CNDiff": CNDiff, "CTDiff": CTDiff };
                }
            });

            // const NR = Math.max(...addCDFDiffs.slice(1).map(obj => obj.NDiff));
            const NR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.NDiff : 0));
            const TR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.TDiff : 0));
            const JR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.JDiff : 0));
            const CR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.CDiff : 0));
            const CNR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.CNDiff : 0));
            const CTR = Math.max(...addCDFDiffs.slice(1).map(obj => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX ? obj.CTDiff : 0));
            // I get more intuitive results sticking with total count of observations compared to just the count of observations in window
            // const count = addCDFDiffs.filter((obj) => parseFloat(obj.RankedReturn) > minX && parseFloat(obj.RankedReturn) < maxX).length;
            const count2 = addCDFDiffs.length
            const NKS = NR * Math.sqrt(count2)
            const TKS = TR * Math.sqrt(count2)
            const JKS = JR * Math.sqrt(count2)
            const CKS = CR * Math.sqrt(count2)
            const CNKS = CNR * Math.sqrt(count2)
            const CTKS = CTR * Math.sqrt(count2)
            const NPV = Math.exp(-(NR ** 2) * (count2) * 2)
            const TPV = Math.exp(-(TR ** 2) * (count2) * 2)
            const JPV = Math.exp(-(JR ** 2) * (count2) * 2)
            const CPV = Math.exp(-(CR ** 2) * (count2) * 2)
            const CNPV = Math.exp(-(CNR ** 2) * (count2) * 2)
            const CTPV = Math.exp(-(CTR ** 2) * (count2) * 2)

            dispatch({
                type: 'KS',
                payload: {
                    'nks': NKS.toFixed(2),
                    'tks': TKS.toFixed(2),
                    'jks': JKS.toFixed(2),
                    'cks': CKS.toFixed(2),
                    'cnks': CNKS.toFixed(2),
                    'ctks': CTKS.toFixed(2),
                    'npv': (NPV * 100).toFixed(2),
                    'tpv': (TPV * 100).toFixed(2),
                    'jpv': (JPV * 100).toFixed(2),
                    'cpv': (CPV * 100).toFixed(2),
                    'cnpv': (CNPV * 100).toFixed(2),
                    'ctpv': (CTPV * 100).toFixed(2),
                }
            });
        }
    }, [state.data, minX, maxX])

    useEffect(() => {
        if (state.result.startsWith('{"JileL":')) {
            const data = JSON.parse(state.result)
            dispatch({
                type: 'JILE',
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
            let sum = 0;
            for (let i = 0; i < addLogJohnsonSUPDF.length; i++) {
                if (addLogJohnsonSUPDF[i].LogJohnsonSUPDF != "N/A") {
                    sum += Number(addLogJohnsonSUPDF[i].LogJohnsonSUPDF);
                }
            }
            dispatch({
                type: 'STATS',
                payload: {
                    'gamma': data.gamma,
                    'delta': data.delta,
                    'ksi': data.ksi,
                    'lambda': data.lambda,
                    'mle': sum
                }
            });
            dispatch({
                type: 'DATA',
                payload: addLogJohnsonSUPDF
            });
        }
        if (state.result.startsWith(`{"cGamma":`)) {
            const data = JSON.parse(state.result)
            customData(data)
        }
    }, [state.result])

    useEffect(() => {
        setValAtRisk(distOption === 'custom' ? state.stats.CileL : distOption === 'johnsonsu' ? state.stats.CileL : distOption === 'normal' ? state.stats.CNileL : state.stats.CTileL)
        // Uses StudT FTM regardless of selection
        setFatTailMult(distOption === 'custom' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : distOption === 'johnsonsu' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : distOption === 'normal' ? (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2) : (Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)) * Math.sqrt((state.custom.cDf - 2) / state.custom.cDf)).toFixed(2))
    }, [state.stats])





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
                const chartOptions2 = {
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
                                    `${value}`
                            },
                            min: 0,
                            max: 10,
                            //prevent offset between bar charts on x-axis
                            stacked: true,
                        },
                        y: {
                            type: 'linear',
                            ticks: {
                                beginAtZero: true,
                                callback: (value) => `${value * 100}%`,
                            },
                            stacked: false,
                        },
                    },
                    plugins: {
                        legend: {
                            display: false
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
                const customNormalCDF = state.data.map((item) => item.CustomNormalCDF.replace('%', ''));
                const customStudentTCDF = state.data.map((item) => item.CustomStudentTCDF.replace('%', ''));
                const customNormalPDF = state.data.map((item) => item.CustomNormalPDF.replace('%', ''));
                const customStudentTPDF = state.data.map((item) => item.CustomStudentTPDF.replace('%', ''));
                const ACF = [
                    { x: 0, y: state.acf.r_0 },
                    { x: 1, y: state.acf.r_1 },
                    { x: 2, y: state.acf.r_2 },
                    { x: 3, y: state.acf.r_3 },
                    { x: 4, y: state.acf.r_4 },
                    { x: 5, y: state.acf.r_5 },
                    { x: 6, y: state.acf.r_6 },
                    { x: 7, y: state.acf.r_7 },
                    { x: 8, y: state.acf.r_8 },
                    { x: 9, y: state.acf.r_9 },
                    { x: 10, y: state.acf.r_10 },
                ];
                const CI_U = [
                    { x: -1, y: 2 / Math.sqrt(state.data.length - 1) },
                    { x: 11, y: 2 / Math.sqrt(state.data.length - 1) },
                ];
                const CI_L = [
                    { x: -1, y: -2 / Math.sqrt(state.data.length - 1) },
                    { x: 11, y: -2 / Math.sqrt(state.data.length - 1) },
                ];
                const ARCH = [
                    { x: 0, y: state.acf.r2_0 },
                    { x: 1, y: state.acf.r2_1 },
                    { x: 2, y: state.acf.r2_2 },
                    { x: 3, y: state.acf.r2_3 },
                    { x: 4, y: state.acf.r2_4 },
                    { x: 5, y: state.acf.r2_5 },
                    { x: 6, y: state.acf.r2_6 },
                    { x: 7, y: state.acf.r2_7 },
                    { x: 8, y: state.acf.r2_8 },
                    { x: 9, y: state.acf.r2_9 },
                    { x: 10, y: state.acf.r2_10 },
                ];

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
                            data: distOption === 'custom' ? customCDF : distOption === 'johnsonsu' ? customCDF : distOption === 'normal' ? customNormalCDF : customStudentTCDF,
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
                            data: distOption === 'custom' ? customPDF : distOption === 'johnsonsu' ? customPDF : distOption === 'normal' ? customNormalPDF : customStudentTPDF,
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
                            data: [{ x: distOption === 'custom' ? Number(state.stats.CileL.replace('%', '')) : distOption === 'johnsonsu' ? Number(state.stats.CileL.replace('%', '')) : distOption === 'normal' ? Number(state.stats.CNileL.replace('%', '')) : Number(state.stats.CTileL.replace('%', '')), y: 0 }, { x: distOption === 'custom' ? Number(state.stats.CileL.replace('%', '')) : distOption === 'johnsonsu' ? Number(state.stats.CileL.replace('%', '')) : distOption === 'normal' ? Number(state.stats.CNileL.replace('%', '')) : Number(state.stats.CTileL.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            showLine: true,
                            hidden: state.isHidden[4] || state.isHiddenP
                        },
                        {
                            type: 'scatter',
                            label: `C %ileU`,
                            data: [{ x: distOption === 'custom' ? Number(state.stats.CileU.replace('%', '')) : distOption === 'johnsonsu' ? Number(state.stats.CileU.replace('%', '')) : distOption === 'normal' ? Number(state.stats.CNileU.replace('%', '')) : Number(state.stats.CTileU.replace('%', '')), y: 0 }, { x: distOption === 'custom' ? Number(state.stats.CileU.replace('%', '')) : distOption === 'johnsonsu' ? Number(state.stats.CileU.replace('%', '')) : distOption === 'normal' ? Number(state.stats.CNileU.replace('%', '')) : Number(state.stats.CTileU.replace('%', '')), y: 1 }],
                            yAxisID: 'yPct',
                            backgroundColor: 'rgba(75, 192, 77, 0.2)',
                            borderColor: 'rgba(75, 192, 77, 1)',
                            showLine: true,
                            hidden: state.isHidden[4] || state.isHiddenP
                        },
                    ] : [],
                };

                const chartACFData = {
                    datasets: state.stats.EileL ? [
                        {
                            type: 'bar',
                            label: 'ACF',
                            data: ACF,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                        },
                        {
                            type: 'line',
                            label: 'CI_U',
                            data: CI_U,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            borderDash: [10, 5]
                        },
                        {
                            type: 'line',
                            label: 'CI_L',
                            data: CI_L,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            borderDash: [10, 5]
                        },
                    ] : [],
                };

                const chartARCHData = {
                    datasets: state.stats.EileL ? [
                        {
                            type: 'bar',
                            label: 'ACF',
                            data: ARCH,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                        },
                        {
                            type: 'line',
                            label: 'CI_U',
                            data: CI_U,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 3,
                            borderDash: [10, 5]
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

                const myChart3 = new Chart(chartACF.current, {
                    type: 'scatter',
                    data: chartACFData,
                    options: chartOptions2,
                });

                const myChart4 = new Chart(chartARCH.current, {
                    type: 'scatter',
                    data: chartARCHData,
                    options: chartOptions2,
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
                    myChart3.destroy();
                    myChart4.destroy();
                };
            }
        }
    }, [state.data, state.numBins, state.ranges.minX, state.ranges.maxX, state.isHidden, state.isHiddenP, state.stats, distOption]);

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
        const CNileL = `${Number(jStat.normal.inv(1 - percentile / 100, state.custom.cMu, state.custom.cSigma * 100)).toFixed(2)}%`
        const CNileU = `${Number(jStat.normal.inv(percentile / 100, state.custom.cMu, state.custom.cSigma * 100)).toFixed(2)}%`
        const CTileL = `${Number(jStat.studentt.inv(1 - percentile / 100, state.custom.cDf)).toFixed(2)}%`
        const CTileU = `${Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)).toFixed(2)}%`

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
                'CNileL': CNileL,
                'CNileU': CNileU,
                'CTileL': CTileL,
                'CTileU': CTileU,
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
    const handleCStDevChange = (e) => {
        setCStDev(Number(e.target.value));
    }
    const handleCSkewChange = (e) => {
        setCSkew(Number(e.target.value));
    }
    const handleCKurtChange = (e) => {
        setCKurt(Number(e.target.value));
    }
    const handleCGammaChange = (e) => {
        setCGamma(Number(e.target.value));
    }
    const handleCKsiChange = (e) => {
        setCKsi(Number(e.target.value));
    }
    const handleCDeltaChange = (e) => {
        setCDelta(Number(e.target.value));
    }
    const handleCLambdaChange = (e) => {
        setCLambda(Number(e.target.value));
    }
    const handleCMuChange = (e) => {
        setCMu(Number(e.target.value));
    }
    const handleCSigmaChange = (e) => {
        setCSigma(Number(e.target.value) / 100);
    }
    const handleCDfChange = (e) => {
        setCDf(Number(e.target.value));
    }


    const hidePercentiles = () => {
        dispatch({
            type: 'ISHIDDENP',
            payload: !state.isHiddenP
        });
    }

    const reset = () => {
        const data = { cMean: 0, cStDev: 0.01, cSkew: 0, cKurt: 3, cGamma: 0, cKsi: 0, cDelta: 5.521765, cLambda: 0.054318 }
        if (distOption === 'custom') {
            customData(data)
        } else if (distOption === 'normal') {
            // console.log('normal')
        } else if (distOption === 'studentt') {
            // console.log('studentt')
        } else if (distOption === 'johnsonsu') {
            customData(data)
        }
    }

    const undo = () => {
        // console.log('undo')
    }

    const customSolve = () => {
        if (distOption === 'custom') {
            dispatch({
                type: 'CUSTOM',
                payload: { "cMean": cMean, "cStDev": cStDev, "cSkew": cSkew, "cKurt": cKurt, "cGamma": state.custom.cGamma, "cDelta": state.custom.cDelta, "cKsi": state.custom.cKsi, "cLambda": state.custom.cLambda, "cMLE": state.custom.cMLE, "cMu": state.custom.cMu, "cSigma": state.custom.cSigma, "cDf": state.custom.cDf, "cNormMLE": state.custom.cNormMLE, "cStudtMLE": state.custom.cStudtMLE }
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
    k1 = (np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))**4+2*(np.exp(x[2]**-2))**3+3*(np.exp(x[2]**-2))**2-3)*np.cosh(4*x[0]/x[2])
    k2 = 4*(np.exp(x[2]**-2))**2*((np.exp(x[2]**-2))+2)*np.cosh(3*x[0]/x[2])
    k3 = 3*(2*(np.exp(x[2]**-2))+1)
    cKurt = (x[3]**4*(np.exp(x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
    #Multiply cMean and cStDev by 100 to make them more sensitive in minimisation
    return ${state.fix[0] ? `0` : `abs(cMean - ${cMean / 100})*100`}  ${state.fix[1] ? ` ` : ` + abs(cStDev - ${cStDev / 100})*1000`} ${state.fix[2] ? ` ` : ` + abs(cSkew - ${cSkew}) `} ${state.fix[3] ? ` ` : ` + abs(cKurt - ${cKurt})*1000`}
x0 = [${state.custom.cGamma},${state.custom.cKsi},${state.custom.cDelta},${state.custom.cLambda}]
a = (0, 1)
# below logic helps to optimise the computation for when skew is left unchanged
${Math.abs(cSkew) <= 0.3 ? `bnds = ((-0.04,0.04),(-0.1,0.1),(0, 4),a)` : `bnds = ((-0.7,0.7),(-0.1,0.1),(0, 4),a)`}
# SLSQP appears to be the best method
sol = minimize(objective,x0,method='SLSQP',bounds=bnds)
# sol = minimize(objective,x0,method='Nelder-Mead',bounds=bnds)
# sol = minimize(objective,x0,method='Powell',bounds=bnds)
cMean = sol.x[1]-sol.x[3]*np.exp((sol.x[2]**-2)/2)*np.sinh(sol.x[0]/sol.x[2])
cStDev = np.sqrt(sol.x[3]**2/2*(np.exp(sol.x[2]**-2)-1)*(np.exp(sol.x[2]**-2)*np.cosh(2*sol.x[0]/sol.x[2])+1))
cSkew = -(sol.x[3]**3*np.sqrt(np.exp(sol.x[2]**-2))*(np.exp(sol.x[2]**-2)-1)**2*(np.exp(sol.x[2]**-2)*(np.exp(sol.x[2]**-2)+2)*np.sinh(3*sol.x[0]/sol.x[2])+3*np.sinh(2*sol.x[0]/sol.x[2])))/(4*(cStDev**2)**1.5)
k1 = (np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))**4+2*(np.exp(sol.x[2]**-2))**3+3*(np.exp(sol.x[2]**-2))**2-3)*np.cosh(4*sol.x[0]/sol.x[2])
k2 = 4*(np.exp(sol.x[2]**-2))**2*((np.exp(sol.x[2]**-2))+2)*np.cosh(3*sol.x[0]/sol.x[2])
k3 = 3*(2*(np.exp(sol.x[2]**-2))+1)
cKurt = (sol.x[3]**4*(np.exp(sol.x[2]**-2)-1)**2*(k1+k2+k3))/(8*(cStDev**2)**2)
sol = {"cGamma": sol.x[0], "cDelta": sol.x[2], "cKsi": sol.x[1], "cLambda": sol.x[3], "cMean": cMean,"cStDev": cStDev,"cSkew": cSkew,"cKurt": cKurt}
sol = json.dumps(sol)
print(sol)
            `
            });
        } else if (distOption === 'normal') {
            const addCustomNormalCDF = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomNormalCDF": "N/A" };
                } else {
                    const customNormalCDF = `${((jStat.normal.cdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma, true)) * 100).toFixed(2)}%`
                    return { ...item, "CustomNormalCDF": customNormalCDF };
                }
            });

            const addCustomNormalPDF = addCustomNormalCDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomNormalPDF": "N/A" };
                } else {
                    const customNormalPDF = `${(jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma)).toFixed(2)}`
                    return { ...item, "CustomNormalPDF": customNormalPDF };
                }
            });

            const addLogCustomNormalPDF = addCustomNormalPDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "LogCustomNormalPDF": "N/A" };
                } else {
                    const logCustomNormalPDF = `${(Math.log(jStat.normal.pdf(parseFloat(item.RankedReturn) / 100, cMu / 100, cSigma))).toFixed(2)}`
                    return { ...item, "LogCustomNormalPDF": logCustomNormalPDF };
                }
            });
            let sum = 0;
            for (let i = 0; i < addLogCustomNormalPDF.length; i++) {
                if (addLogCustomNormalPDF[i].LogCustomNormalPDF != "N/A") {
                    sum += Number(addLogCustomNormalPDF[i].LogCustomNormalPDF);
                }
            }
            setCNormMLE(sum)
            dispatch({
                type: 'DATA',
                payload: addLogCustomNormalPDF
            });
            dispatch({
                type: 'CUSTOM',
                payload: { "cMean": state.custom.cMean, "cStDev": state.custom.cStDev, "cSkew": state.custom.cSkew, "cKurt": state.custom.cKurt, "cGamma": state.custom.cGamma, "cDelta": state.custom.cDelta, "cKsi": state.custom.cKsi, "cLambda": state.custom.cLambda, "cMLE": state.custom.cMLE, "cMu": cMu, "cSigma": cSigma, "cDf": state.custom.cDf, "cNormMLE": sum, "cStudtMLE": state.custom.cStudtMLE }
            });

            const CNileL = `${Number(jStat.normal.inv(1 - percentile / 100, cMu, cSigma * 100)).toFixed(2)}%`
            const CTileL = `${Number(jStat.studentt.inv(1 - percentile / 100, state.custom.cDf)).toFixed(2)}%`
            const CNileU = `${Number(jStat.normal.inv(percentile / 100, cMu, cSigma * 100)).toFixed(2)}%`
            const CTileU = `${Number(jStat.studentt.inv(percentile / 100, state.custom.cDf)).toFixed(2)}%`
            dispatch({
                type: 'STATS',
                payload: {
                    'CNileL': CNileL,
                    'CTileL': CTileL,
                    'CNileU': CNileU,
                    'CTileU': CTileU,
                }
            });
        } else if (distOption === 'studentt') {
            const addCustomStudentTCDF = state.data.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomStudentTCDF": "N/A" };
                } else {
                    const customStudentTCDF = `${((jStat.studentt.cdf(((parseFloat(item.RankedReturn) / 100) - state.stats.mean) / (state.stats.sStDev * Math.sqrt((cDf - 2) / cDf)), cDf)) * 100).toFixed(2)}%`
                    return { ...item, "CustomStudentTCDF": customStudentTCDF };
                }
            });

            const addCustomStudentTPDF = addCustomStudentTCDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "CustomStudentTPDF": "N/A" };
                } else {
                    const customStudentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - state.stats.mean) / (state.stats.sStDev), cDf)) * 100 / (100 * state.stats.sStDev)).toFixed(2)}`
                    // const customStudentTPDF = `${((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - state.stats.mean) / (state.stats.sStDev * Math.sqrt((cDf - 2) / cDf)), cDf)) * 100 / (100 * state.stats.sStDev)).toFixed(2)}`
                    return { ...item, "CustomStudentTPDF": customStudentTPDF };
                }
            });

            const addLogCustomStudentTPDF = addCustomStudentTPDF.map((item, index) => {
                if (index === 0) {
                    // First entry, no return calculation possible
                    return { ...item, "LogCustomStudentTPDF": "N/A" };
                } else {
                    const LogCustomStudentTPDF = `${(Math.log((jStat.studentt.pdf(((parseFloat(item.RankedReturn) / 100) - state.stats.mean) / (state.stats.sStDev), cDf)) * 100 / (100 * state.stats.sStDev))).toFixed(2)}`
                    return { ...item, "LogCustomStudentTPDF": LogCustomStudentTPDF };
                }
            });
            let sum = 0;
            for (let i = 0; i < addLogCustomStudentTPDF.length; i++) {
                if (addLogCustomStudentTPDF[i].LogCustomStudentTPDF != "N/A") {
                    sum += Number(addLogCustomStudentTPDF[i].LogCustomStudentTPDF);
                }
            }
            setCStudtMLE(sum)
            dispatch({
                type: 'DATA',
                payload: addLogCustomStudentTPDF
            });
            dispatch({
                type: 'CUSTOM',
                payload: { "cMean": state.custom.cMean, "cStDev": state.custom.cStDev, "cSkew": state.custom.cSkew, "cKurt": state.custom.cKurt, "cGamma": state.custom.cGamma, "cDelta": state.custom.cDelta, "cKsi": state.custom.cKsi, "cLambda": state.custom.cLambda, "cMLE": state.custom.cMLE, "cMu": state.custom.cMu, "cSigma": state.custom.cSigma, "cDf": cDf, "cNormMLE": state.custom.cNormMLE, "cStudtMLE": sum }
            });
            const CNileL = `${Number(jStat.normal.inv(1 - percentile / 100, state.custom.cMu, state.custom.cSigma * 100)).toFixed(2)}%`
            const CTileL = `${Number(jStat.studentt.inv(1 - percentile / 100, cDf)).toFixed(2)}%`
            const CNileU = `${Number(jStat.normal.inv(percentile / 100, state.custom.cMu, state.custom.cSigma * 100)).toFixed(2)}%`
            const CTileU = `${Number(jStat.studentt.inv(percentile / 100, cDf)).toFixed(2)}%`
            dispatch({
                type: 'STATS',
                payload: {
                    'CNileL': CNileL,
                    'CTileL': CTileL,
                    'CNileU': CNileU,
                    'CTileU': CTileU,
                }
            });
        } else if (distOption === 'johnsonsu') {
            const cMean = cKsi - cLambda * Math.exp((cDelta ** -2) / 2) * Math.sinh(cGamma / cDelta)
            const cStDev = Math.sqrt(cLambda ** 2 / 2 * (Math.exp(cDelta ** -2) - 1) * (Math.exp(cDelta ** -2) * Math.cosh(2 * cGamma / cDelta) + 1))
            const cSkew = -(cLambda ** 3 * Math.sqrt(Math.exp(cDelta ** -2)) * (Math.exp(cDelta ** -2) - 1) ** 2 * (Math.exp(cDelta ** -2) * (Math.exp(cDelta ** -2) + 2) * Math.sinh(3 * cGamma / cDelta) + 3 * Math.sinh(2 * cGamma / cDelta))) / (4 * (cStDev ** 2) ** 1.5)
            const k1 = (Math.exp(cDelta ** -2)) ** 2 * ((Math.exp(cDelta ** -2)) ** 4 + 2 * (Math.exp(cDelta ** -2)) ** 3 + 3 * (Math.exp(cDelta ** -2)) ** 2 - 3) * Math.cosh(4 * cGamma / cDelta)
            const k2 = 4 * (Math.exp(cDelta ** -2)) ** 2 * ((Math.exp(cDelta ** -2)) + 2) * Math.cosh(3 * cGamma / cDelta)
            const k3 = 3 * (2 * (Math.exp(cDelta ** -2)) + 1)
            const cKurt = (cLambda ** 4 * (Math.exp(cDelta ** -2) - 1) ** 2 * (k1 + k2 + k3)) / (8 * (cStDev ** 2) ** 2)
            const data = { cMean: cMean, cStDev: cStDev, cSkew: cSkew, cKurt: cKurt, cGamma: cGamma, cKsi: cKsi, cDelta: cDelta, cLambda: cLambda }
            customData(data)
        }
    }

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
            setCStDev(state.custom.cStDev * 100)
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
            <h1 style={{ margin: '0px', textAlign: 'center' }}>Parametric Value at Risk (PVaR)</h1>
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
                                                    <button onClick={loadTableau}>Load Data</button>
                                                </div>
                                            </div>
                                            : null
                    }
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto',
                        paddingLeft: '10px',
                        paddingTop: '7px'
                    }}>
                        <div>
                            <h4 style={{ margin: '5px 0px', }}>Risk Factor:</h4>
                        </div>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto',
                        paddingLeft: '10px',
                        paddingTop: '10px'
                    }}>
                        <div>
                            <input value={riskFactor} onChange={(value) => handleRiskFactorChange(value)} style={{ width: '90px', height: '20px', border: '0', padding: '0' }} />
                        </div>
                    </div>
                </div>
            </div>
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
                                <div style={gridItem}>{`${(state.stats.mean * 100).toFixed(2)}%`}</div>
                                <div style={gridItem}>StDev</div>
                                <div style={gridItem}>{`${(state.stats.sStDev * 100).toFixed(2)}%`}</div>
                                <div style={gridItem}>Skew</div>
                                <div style={gridItem}>{(state.stats.sSkew).toFixed(2)}</div>
                                <div style={gridItem}>ExKurt</div>
                                <div style={gridItem}>{(state.stats.sKurt).toFixed(2)}</div>
                                <div style={gridItem}><b className="tooltip">&#9432; <span className="tooltiptext">Computed using Method of Moments around the ExKurt (4th Moment/2nd moment squared)</span></b>TDist DoF

                                </div>
                                <div style={gridItem}>{(state.stats.df).toFixed(2)}</div>
                            </div>
                        </div>
                        <div>
                            <h1 style={{ color: 'rgba(227, 192, 192, 1)' }}>Johnson SU MLE</h1>
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
                                <div style={gridItem}>MLE</div>
                                <div style={gridItem}>{state.stats.mle ? (state.stats.mle).toFixed(2) : 'Loading...'}</div>
                            </div>
                        </div>
                        <div>
                            <div style={{
                                width: '390px',
                                display: 'grid',
                                gridTemplateColumns: '240px 150px',
                            }}>
                                <h1 style={{ marginBottom: '0px', color: 'rgba(192, 227, 192, 1)', }}>Custom Distribution</h1>
                                <div style={{
                                    margin: 'auto auto 7px 0px',
                                    padding: '0 20px',
                                }}>
                                    <select value={distOption} onChange={handleDistChange} style={{
                                        backgroundColor: 'rgba(192, 227, 192, 1)',
                                        width: '130px',
                                    }}>
                                        <option value="custom">Custom</option>
                                        <option value="normal">Normal</option>
                                        <option value="studentt">StudentT</option>
                                        <option value="johnsonsu">JohnsonSU</option>
                                    </select>
                                </div>
                            </div>
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
                                {distOption === 'custom' && (
                                    <>
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

                                        <div style={gridItem}>MLE</div>
                                        <div style={gridItem}>{(cMLE).toFixed(2)}</div>
                                        <button onClick={customSolve}>Optimise/Solve</button>
                                        <button onClick={undo}>Undo</button>
                                    </>
                                )}
                                {distOption === 'normal' && (
                                    <>
                                        <div > .</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div style={gridItem}>Mu</div>
                                        <div style={gridItem}>{(cMu).toFixed(2)}%</div>
                                        <div style={gridItem}>
                                            <input type="range" min={-2} max={2} value={cMu} step={0.1} onChange={(value) => handleCMuChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>Sigma</div>
                                        <div style={gridItem}>{(cSigma * 100).toFixed(2)}%</div>
                                        <div style={gridItem}>
                                            <input type="range" min={0} max={5} value={cSigma * 100} step={0.1} onChange={(value) => handleCSigmaChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>MLE</div>
                                        <div style={gridItem}>{(cNormMLE).toFixed(2)}</div>
                                        <button onClick={customSolve}>Optimise/Solve</button>
                                        <div />
                                    </>
                                )}
                                {distOption === 'studentt' && (
                                    <>
                                        <div > .</div>
                                        <div />
                                        <div />
                                        <div />
                                        <div style={gridItem2}>Mu</div>
                                        <div style={gridItem2}>{(state.stats.mean * 100).toFixed(2)}%</div>
                                        <div />
                                        <div />
                                        <div style={gridItem2}>Gamma</div>
                                        <div style={gridItem2}>{(state.stats.sStDev * 100).toFixed(2)}%</div>
                                        <div />
                                        <div />
                                        <div style={gridItem}>DoF</div>
                                        <div style={gridItem}>{(cDf).toFixed(2)}</div>
                                        <div style={gridItem}>
                                            <input type="range" min={2} max={8} value={cDf} step={0.1} onChange={(value) => handleCDfChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>MLE</div>
                                        {/* <div style={gridItem}>{(cStudtMLE).toFixed(2)}</div> */}
                                        <div style={gridItem}>N/A <b className="tooltip">&#9432; <span className="tooltiptext">Unlike the other distributions, no analytical expressions are available for the maximum log-likelihood estimates of ν (shape (DoF)) , µ (location), γ (scale)</span></b></div>
                                        <button onClick={customSolve}>Optimise/Solve</button>
                                        <div />
                                    </>
                                )}
                                {distOption === 'johnsonsu' && (
                                    <>
                                        <div />
                                        <button onClick={reset}>Reset</button>
                                        <div />
                                        <div />
                                        <div style={gridItem}>Gamma</div>
                                        <div style={gridItem}>{(cGamma).toFixed(4)}</div>
                                        <div style={gridItem}>
                                            <input type="range" min={-2} max={2} value={cGamma} step={0.1} onChange={(value) => handleCGammaChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>Ksi</div>
                                        <div style={gridItem}>{(cKsi).toFixed(4)}</div>
                                        <div style={gridItem}>
                                            <input type="range" min={-0.05} max={0.05} value={cKsi} step={0.002} onChange={(value) => handleCKsiChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>Delta</div>
                                        <div style={gridItem}>{(cDelta).toFixed(4)}</div>
                                        <div style={gridItem}>
                                            <input type="range" min={0} max={10} value={cDelta} step={0.1} onChange={(value) => handleCDeltaChange(value)} />
                                        </div>
                                        <div />
                                        <div style={gridItem}>Lambda</div>
                                        <div style={gridItem}>{(cLambda).toFixed(4)}</div>
                                        <div style={gridItem}>
                                            <input type="range" min={0} max={0.1} value={cLambda} step={0.002} onChange={(value) => handleCLambdaChange(value)} />
                                        </div>
                                        <div />

                                        <div style={gridItem}>MLE</div>
                                        <div style={gridItem}>{(cMLE).toFixed(2)}</div>
                                        <button onClick={customSolve}>Optimise/Solve</button>
                                        <div />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {state.stats.mean && (
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
                                <div style={gridItem}>{distOption === 'custom' ? state.stats.CileL : distOption === 'johnsonsu' ? state.stats.CileL : distOption === 'normal' ? state.stats.CNileL : state.stats.CTileL}</div>
                                <div style={gridItem}>Upper %ile</div>
                                <div style={gridItem}>{state.stats.EileU}</div>
                                <div style={gridItem}>{state.stats.NileU}</div>
                                <div style={gridItem}>{state.stats.TileU}</div>
                                <div style={gridItem}>{state.stats.JileU}</div>
                                <div style={gridItem}>{distOption === 'custom' ? state.stats.CileU : distOption === 'johnsonsu' ? state.stats.CileU : distOption === 'normal' ? state.stats.CNileU : state.stats.CTileU}</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h1>CDFs</h1>
                        <div style={{
                            width: '390px',
                            display: 'grid',
                            gridTemplateColumns: '130px 250px',
                        }}>
                            <h2>K-S Tests <b className="tooltip">&#9432; <span className="tooltiptext">Kolmogorov–Smirnov (K-S) test: How likely is it that we would see a collection of samples like this if they were drawn from that probability distribution? A P-value of less than 5% indicates there is significant evidence to reject the null hypothesis that the samples could have been drawn from that probability distribution</span></b></h2>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto',
                                paddingLeft: '10px',
                                paddingTop: '10px',
                                // }}><div><button onClick={runBatFile}>Upload Data</button></div></div>
                            }}><div><h5>Test Range: {minX}% to {maxX}%</h5></div></div>
                        </div>
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
                            <div style={gridItem}>KS Stat*&#8730;n</div>
                            <div style={gridItem}>N/A</div>
                            <div style={gridItem}>{state.ks.nks ? state.ks.nks : 'Loading...'}</div>
                            <div style={gridItem}>{state.ks.tks ? state.ks.tks : 'Loading...'}</div>
                            <div style={gridItem}>{state.ks.jks ? state.ks.jks : 'Loading...'}</div>
                            <div style={gridItem}>{!state.ks.cks ? 'Loading...' : distOption === 'custom' ? state.ks.cks : distOption === 'johnsonsu' ? state.ks.cks : distOption === 'normal' ? state.ks.cnks : state.ks.ctks}</div>
                            <div style={gridItem}>P-value</div>
                            <div style={gridItem}>N/A</div>
                            <div style={gridItem}>{state.ks.npv ? state.ks.npv + '%' : 'Loading...'}</div>
                            <div style={gridItem}>{state.ks.tpv ? state.ks.tpv + '%' : 'Loading...'}</div>
                            <div style={gridItem}>{state.ks.jpv ? state.ks.jpv + '%' : 'Loading...'}</div>
                            <div style={gridItem}>{!state.ks.cpv ? 'Loading...' : distOption === 'custom' ? state.ks.cpv + '%' : distOption === 'johnsonsu' ? state.ks.cpv + '%' : distOption === 'normal' ? state.ks.cnpv + '%' : state.ks.ctpv + '%'}</div>
                        </div>
                    </div>
                    <div style={{ width: '45vw', height: '50vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartPDF}></canvas> : `Loading...`}</div>
                    <div style={{ width: '45vw', height: '50vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartCDF}></canvas> : `Loading...`}</div>
                    <div>
                        <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MinX: {minX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={minX} step={0.2} onMouseUp={(value) => handleMinXMouseUp(value)} onChange={(value) => handleMinXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                        <label style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', textAlign: 'right', width: '360px', lineHeight: '26px', marginBottom: '10px' }}>MaxX: {maxX}% <input type="range" min={state.ranges.minXData} max={state.ranges.maxXData} value={maxX} step={0.2} onMouseUp={(value) => handleMaxXMouseUp(value)} onChange={(value) => handleMaxXChange(value)} style={{ height: '20px', flex: '0 0 200px', marginLeft: '10px' }} /></label>
                    </div>
                    <div></div>
                    <div>
                        <h1 style={{ margin: '5px 0px', }}>ACF Resids <b className="tooltip">&#9432; <span className="tooltiptext">AutoCorrelation Tests: Check if past observations influence your current observations. If so, this violates the Gauss-Markov theorem and therefore your sample estimators are inherently biased. Thus using PVaR is not appropriate (See FHS tab for alternative)</span></b></h1>
                        <p style={{ margin: '0px', }}><b>Box-Pierce:</b> Q stat: {state.acf.acfQStat.toFixed(2)} p-value: {(state.acf.acfPVal * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                        <h1 style={{ margin: '5px 0px', }}>ARCH Resid^2 <b className="tooltip">&#9432; <span className="tooltiptext">AutoRegressive Conditional Heteroskedasticity (ARCH) Test: Check if the variance of the residuals (error terms) are constant. If not then the standard error of the sample estimators might be high which can lead to failing to reject the null hypothesis when it is false (type 2 error). Thus using PVaR is not appropriate (See FHS tab for alternative)</span></b></h1>
                        <p style={{ margin: '0px', }}><b>Box-Pierce:</b> Q stat: {state.acf.archQStat.toFixed(2)} p-value: {(state.acf.archPVal * 100).toFixed(2)}%</p>
                    </div>
                    <div style={{ width: '45vw', height: '30vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartACF}></canvas> : `Loading...`}</div>
                    <div style={{ width: '45vw', height: '30vh', fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{state.data.some(obj => obj.hasOwnProperty('JohnsonSUPDF')) ? <canvas ref={chartARCH}></canvas> : `Loading...`}</div>
                </div>
            )}

            {state.data.length != 0 && (
                <div style={{
                    padding: '10px'
                }}>
                    <div style={{ width: '430px' }}>
                        <div style={{
                            width: '390px',
                            display: 'grid',
                            gridTemplateColumns: '250px 150px 150px',
                        }}>
                            <h1 style={{ margin: '5px', }}>View Custom Output</h1>
                            <div style={{
                                margin: 'auto auto 12px 0px',
                                padding: '0 20px',
                            }}>
                                <select value={uploadOption} onChange={handleUploadChange} style={{
                                    backgroundColor: 'rgba(192, 227, 227, 1)',
                                    width: '130px',
                                }}>
                                    <option value="csv">CSV</option>
                                    <option value="tableau">Tableau Server</option>
                                    <option value="sql">SQL</option>
                                </select>
                            </div>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'auto',
                                paddingLeft: '10px',
                                paddingTop: '10px',
                                // }}><div><button onClick={runBatFile}>Upload Data</button></div></div>
                            }}><div><button onClick={handleDownload}>Upload Data</button></div></div>
                        </div>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '70px minmax(auto, 800px) 8px',
                        }}>
                            <div>
                                Local:
                            </div>
                            <div style={{ maxWidth: '830px' }}>
                                <input value={localLoc} onChange={(value) => handleLocalLocChange(value)} style={{ width: '100%', maxWidth: '830px' }}></input>
                            </div>
                            <div />
                        </div>
                        {uploadOption === 'tableau' &&
                            <div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '70px minmax(auto, 800px) 8px',
                                }}>
                                    <div>
                                        Host:
                                    </div>
                                    <div style={{ maxWidth: '830px' }}>
                                        <input value={host} onChange={(value) => handleHostChange(value)} style={{ width: '100%', maxWidth: '830px' }}></input>
                                    </div>
                                    <div />
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '70px minmax(auto, 800px) 8px',
                                }}>
                                    <div>
                                        Remote:
                                    </div>
                                    <div style={{ maxWidth: '830px' }}>
                                        <input value={sshLoc} onChange={(value) => handleSshLocChange(value)} style={{ width: '100%', maxWidth: '830px' }}></input>
                                    </div>
                                    <div />
                                </div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '70px minmax(auto, 122px) 20px 60px minmax(auto, 150px)',
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
                            </div>
                        }
                        <table style={{ border: '1px solid black', borderCollapse: 'collapse', width: 'auto' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#1c478a', color: 'white', fontWeight: 'bold' }}>
                                    <th style={{ border: '1px solid black', padding: '0px 29px' }}>Date</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>Risk Factor</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>Tenor</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>Quote Type</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>Return Period</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>VaR Model</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>Look-back</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>VaR</th>
                                    <th style={{ border: '1px solid black', padding: '0px 8px' }}>FTM <b className="tooltip">&#9432; <span className="tooltiptext">Fat Tail Multiplier (FTM): take the custom percentile and divide it by the custom standard deviation (assumes the mean is 0)</span></b></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={rowStyles}>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={date} onChange={(value) => handleDateChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={riskFactor} onChange={(value) => handleRiskFactorChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={tenor} onChange={(value) => handleTenorChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={quoteType} onChange={(value) => handleQuoteTypeChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={returnPeriod} onChange={(value) => handleReturnPeriodChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={varModel} onChange={(value) => handleVarModelChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}><input value={lookback} onChange={(value) => handleLookbackChange(value)} style={{ width: '70px', height: '20px', border: '0', padding: '0' }} /></td>
                                    <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{valAtRisk}</td>
                                    {/* replace next line code with custom FTM */}
                                    <td style={{ border: '1px solid black', padding: '0px 19px', color: 'black' }}>{fatTailMult}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h1>View Input Data</h1>
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
                                        <th style={{ border: '1px solid black', padding: '0px 29px' }}>Date</th>
                                        <th style={{ border: '1px solid black', padding: '0px 8px' }}>Price</th>
                                        <th style={{ border: '1px solid black', padding: '0px 8px' }}>Return</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.data.map((item, index) => (
                                        <tr key={index} style={index % 2 === 0 ? rowStyles : altRowStyles}>
                                            <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.Date}</td>
                                            <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.Price}</td>
                                            {1 === 1 && <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black', width: '80px' }}>{item.Return1D}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div />
                            <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1c478a', color: 'white', fontWeight: 'bold' }}>
                                        <th style={{ border: '1px solid black', padding: '0px 8px' }}>Rank</th>
                                        <th style={{ border: '1px solid black', padding: '0px 8px' }}>Returns Ranked</th>
                                        <th style={{ border: '1px solid black', padding: '0px 8px' }}>Empirical CDF</th>
                                        {state.isHidden[1] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Normal CDF</th>}
                                        {state.isHidden[2] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Student T CDF</th>}
                                        {state.isHidden[3] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Johnson SU CDF</th>}
                                        {state.isHidden[4] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Custom CDF</th>}
                                        {state.isHidden[1] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Normal PDF</th>}
                                        {state.isHidden[2] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Student T PDF</th>}
                                        {state.isHidden[3] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Johnson SU PDF</th>}
                                        {state.isHidden[3] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>LogJohnson SU PDF</th>}
                                        {state.isHidden[4] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>Custom PDF</th>}
                                        {state.isHidden[4] ? null : <th style={{ border: '1px solid black', padding: '0px 8px' }}>LogCustom PDF</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.data.map((item, index) => (
                                        <tr key={index} style={index % 2 === 0 ? rowStyles : altRowStyles}>
                                            {1 === 1 && <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.Rank1D}</td>}
                                            {0 === 1 && <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.Return2D}</td>}
                                            {0 === 1 && <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.Rank2D}</td>}
                                            <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.RankedReturn}</td>
                                            <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.EmpiricalCDF}</td>
                                            {state.isHidden[1] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.NormalCDF}</td>}
                                            {state.isHidden[2] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.StudentTCDF}</td>}
                                            {state.isHidden[3] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.JohnsonSUCDF}</td>}
                                            {state.isHidden[4] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.CustomCDF}</td>}
                                            {state.isHidden[1] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.NormalPDF}</td>}
                                            {state.isHidden[2] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.StudentTPDF}</td>}
                                            {state.isHidden[3] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.JohnsonSUPDF}</td>}
                                            {state.isHidden[3] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.LogJohnsonSUPDF}</td>}
                                            {state.isHidden[4] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{item.CustomPDF}</td>}
                                            {state.isHidden[4] ? null : <td style={{ border: '1px solid black', padding: '0px 8px', color: 'black' }}>{distOption === 'custom' ? item.LogCustomPDF : distOption === 'johnsonsu' ? item.LogCustomPDF : distOption === 'normal' ? item.LogCustomNormalPDF : item.LogCustomStudentTPDF}</td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default PVaR;