import {  useState } from "react";

import {useNavigate} from "react-router-dom";
function AuthPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    async function handlelogin(){
        try {
            const response = await fetch("http://localhost:5000/m/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials:"include",
              body: JSON.stringify({ email, password }),
            });
      
            const data = await response.json();
            if (response.ok) {
              console.log("Login successful:", data);
              alert("Login Successful!");
              window.location.reload();
              navigate('/chat');
            } else {
              console.error("Login failed:", data);
              alert(data.message || "Login failed");
            }
          } catch (error) {
            console.error("Error during login:", error);
          }
    }
    async function handleregister(){
        
        try {
            const response = await fetch("http://localhost:5000/m/register", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials:"include",
              body: JSON.stringify({ email, password }),
            });
      
            const data = await response.json();
            if (response.ok) {
              console.log("Registration successful:", data);
              alert("Registration Successful!");
            } else {
              console.error("Registration failed:", data);
              alert(data.message || "Registration failed");
            }
          } catch (error) {
            console.error("Error during registration:", error);
          }
    }
    return(
        <div>
            <h2 className = 'container my-3'>Welcome To ChatApp</h2>
    <div id="authSection" className = 'container mt-3 my-3'>
            <div className="mb-3">
            <label  className="form-label">Email</label>
            <input type="email" className="form-control" id="email" placeholder="Email" value = {email} onChange={(e)=>{setEmail(e.target.value)}} />
            
            </div>
            <div className="mb-3">
                <label  className="form-label">Password</label>
                <input type="text" className="form-control" id="password" placeholder="Password" value={password} onChange = {(e)=>{setPassword(e.target.value)}}/>
                
                </div>
            <div className="container my-3">
            <button  id = 'register' className="btn btn-primary" onClick={handleregister}>Register</button>
            <button  id = 'login' className="btn btn-success mx-3" onClick={handlelogin}>Login</button>
            </div>
            
    </div>
        </div>
    )
}
export default AuthPage;