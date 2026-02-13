import { useState } from "react";
import { createExam, createQuestion } from "../api";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("HEADER");
  const [examId, setExamId] = useState(null);
  const [loading, setLoading] = useState(false);

  // States
  const [examData, setExamData] = useState({ title: "", description: "", time_limit: 60 });
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  
  // IMAGE MANAGEMENT
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [options, setOptions] = useState([
    { key: "A", text: "" }, { key: "B", text: "" }, 
    { key: "C", text: "" }, { key: "D", text: "" }
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStartExam = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createExam({ 
        title: examData.title, 
        description: examData.description, 
        time_limit: parseInt(examData.time_limit) 
      });
      
      // Vérification de sécurité avant de passer à la suite
      if (res && res.id) {
        setExamId(res.id);
        setPhase("QUESTIONS");
      } else {
        throw new Error("Le serveur n'a pas renvoyé d'ID d'examen.");
      }
    } catch (err) { 
      // Si err est un objet, on essaie d'extraire le message
      const errorMsg = err.message || "Erreur de connexion au serveur";
      alert("Erreur Création Examen: " + errorMsg); 
    }
    finally { setLoading(false); }
  };

  const handleAddQuestion = async () => {
    if (!qText.trim()) return alert("L'énoncé est vide !");
    
    setLoading(true);
    const payload = {
      question_type: qType,
      text: qText,
      imageFile: selectedFile, 
      options_json: qType === "MCQ" ? JSON.stringify(options) : null,
    };

    try {
      await createQuestion(examId, payload);
      // RESET TOTAL
      setQText("");
      setSelectedFile(null);
      setPreviewUrl(null);
      // Reset options
      setOptions([{ key: "A", text: "" }, { key: "B", text: "" }, { key: "C", text: "" }, { key: "D", text: "" }]);
      
      alert("Question enregistrée !");
    } catch (err) { 
      console.error(err);
      const errorMsg = err.message || "Erreur lors de la sauvegarde";
      alert("Erreur Question: " + errorMsg); 
    } finally {
      setLoading(false);
    }
  };

  // --- RENDU PHASE 1 ---
  if (phase === "HEADER") {
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h1 style={titleStyle}>CONFIG_<span style={{color: "#10b981"}}>SYSTÈME</span></h1>
          <form onSubmit={handleStartExam} style={formStyle}>
            <div style={inputGroup}>
                <label style={labelStyle}>NOM_EXAMEN</label>
                <input required style={inputStyle} value={examData.title} onChange={e => setExamData({...examData, title: e.target.value})} />
            </div>
            <button type="submit" disabled={loading} style={btnPrimary}>
                {loading ? "INITIALISATION..." : "CRÉER L'EXAMEN [→]"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDU PHASE 2 ---
  return (
    <div style={containerStyle}>
      <div style={{ ...boxStyle, maxWidth: "1000px", display: "flex", padding: 0, minHeight: "600px" }}>
        
        <div style={sidebarStyle}>
          <h3 style={labelStyle}>TYPE_OUTIL</h3>
          <button onClick={() => setQType("MCQ")} style={qType === "MCQ" ? activeType : inactiveType}>QUIZ</button>
          <button onClick={() => setQType("SHORT")} style={qType === "SHORT" ? activeType : inactiveType}>TEXTE</button>
          <button onClick={() => setQType("CODE")} style={qType === "CODE" ? activeType : inactiveType}>CODE</button>
          
          <div style={{marginTop: "auto"}}>
            <p style={{fontSize: "10px", marginBottom: "10px"}}>ID_SESSION: {examId}</p>
            <button onClick={() => navigate("/")} style={btnFinish}>PUBLIER</button>
          </div>
        </div>

        <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <label style={labelStyle}>ÉNONCÉ_QUESTION</label>
          <textarea 
            placeholder="Tapez votre question ici..."
            style={textareaStyle} 
            value={qText} 
            onChange={e => setQText(e.target.value)} 
          />

          <div style={uploadZone}>
            <label style={labelStyle}>IMAGE_ILLUSTRATION</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{marginTop: "10px", display: "block"}} />
            {previewUrl && (
              <div style={previewContainer}>
                <img src={previewUrl} alt="Preview" style={imgStyle} />
                <button onClick={() => {setSelectedFile(null); setPreviewUrl(null);}} style={deleteImgBtn}>X</button>
              </div>
            )}
          </div>

          {qType === "MCQ" && (
            <div style={mcqGrid}>
              {options.map((opt, i) => (
                <div key={i} style={{display: "flex", alignItems: "center", gap: "10px"}}>
                   <span style={{fontWeight: "bold"}}>{opt.key}</span>
                   <input style={{...inputStyle, flex: 1}} placeholder={`Réponse ${opt.key}`} value={opt.text}
                    onChange={e => { const c = [...options]; c[i].text = e.target.value; setOptions(c); }} />
                </div>
              ))}
            </div>
          )}

          <button onClick={handleAddQuestion} disabled={loading} style={btnPrimary}>
            {loading ? "ENREGISTREMENT..." : "SAUVEGARDER LA QUESTION [+]"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- STYLES (Inchangés mais regroupés pour clarté) ---
const uploadZone = { marginTop: "1.5rem", padding: "1.5rem", border: "3px dashed #000", backgroundColor: "#f9f9f9" };
const previewContainer = { position: "relative", marginTop: "15px", display: "inline-block" };
const imgStyle = { maxHeight: "150px", border: "3px solid #000", display: "block" };
const deleteImgBtn = { position: "absolute", top: "-10px", right: "-10px", background: "red", color: "white", borderRadius: "50%", cursor: "pointer", border: "none", width: "25px", height: "25px", fontWeight: "bold" };
const mcqGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "1.5rem", marginBottom: "1.5rem" };
const containerStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "20px" };
const boxStyle = { width: "100%", maxWidth: "600px", border: "10px solid #000", padding: "3rem", fontFamily: "monospace", backgroundColor: "#fff" };
const titleStyle = { fontSize: "2.5rem", fontWeight: "900", marginBottom: "2rem" };
const formStyle = { display: "flex", flexDirection: "column", gap: "2rem" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "0.5rem" };
const labelStyle = { fontSize: "0.7rem", fontWeight: "900", color: "#888", letterSpacing: "1px" };
const inputStyle = { border: "none", borderBottom: "3px solid #000", padding: "0.5rem 0", fontSize: "1.1rem", outline: "none", backgroundColor: "transparent" };
const textareaStyle = { width: "100%", minHeight: "100px", border: "3px solid #000", padding: "1rem", fontFamily: "monospace", fontSize: "1rem", outline: "none" };
const btnPrimary = { backgroundColor: "#000", color: "#fff", border: "none", padding: "1.2rem", fontWeight: "900", cursor: "pointer", width: "100%", marginTop: "1rem" };
const sidebarStyle = { width: "220px", borderRight: "10px solid #000", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", backgroundColor: "#f0f0f0" };
const inactiveType = { padding: "0.8rem", border: "3px solid #000", background: "#fff", cursor: "pointer", fontWeight: "900", textAlign: "left" };
const activeType = { ...inactiveType, background: "#10b981", color: "#fff" };
const btnFinish = { width: "100%", padding: "1rem", background: "#10b981", border: "none", fontWeight: "900", cursor: "pointer" };