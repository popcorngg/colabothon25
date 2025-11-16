import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [copyPassword, setCopyPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function register(e) {
        e.preventDefault();
        
        if (password !== copyPassword) {
            setError("Passwords do not match");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("User created:", userCredential.user);
                setError("");
                setEmail("");
                setPassword("");
                setCopyPassword("");
                // Перенаправляем на главную страницу после успешной регистрации
                navigate("/");
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
            });
    }

    return (
        <div className="auth-container">
            <form onSubmit={register}>
                <h2>Create an account</h2>
                
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

                <input
                    value={copyPassword}
                    onChange={(e) => setCopyPassword(e.target.value)}
                    type="password"
                    placeholder="Confirm Password"
                    required
                />
                
                <button type="submit">Create</button>
                
                <p>
                    Already have an account?{" "}
                    <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "blue" }}>
                        Sign In
                    </span>
                </p>
            </form>
        </div>
    );
};

export default SignUp;