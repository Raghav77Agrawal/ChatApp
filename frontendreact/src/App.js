import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from './AuthPage';
import ChatPage from "./ChatPage"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      
      try {
        const res = await fetch("http://localhost:5000/m/auth", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication check failed", error);
        setIsAuthenticated(false);
      }
    }

    checkAuth();
  }, []);
  return (
    <>
    
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <AuthPage />} />
        <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
    
   </>
  
  );
}

export default App;
