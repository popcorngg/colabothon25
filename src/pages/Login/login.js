import React, { useEffect } from "react";
import './login.css';
import { useNavigate } from 'react-router-dom';
import { GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Login successful:", result.user.email);
            navigate('/');
        } catch (error) {
            console.error("❌ Login error:", error.message);
            alert("Ошибка входа: " + error.message);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            const provider = new FacebookAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Login successful:", result.user.email);
            navigate('/');
        } catch (error) {
            console.error("❌ Login error:", error.message);
            alert("Ошибка входа: " + error.message);
        }
    };

    return (
        <div id="login-page">
            <div id="login-card">
                <h2>Welcome to Bim-Boop-Bank!</h2>

                <div
                    className="login-button-google"
                    onClick={handleGoogleLogin}
                >
                    <GoogleOutlined /> Sign in with Google
                </div>

                <br /> <br />

                <div
                    className="login-button-facebook"
                    onClick={handleFacebookLogin}
                >
                    <FacebookOutlined /> Sign in with Facebook
                </div>

            </div>
        </div>
    );
}

export default Login;
