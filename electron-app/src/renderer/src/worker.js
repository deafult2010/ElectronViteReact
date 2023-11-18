//could use redux to have this at app level such that you do not have to wait for initial load.

export default () => {
    self.importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js");
    async function loadPyodideAndPackages() {
        self.pyodide = await loadPyodide({
            stdout: (s) => { postMessage(s) }
        });
        await self.pyodide.loadPackage(["sympy", "scipy"]);
        // await self.pyodide.loadPackage(["numpy", "pytz"]);
    }

    let pyodideReadyPromise = loadPyodideAndPackages();
    self.onmessage = async (e) => {
        await pyodideReadyPromise
        // console.log(e.data)
        self.pyodide.runPython(e.data);
    }
}