import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getExams, deleteExam, getResults } from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalSubmissions: 0,
    avgSubmissions: 0,
    recentActivity: [],
  });

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await getExams();
      setExams(data);

      let totalSubmissions = 0;
      const submissionCounts = [];

      for (const exam of data) {
        try {
          const results = await getResults(exam.id);
          const count = results ? results.length : 0;
          totalSubmissions += count;
          submissionCounts.push({
            name: exam.title.toUpperCase(),
            submissions: count,
          });
        } catch (err) {
          submissionCounts.push({ name: exam.title.toUpperCase(), submissions: 0 });
        }
      }

      setStats({
        totalExams: data.length,
        totalSubmissions,
        avgSubmissions: data.length > 0 ? Math.round(totalSubmissions / data.length) : 0,
        recentActivity: submissionCounts.slice(0, 5),
      });
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("CONFIRMER LA SUPPRESSION DÉFINITIVE ?")) {
      await deleteExam(id);
      loadExams();
    }
  };

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div>INITIALISATION_SYSTÈME...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerContainer}>
        <div>
          <h1 style={mainTitle}>
            DASHBOARD<br />
            <span style={{ color: "#10b981" }}>OVERVIEW.</span>
          </h1>
          <div style={greenBar} />
        </div>
        
        <Link to="/exam/new" style={createBtnStyle}>
          + NOUVEL EXAMEN
        </Link>
      </div>

      {/* STATS */}
      <div style={statsGrid}>
        <div style={statCardStyle}>
          <div style={statLabel}>TOTAL_EXAMENS</div>
          <div style={statValue}>{stats.totalExams}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabel}>SOUMISSIONS_DATA</div>
          <div style={statValue}>{stats.totalSubmissions}</div>
        </div>
        <div style={statCardStyle}>
          <div style={statLabel}>MOYENNE_SCORE</div>
          <div style={statValue}>{stats.avgSubmissions}</div>
        </div>
      </div>

      {/* CHART */}
      {stats.recentActivity.length > 0 && (
        <div style={chartSectionBox}>
          <h2 style={sectionTitle}>ANALYSE_ACTIVITÉ</h2>
          <div style={{ height: 300, marginTop: "2rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.recentActivity}>
                <XAxis dataKey="name" stroke="#000" fontSize={10} fontWeight="bold" />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f0fdf4' }} />
                <Bar dataKey="submissions" fill="#000">
                  {stats.recentActivity.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? "#000" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* EXAMS LIST */}
      <h2 style={{ ...sectionTitle, marginTop: "4rem" }}>RÉPERTOIRE_EXAMENS</h2>
      <div style={examsGrid}>
        {exams.map((exam) => (
          <div key={exam.id} style={examCard}>
            <div style={{ padding: "1.5rem" }}>
              <div style={examCode}>CODE_{exam.code}</div>
              <h3 style={examTitle}>{exam.title.toUpperCase()}</h3>
              <div style={examMeta}>
                DURÉE: {exam.time_limit}M / Q: {exam.questions?.length || 0}
              </div>
            </div>
            
            <div style={actionGrid}>
              <Link to={`/exam/${exam.id}`} style={actionBtn("#000", "#fff")}>EDIT</Link>
              <Link to={`/results/${exam.id}`} style={actionBtn("#10b981", "#000")}>DATA</Link>
              <button onClick={() => handleDelete(exam.id)} style={deleteBtnStyle}>DEL</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#fff",
  fontFamily: "monospace",
  padding: "4rem 5%",
  color: "#000",
};

const headerContainer = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  marginBottom: "4rem",
  flexWrap: "wrap",
  gap: "2rem"
};

const mainTitle = { fontSize: "3.5rem", fontWeight: "900", lineHeight: "0.8", margin: 0, letterSpacing: "-0.05em" };
const greenBar = { width: "50px", height: "8px", backgroundColor: "#10b981", marginTop: "1rem" };

const createBtnStyle = {
  backgroundColor: "#000",
  color: "#fff",
  padding: "1rem 2rem",
  textDecoration: "none",
  fontWeight: "900",
  fontSize: "0.8rem",
  letterSpacing: "0.2em",
  border: "none"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  marginBottom: "4rem",
  border: "5px solid #000"
};

const statCardStyle = { padding: "2rem", border: "5px solid #000", margin: "-2.5px" };
const statValue = { fontSize: "3rem", fontWeight: "900", lineHeight: "1" };
const statLabel = { fontSize: "0.6rem", fontWeight: "bold", color: "#10b981", letterSpacing: "0.2em", marginBottom: "0.5rem" };

const chartSectionBox = { border: "10px solid #000", padding: "2rem" };
const sectionTitle = { fontSize: "0.9rem", fontWeight: "900", letterSpacing: "0.3em", borderLeft: "8px solid #10b981", paddingLeft: "1rem" };

const examsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "2rem", marginTop: "2rem" };
const examCard = { border: "5px solid #000", display: "flex", flexDirection: "column" };
const examCode = { fontSize: "0.6rem", fontWeight: "bold", color: "#10b981", marginBottom: "0.5rem" };
const examTitle = { fontSize: "1.2rem", fontWeight: "900", margin: "0 0 1rem 0" };
const examMeta = { fontSize: "0.65rem", fontWeight: "bold", color: "#666" };

const actionGrid = { display: "flex", borderTop: "5px solid #000" };
const actionBtn = (bg, color) => ({
  flex: 1,
  padding: "1rem 0",
  textAlign: "center",
  textDecoration: "none",
  color: color,
  backgroundColor: bg,
  fontSize: "0.7rem",
  fontWeight: "900",
  borderRight: "5px solid #000"
});

const deleteBtnStyle = {
  flex: "0 0 60px",
  backgroundColor: "#fff",
  color: "#f44336",
  border: "none",
  fontWeight: "900",
  cursor: "pointer",
  fontSize: "0.7rem"
};

const loadingStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "monospace",
  fontWeight: "bold"
};

export default Dashboard;