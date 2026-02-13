import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getResults, getExams, downloadResults } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  CartesianGrid
} from "recharts";

function Results() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [resultsData, examsData] = await Promise.all([
        getResults(id),
        getExams(),
      ]);
      setSubmissions(resultsData);
      setExam(examsData.find((e) => e.id === parseInt(id)));
    } catch (error) {
      console.error("Error loading results", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    try {
      downloadResults(id);
    } catch (e) {
      alert("ERREUR_EXPORTATION");
    }
  };

  // LOGIQUE DES STATISTIQUES
  const stats = (() => {
    if (!exam || submissions.length === 0) return null;

    const questionStats = exam.questions.map((q, idx) => {
      const answered = submissions.filter((sub) =>
        sub.answers.some((a) => a.question_id === q.id && a.answer_text)
      ).length;
      const correct = submissions.filter((sub) => {
        if (q.question_type !== "MCQ") return false;
        const answer = sub.answers.find((a) => a.question_id === q.id);
        return answer && answer.answer_text === q.correct_answer;
      }).length;

      return {
        name: `Q${idx + 1}`,
        Réponses: answered,
        Correctes: correct,
      };
    });

    const typeDistribution = [
      { name: "QCM", value: exam.questions.filter((q) => q.question_type === "MCQ").length },
      { name: "LIBRE", value: exam.questions.filter((q) => q.question_type === "SHORT").length },
      { name: "CODE", value: exam.questions.filter((q) => q.question_type === "CODE").length },
    ].filter(t => t.value > 0);

    return { questionStats, typeDistribution };
  })();

  const COLORS = ["#10b981", "#000000", "#64748b"];

  if (loading) return <div style={loadingStyle}>INITIALISATION_SYSTÈME...</div>;
  if (!exam) return <div style={loadingStyle}>ERREUR: EXAMEN_INTROUVABLE</div>;

  return (
    <div style={pageStyle}>
      {/* NAVIGATION HAUTE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <Link to="/" style={backBtn}>← RETOUR_TABLEAU_DE_BORD</Link>
        <button onClick={handleDownload} style={exportBtn}>
          EXPORTER_EXCEL_DATA
        </button>
      </div>

      {/* HEADER AVEC CODE GÉANT */}
      <div style={headerContainer}>
        <div style={{ flex: 1 }}>
          <h1 style={mainTitle}>
            RÉSULTATS_EXAMEN<br />
            <span style={{ color: "#10b981" }}>{exam.title.toUpperCase()}.</span>
          </h1>
          <div style={greenBar} />
          <div style={examMetaInfo}>
            {submissions.length} ÉLÈVES ONT RÉPONDU / {exam.questions.length} QUESTIONS TOTAL
          </div>
        </div>

        {/* LE CODE DE L'EXAMEN - FOCUS PROFESSEUR */}
        <div style={codeHighlightBox}>
          <div style={codeLabel}>CODE_D'ACCÈS_ÉLÈVE</div>
          <div style={codeValue}>{exam.code}</div>
        </div>
      </div>

      {/* SECTION GRAPHIQUES */}
      {submissions.length > 0 && stats && (
        <div style={chartsGrid}>
          <div style={chartBox}>
            <h2 style={sectionTitle}>PERFORMANCE_RÉUSSITE</h2>
            <div style={{ height: 250, marginTop: "2rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.questionStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" stroke="#000" fontSize={10} fontWeight="900" />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f0fdf4' }} />
                  <Bar dataKey="Réponses" fill="#000" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Correctes" fill="#10b981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={chartBox}>
            <h2 style={sectionTitle}>RÉPARTITION_QUESTIONS</h2>
            <div style={{ height: 250, marginTop: "2rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.typeDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.typeDistribution.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* LISTE DES COPIES ÉLÈVES */}
      <h2 style={{ ...sectionTitle, marginTop: "4rem" }}>RÉPERTOIRE_DES_COPIES</h2>
      <div style={listContainer}>
        {submissions.length === 0 ? (
          <div style={emptyMsg}>AUCUNE_COPIE_RÉCEPTIONNÉE</div>
        ) : (
          submissions.map((sub) => {
            const isExpanded = expandedSubmission === sub.id;
            // Calcul du score QCM rapide
            const mcqQuestions = exam.questions.filter(q => q.question_type === "MCQ");
            const correctOnes = sub.answers.filter(ans => {
              const q = mcqQuestions.find(mq => mq.id === ans.question_id);
              return q && ans.answer_text === q.correct_answer;
            }).length;

            return (
              <div key={sub.id} style={subCard(isExpanded)}>
                <div 
                  style={subHeader} 
                  onClick={() => setExpandedSubmission(isExpanded ? null : sub.id)}
                >
                  <div style={studentProfile}>
                    <div style={avatar}>{sub.student_name[0].toUpperCase()}</div>
                    <div>
                      <div style={subName}>{sub.student_name.toUpperCase()}</div>
                      <div style={subDate}>REÇU LE {new Date(sub.submitted_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div style={subActions}>
                    {mcqQuestions.length > 0 && (
                      <div style={scoreBadge(correctOnes / mcqQuestions.length >= 0.5)}>
                        SCORE: {correctOnes}/{mcqQuestions.length} QCM
                      </div>
                    )}
                    <div style={toggleIcon}>{isExpanded ? "FERMER" : "VOIR_COPIE"}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div style={detailsBox}>
                    {exam.questions.map((q, idx) => {
                      const ans = sub.answers.find(a => a.question_id === q.id);
                      const isMCQ = q.question_type === "MCQ";
                      const isCorrect = isMCQ && ans?.answer_text === q.correct_answer;

                      return (
                        <div key={q.id} style={qRow}>
                          <div style={qMeta}>
                            QUESTION {idx + 1} / {q.question_type}
                            {isMCQ && (
                              <span style={isCorrect ? correctLabel : wrongLabel}>
                                {isCorrect ? "[RÉUSSI]" : "[ÉCHEC]"}
                              </span>
                            )}
                          </div>
                          <div style={qText}>{q.text}</div>
                          <div style={ansBox(q.question_type === "CODE")}>
                            {ans?.answer_text || "NULL_NO_ANSWER"}
                          </div>
                          {isMCQ && !isCorrect && (
                            <div style={correctAnswerHint}>
                              RÉPONSE ATTENDUE: {q.correct_answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// --- STYLES SYSTÈME ---
const pageStyle = { minHeight: "100vh", backgroundColor: "#fff", fontFamily: "monospace", padding: "4rem 5%", color: "#000" };
const headerContainer = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4rem", flexWrap: "wrap", gap: "2rem" };
const mainTitle = { fontSize: "3rem", fontWeight: "900", lineHeight: "0.8", margin: 0, letterSpacing: "-0.05em" };
const greenBar = { width: "50px", height: "8px", backgroundColor: "#10b981", marginTop: "1rem" };
const examMetaInfo = { marginTop: "1rem", fontSize: "0.75rem", fontWeight: "bold", color: "#666" };

const backBtn = { textDecoration: "none", color: "#000", fontWeight: "900", fontSize: "0.7rem", borderBottom: "3px solid #10b981", paddingBottom: "4px" };
const exportBtn = { backgroundColor: "#10b981", color: "#000", padding: "1rem 1.5rem", border: "5px solid #000", fontWeight: "900", fontSize: "0.75rem", cursor: "pointer" };

// BLOC CODE GÉANT
const codeHighlightBox = {
  border: "5px solid #000",
  padding: "1.5rem 2.5rem",
  backgroundColor: "#fff",
  textAlign: "center",
  boxShadow: "10px 10px 0px #10b981"
};
const codeLabel = { fontSize: "0.6rem", fontWeight: "900", color: "#10b981", marginBottom: "0.5rem", letterSpacing: "0.1em" };
const codeValue = { fontSize: "4rem", fontWeight: "900", lineHeight: "1", color: "#000" };

const chartsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "2rem" };
const chartBox = { border: "5px solid #000", padding: "2rem" };
const sectionTitle = { fontSize: "0.85rem", fontWeight: "900", letterSpacing: "0.2em", borderLeft: "8px solid #10b981", paddingLeft: "1rem", marginBottom: "2rem" };

const listContainer = { display: "flex", flexDirection: "column", gap: "1rem" };
const subCard = (expanded) => ({ border: "5px solid #000", backgroundColor: expanded ? "#fdfdfd" : "#fff", transition: "0.1s" });
const subHeader = { padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" };
const studentProfile = { display: "flex", alignItems: "center", gap: "1.5rem" };
const avatar = { width: "45px", height: "45px", backgroundColor: "#000", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "1.2rem" };
const subName = { fontSize: "1.2rem", fontWeight: "900" };
const subDate = { fontSize: "0.65rem", color: "#999", marginTop: "2px" };

const subActions = { display: "flex", alignItems: "center", gap: "2rem" };
const scoreBadge = (pass) => ({
  backgroundColor: pass ? "#10b981" : "#000",
  color: pass ? "#000" : "#fff",
  padding: "0.4rem 0.8rem",
  fontSize: "0.7rem",
  fontWeight: "900"
});
const toggleIcon = { fontSize: "0.7rem", fontWeight: "900", color: "#10b981" };

const detailsBox = { padding: "2.5rem", borderTop: "5px solid #000", backgroundColor: "#fff" };
const qRow = { marginBottom: "2.5rem", borderBottom: "2px solid #eee", paddingBottom: "2rem" };
const qMeta = { fontSize: "0.6rem", fontWeight: "bold", color: "#999", marginBottom: "0.5rem" };
const qText = { fontSize: "1.1rem", fontWeight: "900", marginBottom: "1.5rem" };
const ansBox = (isCode) => ({
  backgroundColor: isCode ? "#000" : "#f0fdf4",
  color: isCode ? "#10b981" : "#000",
  padding: "1.2rem",
  fontSize: "0.9rem",
  fontWeight: "bold",
  whiteSpace: "pre-wrap",
  border: isCode ? "none" : "3px solid #000"
});
const correctAnswerHint = { marginTop: "1rem", color: "#10b981", fontSize: "0.8rem", fontWeight: "bold" };
const correctLabel = { marginLeft: "1rem", color: "#10b981" };
const wrongLabel = { marginLeft: "1rem", color: "#ff4b2b" };

const emptyMsg = { padding: "4rem", textAlign: "center", border: "5px dashed #eee", color: "#ccc", fontWeight: "900" };
const loadingStyle = { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: "900" };

export default Results;