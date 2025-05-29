import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import IPThreats from './components/IPThreats';
import DomainThreats from './components/DomainThreats';
import URLThreats from './components/URLThreats';
import HashThreats from './components/HashThreats';
import EmailThreats from './components/EmailThreats';
import RegkeyThreats from './components/RegkeyThreats';
import Register from './components/Register';
import AttributeDetail from './components/AttributeDetail';


function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp > currentTime) {
        setUser({ token });
      } else {
        localStorage.removeItem('token'); // Token expired
      }
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem('token');
    }
  }
  setCheckingAuth(false);
}, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/ip-threats" element={user ? <IPThreats user={user} /> : <Navigate to="/login" />} />
        <Route path="/domain-threats" element={user ? <DomainThreats user={user} /> : <Navigate to="/login" />} />
        <Route path="/url-threats" element={user ? <URLThreats user={user} /> : <Navigate to="/login" />} />
        <Route path="/hash-threats" element={user ? <HashThreats user={user} /> : <Navigate to="/login" />} />
        <Route path="/email-threats" element={user ? <EmailThreats user={user} /> : <Navigate to="/login" />} />
        <Route path="/regkey-threats" element={user ? <RegkeyThreats user={user} /> : <Navigate to="/login" />} />
        <Route
          path="/attribute-detail/:value"
          element={user ? <AttributeDetail /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
export default App;
