import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Gallery from './pages/Gallery';
import './index.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Gallery />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

export default App;
