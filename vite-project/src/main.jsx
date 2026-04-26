import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css'
// import Ali from './App.jsx'
import { App } from "./App.jsx"
// import { Apps } from "./App.jsx"
// import { Apps as Component } from "./App.jsx"

createRoot(document.getElementById('root')).render(
    <App />
)
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     {/* <Ali /> */}
//     <App />
//     {/* <Component /> */}
//     {/* <Apps /> */}
//   </StrictMode>
// )