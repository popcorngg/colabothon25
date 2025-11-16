import { onAuthStateChanged, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import "./AuthDetails.css";

const AuthDetails = () => {
  const [authUser, setAuthUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });
    
    return () => {
      listen();
    };
  }, []);
  
  function userSignOut() {
    signOut(auth)
      .then(() => {
        console.log("✅ Sign out successful");
        setIsExpanded(false);
      })
      .catch((e) => {
        console.error("❌ Sign out error:", e);
      });
  }
  
  // Get user initials from email
  const getInitials = (email) => {
    if (!email) return "?";
    return email.charAt(0).toUpperCase();
  };
  
  if (!authUser) return null;
  
  return (
    <>
      {/* Compact Avatar Button */}
      <div 
        className={`auth-avatar ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {getInitials(authUser.email)}
      </div>
      
      {/* Expanded Panel */}
      {isExpanded && (
        <>
          <div className="auth-overlay" onClick={() => setIsExpanded(false)} />
          <div className="auth-details expanded">
            <div className="auth-header">
              <p>Signed in as:</p>
              <button 
                className="close-btn"
                onClick={() => setIsExpanded(false)}
              >
                ×
              </button>
            </div>
            <p className="auth-email">{authUser.email}</p>
            <button className="signout-btn" onClick={userSignOut}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default AuthDetails;