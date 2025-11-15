import React, { useEffect } from "react";
import './login.css';
import { useNavigate } from 'react-router-dom';
import { GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import firebase, { auth } from '../firebase';

const Login = () => {
    const navigate = useNavigate();

    /*
    useEffect(() => {
        auth.getRedirectResult()
            .then((result) => {
                if (result.user) {
                    console.log("✅ Login successful:", result.user.email);
                    navigate('/');
                }
            })
            .catch((error) => {
                console.error("❌ Login error:", error.message);
                alert("Ошибка входа: " + error.message);
            });
    }, [navigate]);
    */ 

    return (
        <div id="login-page">
            <div id="login-card">
                <h2>Welcome to Bim-Boop-Bank!</h2>

                <div
                    className="login-button-google"
                    onClick={() => auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())}
                >
                    <GoogleOutlined /> Sign in with Google
                </div>

                <br /> <br />

                <div
                    className="login-button-facebook"
                    onClick={() => auth.signInWithRedirect(new firebase.auth.FacebookAuthProvider())}
                >
                    <FacebookOutlined /> Sign in with Facebook
                </div>

            </div>
        </div>
    );
}

export default Login;
