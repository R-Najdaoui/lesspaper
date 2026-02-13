from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- AUTHENTIFICATION ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TeacherCreate(BaseModel):
    username: str
    password: str

# --- QUESTIONS ---
class QuestionBase(BaseModel):
    question_type: str  # MCQ, SHORT, CODE
    text: str
    options_json: Optional[str] = None
    correct_answer: Optional[str] = None
    language: Optional[str] = None
    starter_code: Optional[str] = None
    # Ajout du champ pour l'URL de l'image
    image_url: Optional[str] = None 

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    exam_id: int

    class Config:
        from_attributes = True  # Remplace orm_mode = True

# --- EXAMENS ---
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit: int

class ExamCreate(ExamBase):
    pass

class Exam(ExamBase):
    id: int
    code: str
    teacher_id: int
    created_at: datetime
    questions: List[Question] = []

    class Config:
        from_attributes = True

# --- SOUMISSIONS (RÉSULTATS) ---
class AnswerCreate(BaseModel):
    question_id: int
    answer_text: str

class SubmissionCreate(BaseModel):
    student_name: str
    answers: List[AnswerCreate]

class Answer(BaseModel):
    question_id: int
    answer_text: str
    
    class Config:
        from_attributes = True

class Submission(BaseModel):
    id: int
    student_name: str
    submitted_at: datetime
    answers: List[Answer] = []

    class Config:
        from_attributes = True