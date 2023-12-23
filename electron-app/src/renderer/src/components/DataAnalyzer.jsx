import React from 'react';
import kstest from '@stdlib/stats-kstest';

const DataAnalyzer = () => {


    const JSONData = [{ r: 0.08 }, { r: 0.07 }, { r: 0.09 }, { r: 0.05 }];

    const data = JSONData.map(obj => obj.r)
    console.log(data)
    // Call ksTest function to compute KS statistic and p-value
    const result = kstest(JSONData.map(obj => obj.r), 'uniform', 0.0, 1.0);

    return (
        <div>
            <p>KS Statistic: {result.statistic}</p>
            <p>p-Value: {result.pValue}</p>
        </div>
    );
}

export default DataAnalyzer;

// Python equiv:

// import json
// from scipy.stats import kstest

// # JSON data
// data = '[{"r": 0.08},{"r":0.07},{"r": 0.09},{"r":0.05}]'

// # Parse JSON data
// json_data = json.loads(data)

// # Extract 'r' values
// r_values = [d['r'] for d in json_data]

// # Compute KS statistic
// ks_statistic, p_value = kstest(r_values, 'uniform')

// print("KS Statistic:", ks_statistic)
// print("P-value:", p_value)