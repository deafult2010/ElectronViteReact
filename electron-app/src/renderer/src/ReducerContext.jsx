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
    percentile: 99,
    isHidden: [false, true, true, true, true],
    isHiddenP: false,
    custom: { cMean: 0, cStDev: 1, cSkew: 0, cKurt: 3, cGamma: 0, cKsi: 0, cDelta: 5.521765, cLambda: 0.054318, cMLE: 0, cMu: 0, cSigma: 1, cDf: 30 },
    jsu: ``,
    resultjsu: ``,
    fix: [false, false, false, false]
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
            if (Object.keys(action.payload)[0] === 'mean') {
                return {
                    ...state,
                    stats: action.payload
                };
            } else if (Object.keys(action.payload)[0] === 'NileL') {
                //destructing
                const { NileL, EileL, TileL, NileU, EileU, TileU } = action.payload
                return {
                    ...state,
                    stats: {
                        ...state.stats,
                        NileL, EileL, TileL, NileU, EileU, TileU,
                        JileL: `Loading...`,
                        JileU: `Loading...`,
                        CileL: `Loading...`,
                        CileU: `Loading...`,
                    }
                };
            } else if (Object.keys(action.payload)[0] === 'gamma') {
                return {
                    ...state,
                    stats: {
                        ...state.stats,
                        gamma: action.payload.gamma,
                        ksi: action.payload.ksi,
                        delta: action.payload.delta,
                        lambda: action.payload.lambda,
                        mle: action.payload.mle,
                    }
                };
            } else
                return {
                    ...state,
                };
        case 'JILE':
            return {
                ...state,
                stats: {
                    ...state.stats,
                    JileL: action.payload.JileL,
                    JileU: action.payload.JileU,
                    CileL: action.payload.CileL,
                    CileU: action.payload.CileU
                }
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
        case 'ISHIDDENP':
            return {
                ...state,
                isHiddenP: action.payload
            };
        case 'CUSTOM':
            return {
                ...state,
                custom: action.payload
            };
        case 'JSU':
            return {
                ...state,
                jsu: action.payload
            };
        case 'RESULTJSU':
            return {
                ...state,
                resultjsu: action.payload
            };
        case 'FIX':
            return {
                ...state,
                fix: action.payload
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