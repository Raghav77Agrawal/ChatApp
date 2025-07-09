import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AuthPage from "./AuthPage";
import ChatPage from "./ChatPage";

function App() {
  //storing user to save user state.
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        
        <Route
          path="/"
          element={!user ? <AuthPage setUser={setUser} /> : <Navigate to="/chat" />}
        />
        <Route
          path="/chat"
          element={user ? <ChatPage user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;