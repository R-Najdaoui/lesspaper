from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
import io
import openpyxl
from datetime import timedelta

import crud
import models
import schemas
import auth
import database

# 1. Initialisation de la base de données
models.Base.metadata.create_all(bind=database.engine)

# 2. Configuration de l'application
app = FastAPI(title="LessPaper API")

# 3. Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Dossier Statique pour les images

if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- DÉPENDANCES ---

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expirée ou invalide. Veuillez vous reconnecter.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except auth.JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

# --- ROUTES AUTHENTIFICATION ---

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.TeacherCreate)
def create_user(user: schemas.TeacherCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Ce nom d'utilisateur est déjà pris")
    crud.create_user(db=db, user=user)
    return user

# --- ROUTES EXAMENS ---

@app.post("/exams/", response_model=schemas.Exam)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(get_db), current_user: models.Teacher = Depends(get_current_user)):
    return crud.create_exam(db=db, exam=exam, teacher_id=current_user.id)

@app.get("/exams/", response_model=List[schemas.Exam])
def read_exams(db: Session = Depends(get_db), current_user: models.Teacher = Depends(get_current_user)):
    return crud.get_exams_by_teacher(db, teacher_id=current_user.id)

@app.delete("/exams/{exam_id}")
def delete_exam(exam_id: int, db: Session = Depends(get_db), current_user: models.Teacher = Depends(get_current_user)):
    exam = crud.get_exam_by_id(db, exam_id=exam_id)
    if not exam or exam.teacher_id != current_user.id:
        raise HTTPException(status_code=404, detail="Examen non trouvé")
    crud.delete_exam(db, exam_id=exam_id)
    return {"ok": True}

# --- ROUTE QUESTIONS  ---

@app.post("/exams/{exam_id}/questions/", response_model=schemas.Question)
async def create_question_for_exam(
    exam_id: int, 
    question_type: str = Form(...),
    text: str = Form(...),
    options_json: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db), 
    current_user: models.Teacher = Depends(get_current_user)
):
    # Vérification propriétaire
    exam = crud.get_exam_by_id(db, exam_id=exam_id)
    if not exam or exam.teacher_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Gestion de l'image
    image_url = None
    if file:
        file_ext = os.path.splitext(file.filename)[1]
        unique_name = f"img_{exam_id}_{os.urandom(3).hex()}{file_ext}"
        path = os.path.join("static", unique_name)
        
        with open(path, "wb") as f:
            f.write(await file.read())
        image_url = f"static/{unique_name}"

    # Création manuelle en base
    db_question = models.Question(
        exam_id=exam_id,
        question_type=question_type,
        text=text,
        options_json=options_json,
        image_url=image_url
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# --- ROUTES RÉSULTATS & ÉTUDIANTS ---

@app.get("/api/exam/{exam_code}", response_model=schemas.Exam)
def get_exam_student(exam_code: str, db: Session = Depends(get_db)):
    exam = crud.get_exam_by_code(db, code=exam_code)
    if not exam:
        raise HTTPException(status_code=404, detail="Examen introuvable")
    return exam

@app.post("/api/submit", response_model=schemas.Submission)
def submit_exam(submission: schemas.SubmissionCreate, exam_code: str, db: Session = Depends(get_db)):
    exam = crud.get_exam_by_code(db, code=exam_code)
    if not exam:
         raise HTTPException(status_code=404, detail="Examen introuvable")
    return crud.create_submission(db=db, submission=submission, exam=exam)

@app.get("/api/results/{exam_id}", response_model=List[schemas.Submission])
def get_results(exam_id: int, db: Session = Depends(get_db), current_user: models.Teacher = Depends(get_current_user)):
    exam = crud.get_exam_by_id(db, exam_id=exam_id)
    if not exam or exam.teacher_id != current_user.id:
         raise HTTPException(status_code=404, detail="Examen introuvable")
    return crud.get_submissions_by_exam(db, exam_id=exam_id)

@app.get("/api/results/{exam_id}/export")
def export_results(exam_id: int, db: Session = Depends(get_db), current_user: models.Teacher = Depends(get_current_user)):
    exam = crud.get_exam_by_id(db, exam_id=exam_id)
    if not exam or exam.teacher_id != current_user.id:
         raise HTTPException(status_code=404, detail="Examen introuvable")
    
    submissions = crud.get_submissions_by_exam(db, exam_id=exam_id)
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Résultats"
    
    headers = ["Étudiant", "Date Soumission"]
    q_map = {q.id: i for i, q in enumerate(exam.questions)}
    for i in range(len(exam.questions)):
        headers.append(f"Question {i+1}")
        
    ws.append(headers)
    
    for sub in submissions:
        row = [sub.student_name, sub.submitted_at.strftime("%Y-%m-%d %H:%M")]
        ans_row = [""] * len(exam.questions)
        for ans in sub.answers:
            if ans.question_id in q_map:
                ans_row[q_map[ans.question_id]] = ans.answer_text
        row.extend(ans_row)
        ws.append(row)
    
    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)
    
    return StreamingResponse(
        stream, 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=results_{exam.code}.xlsx"}
    )