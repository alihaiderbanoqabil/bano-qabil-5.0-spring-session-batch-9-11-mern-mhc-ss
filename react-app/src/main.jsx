import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './store/index.js'

// import 'bootstrap/dist/css/bootstrap.min.css';
// const container = document.getElementById('root')
// if (container) {
//   const root = createRoot(container)

//   root.render(
//     <Provider store={store}>
//       <App />
//     </Provider>,
//   )
// } else {
//   throw new Error(
//     "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file.",
//   )
// }
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
