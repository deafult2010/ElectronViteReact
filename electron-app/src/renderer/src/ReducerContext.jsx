// ReducerContext.js

import React, { createContext, useReducer } from 'react';

// Create the initial state
const initialState = {
    text: ``,
    result: '',
    text2: ``,
    data: [],
    stats: {},
    ranges: {},
    numBins: 100,
    percentile: 1,
    isHidden: [false, true, true, true, true],
    cMean: 0,
    cStDev: 1,
    cSkew: 0,
    cKurt: 0
};

// Create the reducer function
const reducer = (state, action) => {
    switch (action.type) {
        // case 'INCREMENT':
        //     return { count: state.count + 1 };
        // case 'DECREMENT':
        //     return { count: state.count - 1 };
        case 'TEXT':
            return {
                ...state,
                text2: state.text === `print('Terminal Cleared')` ? `print('Hello World')` : state.text,
                text: action.payload
            };
        case 'RESULT':
            return {
                ...state,
                result: action.payload
            };
        case 'DATA':
            return {
                ...state,
                data: action.payload
            };
        case 'STATS':
            return {
                ...state,
                stats: action.payload
            };
        case 'RANGES':
            return {
                ...state,
                ranges: action.payload
            };
        case 'BINS':
            return {
                ...state,
                numBins: action.payload
            };
        case 'PERCENTILE':
            return {
                ...state,
                percentile: action.payload
            };
        case 'ISHIDDEN':
            return {
                ...state,
                isHidden: action.payload
            };
        case 'CMEAN':
            return {
                ...state,
                cMean: action.payload
            };
        case 'CSTDEV':
            return {
                ...state,
                cStDev: action.payload
            };
        case 'CSKEW':
            return {
                ...state,
                cSkew: action.payload
            };
        case 'CKURT':
            return {
                ...state,
                cKurt: action.payload
            };
        default:
            return state;
    }
};

// Create the context
export const ReducerContext = createContext();

// Create the context provider component
export const ReducerContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <ReducerContext.Provider value={{ state, dispatch }}>
            {children}
        </ReducerContext.Provider>
    );
};

export default ReducerContextProvider