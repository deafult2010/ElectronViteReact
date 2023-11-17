import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/index.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  //useEffect will run twice in stict mode
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
)
