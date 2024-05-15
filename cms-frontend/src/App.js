import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Add from "./components/Add";
import View from "./components/View";
import Update from "./components/Update";
import Delete from "./components/Delete";

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark justify-content-center">
        <a className="navbar-brand" href="/">
          Add Entity
        </a>
        <a className="navbar-brand ml-5" href="/view">
          View Entity
        </a>
        <a className="navbar-brand ml-5" href="/update">
          Update Entity
        </a>
        <a className="navbar-brand ml-5" href="/delete">
          Delete Entity
        </a>
      </nav>
      <Routes>
        <Route path="/" element={<Add />} />
        <Route path="/view" element={<View />} />
        <Route path="/update" element={<Update />} />
        <Route path="/delete" element={<Delete />} />
      </Routes>
    </Router>
  );
}

export default App;
