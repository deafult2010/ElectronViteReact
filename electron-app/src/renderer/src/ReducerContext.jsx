// ReducerContext.js

import React, { createContext, useReducer } from 'react';

// Create the initial state
const initialState = {
    text: ``,
    result: '',
    text2: ``
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