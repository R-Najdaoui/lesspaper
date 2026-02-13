import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getExams, createQuestion } from "../api";

function ExamDetails() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [qType, setQType] = useState("MCQ");
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState([
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [language, setLanguage] = useState("python");
  const [starterCode, setStarterCode] = useState("");

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    const exams = await getExams();
    const found = exams.find((e) => e.id === parseInt(id));
    setExam(found);
    setLoading(false);
  };

  const handleOptionChange = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx].text = val;
    setOptions(newOpts);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      question_type: qType,
      text: qText,
      options_json: qType === "MCQ" ? JSON.stringify(options) : null,
      correct_answer: qType === "MCQ" ? correctAnswer : null,
      language: qType === "CODE" ? language : null,
      starter_code: qType === "CODE" ? starterCode : null,
    };

    await createQuestion(id, payload);
    setQText("");
    setStarterCode("");
    loadExam();
  };

  if (loading) return <div style={loadingStyle}>CHARGEMENT_DATA...</div>;
  if (!exam) return <div style={loadingStyle}>ERREUR: EXAMEN_INTROUVABLE</div>;

  return (
    <div style={pageStyle}>
      {/* NAVIGATION */}
      <div style={{ marginBottom: "3rem" }}>
        <Link to="/" style={backLinkStyle}>
          [←] RETOUR_TABLEAU_DE_BORD
        </Link>
      </div>

      {/* HEADER SECTION */}
      <header style={headerSection}>
        <div style={headerContent}>
          <h1 style={mainTitle}>{exam.title.toUpperCase()}</h1>
          {exam.description && <p style={descriptionStyle}>{exam.description}</p>}
        </div>
        
        {/* ACCESS CODE BLOCK */}
        <div style={accessCodeBox}>
          <div style={accessLabel}>CODE_D_ACCÈS_ÉTUDIANT</div>
          <div style={accessValue}>{exam.code}</div>
        </div>
      </header>

      <div style={gridContainer}>
        {/* LEFT COLUMN: EXISTING QUESTIONS */}
        <section style={{ flex: 1.5 }}>
          <h2 style={sectionTitle}>QUESTIONS_EXISTANTES ({exam.questions.length})</h2>
          
          <div style={questionsList}>
            {exam.questions.length === 0 ? (
              <div style={emptyBox}>AUCUNE_QUESTION_DÉTECTÉE.</div>
            ) : (
              exam.questions.map((q, idx) => (
                <div key={q.id} style={questionCard}>
                  <div style={qHeader}>
                    <span style={qNumber}>#{idx + 1}</span>
                    <span style={qBadge(q.question_type)}>{q.question_type}</span>
                  </div>
                  <p style={qTextDisplay}>{q.text}</p>
                  
                  {q.question_type === "MCQ" && (
                    <div style={optionsDisplayBox}>
                      {JSON.parse(q.options_json).map((opt) => (
                        <div key={opt.key} style={optRow(opt.key === q.correct_answer)}>
                          <span style={optKey(opt.key === q.correct_answer)}>{opt.key}</span>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {q.question_type === "CODE" && q.starter_code && (
                    <pre style={codePreviewStyle}>{q.starter_code}</pre>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: ADD QUESTION FORM */}
        <section style={{ flex: 1 }}>
          <div style={formStickyBox}>
            <h2 style={sectionTitle}>AJOUTER_ÉLÉMENT</h2>
            <form onSubmit={handleAddQuestion} style={addFormStyle}>
              
              <div style={inputGroup}>
                <label style={labelStyle}>TYPE_QUESTION</label>
                <select value={qType} onChange={(e) => setQType(e.target.value)} style={selectStyle}>
                  <option value="MCQ">CHOIX MULTIPLE (QCM)</option>
                  <option value="SHORT">RÉPONSE COURTE</option>
                  <option value="CODE">CODAGE</option>
                </select>
              </div>

              <div style={inputGroup}>
                <label style={labelStyle}>ÉNONCÉ</label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  required
                  style={textareaStyle}
                  placeholder="SAISIR_ÉNONCÉ..."
                />
              </div>

              {qType === "MCQ" && (
                <div style={mcqFormBox}>
                  {options.map((opt, idx) => (
                    <div key={idx} style={mcqInputRow}>
                      <span style={mcqKeyLabel}>{opt.key}</span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        required
                        style={mcqInputStyle}
                        placeholder={`OPTION_${opt.key}`}
                      />
                    </div>
                  ))}
                  <div style={{ marginTop: "1rem" }}>
                    <label style={labelStyle}>RÉPONSE_VALIDE</label>
                    <select value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} style={selectStyle}>
                      {["A", "B", "C", "D"].map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {qType === "CODE" && (
                <div style={mcqFormBox}>
                  <label style={labelStyle}>LANGAGE</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
                    <option value="python">PYTHON</option>
                    <option value="javascript">JAVASCRIPT</option>
                  </select>
                  <label style={{ ...labelStyle, marginTop: "1rem" }}>STARTER_CODE</label>
                  <textarea
                    value={starterCode}
                    onChange={(e) => setStarterCode(e.target.value)}
                    style={{ ...textareaStyle, minHeight: "150px", fontFamily: "monospace" }}
                    placeholder="def function():..."
                  />
                </div>
              )}

              <button type="submit" style={submitBtnStyle}>
                VALIDER_L_AJOUT [+]
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}


const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#fff",
  fontFamily: "monospace",
  padding: "4rem 5%",
  color: "#000"
};

const backLinkStyle = {
  fontSize: "0.8rem",
  fontWeight: "900",
  textDecoration: "none",
  color: "#000",
  letterSpacing: "0.1em",
  border: "3px solid #000",
  padding: "0.75rem 1.5rem"
};

const headerSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  borderBottom: "10px solid #000",
  paddingBottom: "3rem",
  marginBottom: "4rem",
  flexWrap: "wrap",
  gap: "2rem"
};

const mainTitle = { fontSize: "3rem", fontWeight: "900", margin: 0, lineHeight: "0.9" };
const descriptionStyle = { color: "#666", marginTop: "1rem", maxWidth: "600px" };

const accessCodeBox = {
  border: "5px solid #10b981",
  padding: "1.5rem",
  backgroundColor: "#fff"
};

const accessLabel = { fontSize: "0.6rem", fontWeight: "bold", color: "#10b981", letterSpacing: "0.15em" };
const accessValue = { fontSize: "3rem", fontWeight: "900", letterSpacing: "0.2em", lineHeight: "1" };

const gridContainer = { display: "flex", gap: "4rem", flexWrap: "wrap" };
const sectionTitle = { fontSize: "1rem", fontWeight: "900", letterSpacing: "0.3em", borderLeft: "8px solid #10b981", paddingLeft: "1rem", marginBottom: "2rem" };

const questionCard = { border: "4px solid #000", marginBottom: "2rem", backgroundColor: "#fff" };
const qHeader = { display: "flex", justifyContent: "space-between", padding: "1rem", borderBottom: "4px solid #000", backgroundColor: "#f9f9f9" };
const qNumber = { fontWeight: "900" };
const qBadge = (type) => ({ fontSize: "0.6rem", fontWeight: "900", padding: "0.2rem 0.5rem", backgroundColor: type === "MCQ" ? "#10b981" : "#000", color: "#fff" });
const qTextDisplay = { padding: "1.5rem", fontSize: "1.1rem", fontWeight: "bold", margin: 0 };

const optionsDisplayBox = { padding: "0 1.5rem 1.5rem" };
const optRow = (isCorrect) => ({ display: "flex", gap: "1rem", padding: "0.75rem", border: isCorrect ? "2px solid #10b981" : "1px solid #eee", marginBottom: "0.5rem", fontWeight: isCorrect ? "bold" : "normal" });
const optKey = (isCorrect) => ({ backgroundColor: isCorrect ? "#10b981" : "#000", color: "#fff", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem" });

const codePreviewStyle = { margin: "0 1.5rem 1.5rem", padding: "1rem", backgroundColor: "#000", color: "#10b981", overflowX: "auto", fontSize: "0.8rem" };

const formStickyBox = { position: "sticky", top: "2rem", border: "8px solid #000", padding: "2rem" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" };
const labelStyle = { fontSize: "0.65rem", fontWeight: "bold", letterSpacing: "0.2em" };
const selectStyle = { padding: "1rem", border: "3px solid #000", fontWeight: "bold", borderRadius: 0, backgroundColor: "#fff" };
const textareaStyle = { padding: "1rem", border: "3px solid #000", fontWeight: "bold", minHeight: "100px", borderRadius: 0 };

const mcqFormBox = { backgroundColor: "#f9f9f9", padding: "1.5rem", border: "3px dashed #000", marginBottom: "2rem" };
const mcqInputRow = { display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" };
const mcqKeyLabel = { width: "30px", height: "30px", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };
const mcqInputStyle = { flex: 1, padding: "0.75rem", border: "2px solid #000" };

const submitBtnStyle = { width: "100%", padding: "1.5rem", backgroundColor: "#10b981", border: "none", fontWeight: "900", cursor: "pointer", letterSpacing: "0.2em" };

const emptyBox = { border: "4px dashed #ccc", padding: "4rem", textAlign: "center", color: "#999", fontWeight: "bold" };
const loadingStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" };

export default ExamDetails;