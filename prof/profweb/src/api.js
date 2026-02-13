const API_URL = "http://localhost:8000";

// --- AUTHENTIFICATION ---

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/token`, {
    method: "POST",
    body: formData, // Pas de JSON ici, FastAPI attend du form-data pour OAuth2
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

export const register = async (username, password) => {
  const response = await fetch(`${API_URL}/users/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return response.json();
};

// Helper pour récupérer les headers d'authentification
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// --- EXAMENS ---

export const getExams = async () => {
  const response = await fetch(`${API_URL}/exams/`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Impossible de charger les examens");
  return response.json();
};

export const createExam = async (examData) => {
  const response = await fetch(`${API_URL}/exams/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(examData),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de l'examen");
  return response.json();
};

export const deleteExam = async (examId) => {
  const response = await fetch(`${API_URL}/exams/${examId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression");
};

// --- QUESTIONS (CORRECTION UPLOAD IMAGE) ---

export const createQuestion = async (examId, questionData) => {
  // On utilise FormData pour permettre l'envoi de fichiers
  const formData = new FormData();
  
  // Ajout des données textuelles
  formData.append("question_type", questionData.question_type);
  formData.append("text", questionData.text);
  
  if (questionData.options_json) {
    formData.append("options_json", questionData.options_json);
  }

  // Ajout du fichier image s'il existe
  if (questionData.imageFile) {
    formData.append("file", questionData.imageFile); 
  }

  const response = await fetch(`${API_URL}/exams/${examId}/questions/`, {
    method: "POST",
    headers: {
      // IMPORTANT: On ne met PAS "Content-Type": "application/json" ici.
      // Le navigateur va automatiquement définir le "boundary" du multipart/form-data.
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Erreur lors de l'ajout de la question");
  }

  return response.json();
};

// --- RÉSULTATS ---

export const getResults = async (examId) => {
  const response = await fetch(`${API_URL}/api/results/${examId}`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Impossible de charger les résultats");
  return response.json();
};

export const downloadResults = async (examId) => {
  const response = await fetch(`${API_URL}/api/results/${examId}/export`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Le téléchargement a échoué");
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resultats_examen_${examId}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};