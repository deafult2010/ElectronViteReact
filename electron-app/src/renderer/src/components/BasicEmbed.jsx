import React, { useRef, useEffect } from 'react'

const { tableau } = window;

function BasicEmbed() {
    const ref = useRef(null);
    const url = 'https://public.tableau.com/views/SuperstoreOverviewDashboard_16978089170500/SuperstoreOverviewDashboard'

    const initViz = () => {
        let viz = window.tableau.VizManager.getVizs()[0];

        if (viz) {

            viz.dispose();

        }
        viz = new tableau.Viz(ref.current, url, {
            width: '100%',
            hegith: '670',
        })
    }

    useEffect(initViz, [])
    console.log(ref.current)
    return (
        <div ref={ref} />
    )
}

export default BasicEmbed