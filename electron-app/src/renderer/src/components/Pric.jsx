import React, { useState } from 'react';

const Price = () => {
    const [selectedOption, setSelectedOption] = useState('');

    const handleSelectChange = (e) => {
        setSelectedOption(e.target.value);
    };

    return (
        <div style={{
            padding: '0 20px',
        }}>
            <select value={selectedOption} onChange={handleSelectChange} style={{
                backgroundColor: 'rgba(211, 232, 232, 1)',
            }}>
                <option value="" style={{}}>--Select an option--</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
            </select>
        </div>
    );
};

export default Price;

