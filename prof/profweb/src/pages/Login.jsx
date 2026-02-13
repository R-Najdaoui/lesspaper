import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { login as apiLogin, register as apiRegister } from "../api";
import { useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await apiLogin(username, password);
        login(data.access_token, username);
        navigate("/");
      } else {
        await apiRegister(username, password);
        setIsLogin(true);
        setError("success:Compte créé. Authentification requise.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = error.startsWith("success:");
  const displayError = isSuccess ? error.split(":")[1] : error;

  return (
    <div style={pageStyle}>
      {/* Main Container with industrial border */}
      <div style={mainBoxStyle}>
        
        <header style={{ marginBottom: "4rem" }}>
          <h1 style={headerStyle}>
            <span style={{ color: "#000" }}>{isLogin ? "ACCÈS" : "CRÉER"}</span>
            <br />
            <span style={{ color: "#10b981" }}>SYSTÈME.</span>
          </h1>
          <div style={separatorStyle} />
        </header>

        {error && (
          <div style={{
            ...errorBoxStyle,
            borderColor: isSuccess ? "#10b981" : "#000",
            backgroundColor: isSuccess ? "#f0fdf4" : "#fff1f0"
          }}>
            {displayError.toUpperCase()}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
          
          <div style={inputContainerStyle}>
            <label style={labelStyle}>IDENTIFIANT_UTILISATEUR</label>
            <input
              required
              type="text"
              placeholder="_ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputFieldStyle}
            />
          </div>

          <div style={inputContainerStyle}>
            <label style={labelStyle}>CLE_DE_SECURITE</label>
            <input
              required
              type="password"
              placeholder="_PWD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputFieldStyle}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button type="submit" disabled={loading} style={primaryButtonStyle}>
              <span style={{ fontWeight: "900" }}>
                {loading ? "CHARGEMENT..." : isLogin ? "ENTRER" : "VALIDER"}
              </span>
              {!loading && <MoveRight size={24} />}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              style={toggleButtonStyle}
            >
              {isLogin ? "[ CRÉER UN NOUVEAU COMPTE ]" : "[ RETOUR À L'ACCÈS ]"}
            </button>
          </div>
        </form>
      </div>

      {/* Decorative side-text (Subtle differentiating detail) */}
      <div style={verticalTextStyle}>
        AUTH_MODULE_V4.0
      </div>
    </div>
  );
}


const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "monospace", 
  position: "relative",
  overflow: "hidden"
};

const mainBoxStyle = {
  width: "100%",
  maxWidth: "550px",
  padding: "4rem",
  border: "10px solid #000", // Heavy block border
  backgroundColor: "#fff",
  zIndex: 2
};

const headerStyle = {
  fontSize: "clamp(3rem, 10vw, 5rem)",
  fontWeight: "900",
  lineHeight: "0.8",
  margin: 0,
  letterSpacing: "-0.05em"
};

const separatorStyle = {
  width: "60px",
  height: "10px",
  backgroundColor: "#10b981",
  marginTop: "1.5rem"
};

const inputContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem"
};

const labelStyle = {
  fontSize: "0.65rem",
  fontWeight: "bold",
  letterSpacing: "0.2em",
  color: "#000"
};

const inputFieldStyle = {
  border: "3px solid #000",
  padding: "1.25rem",
  fontSize: "1.25rem",
  fontWeight: "bold",
  outline: "none",
  backgroundColor: "#f9f9f9",
  borderRadius: "0", // Force sharp corners
};

const primaryButtonStyle = {
  width: "100%",
  backgroundColor: "#000",
  color: "#fff",
  border: "none",
  padding: "1.5rem",
  fontSize: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  borderRadius: "0",
  transition: "all 0.1s ease"
};

const toggleButtonStyle = {
  background: "none",
  border: "none",
  marginTop: "2rem",
  fontSize: "0.7rem",
  fontWeight: "bold",
  color: "#10b981",
  cursor: "pointer",
  padding: 0,
  letterSpacing: "0.1em"
};

const errorBoxStyle = {
  border: "3px solid",
  padding: "1rem",
  marginBottom: "2rem",
  fontSize: "0.75rem",
  fontWeight: "bold"
};

const verticalTextStyle = {
  position: "absolute",
  right: "-20px",
  bottom: "100px",
  transform: "rotate(-90deg)",
  fontSize: "5rem",
  fontWeight: "900",
  color: "#f0f0f0",
  zIndex: 1,
  whiteSpace: "nowrap",
  pointerEvents: "none"
};