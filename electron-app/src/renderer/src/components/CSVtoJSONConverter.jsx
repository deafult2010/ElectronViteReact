import React, { useState } from "react";
import Papa from "papaparse";

const CSVtoJSONConverter = () => {
    const [csvFile, setCSVFile] = useState(null);
    const [jsonData, setJsonData] = useState(null);

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
                const jsonData = data.slice(1, data.length - 1).map((row) =>
                    headers.reduce(
                        (obj, header, index) => ({ ...obj, [header]: row[index] }),
                        {}
                    )
                );
                setJsonData(jsonData);
            },
        });
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={convertCSVtoJSON}>Convert</button>
            {jsonData && (
                <pre>{JSON.stringify(jsonData, null, 2)}</pre>
            )}
        </div>
    );
};

export default CSVtoJSONConverter;