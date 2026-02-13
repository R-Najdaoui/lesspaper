import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={navStyle}>
      {/* Brand / Logo */}
      <div style={brandContainer}>
        <Link to="/" style={logoStyle}>
          PORTAIL_<span style={{ color: "#10b981" }}>SYSTÈME</span>
        </Link>
      </div>

      {/* User Actions */}
      <div style={actionsContainer}>
        {user && (
          <div style={userBadge}>
            <span style={userLabel}>SESSION_ACTIVE:</span>
            <span style={userName}>{user.toUpperCase()}</span>
          </div>
        )}
        
        <button
          onClick={logout}
          style={logoutButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#000";
            e.target.style.color = "#10b981";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#10b981";
            e.target.style.color = "#000";
          }}
        >
          DÉCONNEXION
        </button>
      </div>
    </nav>
  );
}



const navStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch", 
  height: "80px",
  backgroundColor: "#ffffff",
  borderBottom: "8px solid #000",
  fontFamily: "monospace",
  padding: "0 5%",
  boxSizing: "border-box",
};

const brandContainer = {
  display: "flex",
  alignItems: "center",
  borderRight: "4px solid #000",
  paddingRight: "2rem",
};

const logoStyle = {
  fontSize: "1.2rem",
  fontWeight: "900",
  textDecoration: "none",
  color: "#000",
  letterSpacing: "-0.05em",
};

const actionsContainer = {
  display: "flex",
  alignItems: "center",
  gap: "0",
};

const userBadge = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "0 1.5rem",
  borderLeft: "4px solid #000",
  height: "100%",
};

const userLabel = {
  fontSize: "0.6rem",
  fontWeight: "bold",
  color: "#999",
  letterSpacing: "0.1em",
};

const userName = {
  fontSize: "0.85rem",
  fontWeight: "900",
  color: "#000",
};

const logoutButtonStyle = {
  height: "100%",
  padding: "0 2rem",
  cursor: "pointer",
  backgroundColor: "#10b981",
  color: "#000",
  border: "none",
  borderLeft: "8px solid #000",
  fontWeight: "900",
  fontSize: "0.75rem",
  letterSpacing: "0.2em",
  transition: "all 0.1s ease",
};

export default Navbar;