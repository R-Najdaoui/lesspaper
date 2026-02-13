from sqlalchemy.orm import Session
import models   # Added backend. prefix
import schemas   # Added backend. prefix
from auth import get_password_hash
import uuid
import random
import string

def get_user_by_username(db: Session, username: str):
    return db.query(models.Teacher).filter(models.Teacher.username == username).first()

def create_user(db: Session, user: schemas.TeacherCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.Teacher(username=user.username, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def generate_exam_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def create_exam(db: Session, exam: schemas.ExamCreate, teacher_id: int):
    # Ensure unique code
    while True:
        code = generate_exam_code()
        if not db.query(models.Exam).filter(models.Exam.code == code).first():
            break
            
    db_exam = models.Exam(**exam.dict(), teacher_id=teacher_id, code=code)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

def get_exams_by_teacher(db: Session, teacher_id: int):
    return db.query(models.Exam).filter(models.Exam.teacher_id == teacher_id).all()

def get_exam_by_id(db: Session, exam_id: int):
    return db.query(models.Exam).filter(models.Exam.id == exam_id).first()

def get_exam_by_code(db: Session, code: str):
    return db.query(models.Exam).filter(models.Exam.code == code).first()

def create_question(db: Session, question: schemas.QuestionCreate, exam_id: int):
    db_question = models.Question(**question.dict(), exam_id=exam_id)
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_exam(db: Session, exam_id: int):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if exam:
        db.delete(exam)
        db.commit()
        return True
    return False

def create_submission(db: Session, submission: schemas.SubmissionCreate, exam: models.Exam):
    db_submission = models.Submission(
        exam_id=exam.id,
        student_name=submission.student_name
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    for ans in submission.answers:
        db_answer = models.Answer(
            submission_id=db_submission.id,
            question_id=ans.question_id,
            answer_text=ans.answer_text
        )
        db.add(db_answer)
    
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_submissions_by_exam(db: Session, exam_id: int):
    return db.query(models.Submission).filter(models.Submission.exam_id == exam_id).all()
