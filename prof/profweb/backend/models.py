from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)

    exams = relationship("Exam", back_populates="teacher")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    time_limit = Column(Integer)  # en minutes
    code = Column(String, unique=True, index=True) # Code d'accès pour les étudiants
    teacher_id = Column(Integer, ForeignKey("teachers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("Teacher", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    question_type = Column(String) # MCQ, SHORT, CODE
    text = Column(Text)
    
    # --- COLONNE AJOUTÉE POUR LE SUPPORT DES IMAGES ---
    image_url = Column(String, nullable=True) 
    
    # Stockage des options au format JSON pour les QCM : [{"key": "A", "text": "Option A"}, ...]
    options_json = Column(Text, nullable=True) 
    
    correct_answer = Column(Text, nullable=True) # Pour correction automatique ou référence
    
    # Pour les questions de programmation
    language = Column(String, nullable=True)
    starter_code = Column(Text, nullable=True)

    exam = relationship("Exam", back_populates="questions")
    answers = relationship("Answer", back_populates="question")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    student_name = Column(String)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    exam = relationship("Exam", back_populates="submissions")
    answers = relationship("Answer", back_populates="submission", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    answer_text = Column(Text) # Stocke l'option sélectionnée, le texte ou le code

    submission = relationship("Submission", back_populates="answers")
    question = relationship("Question", back_populates="answers")