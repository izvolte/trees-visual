import {Route, BrowserRouter as Router, Routes} from "react-router-dom";

import BTreeVisualizer from "./pages/b-tree/b-tree-visualizer.jsx";
import Home from "./pages/home.jsx";

import NavMenu from "./components/nav-menu.jsx";

import './App.css'

function App() {
  return (
    <Router>
      <div>
        <NavMenu />

        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/b-tree" element={<BTreeVisualizer />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
