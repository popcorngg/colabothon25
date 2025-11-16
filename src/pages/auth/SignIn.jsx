import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./SignIn.css";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function login(e) {
        e.preventDefault();
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("User logged in:", userCredential.user);
                setError("");
                setEmail("");
                setPassword("");
               
                navigate("/");
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
            });
    }

    return (
        <div className="auth-container">
            <form onSubmit={login}>
                <h2>Sign In</h2>
                
                {error && <p className="error-message">{error}</p>}
                
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email"
                    required
                />

                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    required
                />
                
                <button type="submit">Sign In</button>
                
                <p>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")} style={{ cursor: "pointer", color: "blue" }}>
                        Sign Up
                    </span>
                </p>
            </form>
        </div>
    );
};

export default SignIn;