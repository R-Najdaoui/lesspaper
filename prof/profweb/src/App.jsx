import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import ExamDetails from "./pages/ExamDetails";
import Results from "./pages/Results";
import Navbar from "./components/Navbar";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <>
      {token && <Navbar />}
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/new"
            element={
              <ProtectedRoute>
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <ExamDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;