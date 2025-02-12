import {Route, BrowserRouter as Router, Routes} from "react-router-dom";

import BTreeVisualizer from "./pages/b-tree/b-tree-visualizer.jsx";
import RedBlackTreeVisualizer from "./pages/red-black-tree/red-black-tree-visializer.jsx";
import AvlTreeVisualizer from "./pages/avl-tree/avl-tree-visualizer.jsx";


import Home from "./pages/home.jsx";

import NavMenu from "./components/nav-menu.jsx";

import './App.css'
import HeapVisualizer from "./pages/heap/heap-visualizer.jsx";
import SplayTreeVisualizer from "./pages/splay-tree/splay-tree-visializer.jsx";

function App() {
  return (
    <Router>
      <div>
        <NavMenu />

        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/b-tree" element={<BTreeVisualizer />} />
            <Route path="/red-black-tree" element={<RedBlackTreeVisualizer />} />
            <Route path="/avl-tree" element={<AvlTreeVisualizer />} />
            <Route path="/heap" element={<HeapVisualizer />} />
            <Route path="/splay-tree" element={<SplayTreeVisualizer />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
