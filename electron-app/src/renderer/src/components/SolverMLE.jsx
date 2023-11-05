import React, { useState, useEffect } from "react";
import ReturnsData from "../assets/Returns.json";

const SolverMLE = () => {

    const [sum, setSum] = useState(0);

    // Function to calculate multiplied returns
    const calculateMultipliedReturns = () => {
        // Multiply each element by 2
        const multipliedReturns = ReturnsData.map((item) => {
            return {
                Ranked_Return: item.Ranked_Return
                // Ranked_Return: item.Ranked_Return * 2
            };
        });

        return multipliedReturns;
    };

    // Get the multiplied returns
    const multipliedReturns = calculateMultipliedReturns();

    // Function to calculate the sum of all elements in the JSON object
    const calculateSum = () => {
        let totalSum = 0;

        // Loop through the values of the JSON object and add them to the sum
        Object.values(multipliedReturns).forEach((item) => {
            totalSum += item.Ranked_Return;
        });
        console.log(totalSum)
        setSum(totalSum); // Update the sum state with the calculated sum
    };

    useEffect(() => {
        calculateSum();
    }, []);

    return (
        // <div>
        //     <h1>Multiplied Returns:</h1>
        //     <pre>{JSON.stringify(multipliedReturns, null, 2)}</pre>
        // </div>
        <div>
            {/* Display the calculated sum */}
            <p>Sum of elements: {sum}</p>
        </div>
    );
};

export default SolverMLE;
