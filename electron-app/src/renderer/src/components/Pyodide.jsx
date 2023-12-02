import React, { useEffect, useContext, useMemo } from "react";
import { ReducerContext } from '../ReducerContext';
import worker from '../worker.js';
import WebWorker from '../WebWorker';

// no longer passing down runWorker as props. Instead using useContext hook
// const WorkerComponent = ({ runWorker }) => {
const Pyodide = () => {

    const { state, dispatch } = useContext(ReducerContext);

    // Create a new worker
    const webWorker = useMemo(() => new WebWorker(worker), [])

    useEffect(() => {
        dispatch({
            type: 'TEXT',
            payload: `
from scipy.stats import johnsonsu
print('loaded johnsonsu')
            `
        });
    }, [])


    //XTerm Logic:
    useEffect(() => {
        webWorker.postMessage(state.text)
        return () => {
        };
    }, [state.text]);

    useEffect(() => {
        webWorker.addEventListener('message', (event) => {
            const result = event.data;
            console.log(result)

            dispatch({
                type: 'RESULT',
                payload: result
            });
        });

        //Clean up the worker when the component is unmounted
        return () => {
            webWorker.terminate()
        };
    }, []);
};

export default Pyodide;