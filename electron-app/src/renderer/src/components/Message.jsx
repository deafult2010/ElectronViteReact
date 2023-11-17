import React, { useEffect, useContext } from "react";
import { ReducerContext } from '../ReducerContext';

// no longer passing down runWorker as props. Instead using useContext hook
// const WorkerComponent = ({ runWorker }) => {
const WorkerComponent = () => {

    // const { runWorker } = useContext(PyodideContext)

    // useEffect(() => {
    //     const button = document.getElementById('runWorker');
    //     button.addEventListener('click', runWorker);

    //     //Clean up the worker when the component is unmounted
    //     return () => {
    //     };
    // }, [runWorker]);

    // return <div>Worker Component <button id="runWorker">Run</button></div>;
};

export default WorkerComponent;