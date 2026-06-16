import uuid
import os
import shutil
import time
from typing import List
from datetime import datetime, timedelta, timezone, date
from pydantic import BaseModel

from fastapi import FastAPI, Depends, HTTPException, APIRouter, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import shutil

from jose import jwt, JWTError
from sqlalchemy.orm import Session
import bcrypt
import hashlib
import json

import models
import schemas
import ai_service
from database import engine, get_db
from models import Student, Grade, Class
from schemas import MasterReportCardResponse
from fastapi.staticfiles import StaticFiles


# ==============================================================================
# APP & ROUTER SETUP
# ==============================================================================

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart School Management API",
    description="Backend for the AI-powered school system",
    version="1.0.0"
)

# Allow frontend apps to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/reports", tags=["Reports"])

# ==============================================================================
# SECURITY HELPERS
# ==============================================================================

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-for-school-app-CHANGE-IN-PRODUCTION")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def require_roles(*roles: models.UserRole):
    def checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role(s): {[r.value for r in roles]}"
            )
        return current_user
    return checker

# ==============================================================================
# ROOT
# ==============================================================================

@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": "Welcome to the Smart School Management API!",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

# ==============================================================================
# AUTH ENDPOINTS
# ==============================================================================

@app.post("/users/", response_model=schemas.UserResponse, tags=["Auth"])
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_user = models.User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", tags=["Auth"])
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ==============================================================================
# STUDENT ENDPOINTS
# ==============================================================================

@app.post("/students/", response_model=schemas.StudentResponse, tags=["Students"])
def create_student(
    student: schemas.StudentCreate,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(require_roles(models.UserRole.ADMIN)) # Unlocked for frontend testing
):
    # 1. Generate default student email
    default_email = f"{student.first_name.lower()}.{student.last_name.lower()}@student.myschool.com"

    if db.query(models.User).filter(models.User.email == default_email).first():
        default_email = (
            f"{student.first_name.lower()}.{student.last_name.lower()}"
            f"{str(uuid.uuid4())[:4]}@student.myschool.com"
        )

    # 2. Create the User account
    db_user = models.User(
        email=default_email,
        password_hash=get_password_hash("changeme123"),
        role=models.UserRole.STUDENT
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 3. Generate the custom GGIS Matriculation Number
    current_year = datetime.now().year
    student_count = db.query(models.Student).count()
    next_sequence = student_count + 1
    
    # Formats the number with leading zeros (e.g., GGIS/2026/0001, GGIS/2026/0012)
    formatted_matric = f"GGIS/{current_year}/{next_sequence:04d}"

    # 4. Create the Student profile
    db_student = models.Student(
        user_id=db_user.id,
        matric_number=formatted_matric,  # NEW: The generated ID is saved here!
        first_name=student.first_name,
        last_name=student.last_name,
        date_of_birth=student.date_of_birth
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    return db_student

@app.get("/students/", response_model=List[schemas.StudentResponse], tags=["Students"])
def list_students(
    db: Session = Depends(get_db)
):
    """TEMPORARILY UNLOCKED: List all students."""
    return db.query(models.Student).all()

@app.get("/students/{student_id}", response_model=schemas.StudentResponse, tags=["Students"])
def get_student(
    student_id: str,
    db: Session = Depends(get_db)
):
    """TEMPORARILY UNLOCKED: Get a single student profile."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    return student

@app.put("/students/{student_id}", response_model=schemas.StudentResponse, tags=["Students"])
def update_student(
    student_id: str,
    updates: schemas.StudentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))
):
    """NEW: Update student details. Admins only."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.first_name = updates.first_name
    student.last_name = updates.last_name
    student.date_of_birth = updates.date_of_birth
    db.commit()
    db.refresh(student)
    return student

@app.delete("/students/{student_id}", tags=["Students"])
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(models.UserRole.ADMIN))
):
    """NEW: Delete a student. Admins only."""
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": f"Student {student_id} deleted successfully"}

# ==============================================================================
# ATTENDANCE ENDPOINTS
# ==============================================================================

class QRScanRequest(BaseModel):
    qr_token: str

@app.post("/attendance/scan", tags=["Attendance"])
def scan_qr_attendance(
    payload: QRScanRequest, 
    db: Session = Depends(get_db)
):
    # 1. Look up the student using only the QR token
    student = db.query(models.Student).filter(models.Student.qr_token == payload.qr_token).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Invalid QR Code. Student not found.")
        
    # Safety Check: Ensure the student actually belongs to a class
    if not student.class_id:
        raise HTTPException(status_code=400, detail="This student is not assigned to a class.")

    today = date.today()
    
    # 2. Check for duplicate scans using your exact same logic
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == student.id,
        models.Attendance.class_id == student.class_id,
        models.Attendance.date == today
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"{student.first_name} has already been marked present today."
        )

    # 3. Create the attendance record automatically
    db_attendance = models.Attendance(
        student_id=student.id,
        class_id=student.class_id, # We pull this from the student profile now!
        date=today,
        status=models.AttendanceStatus.PRESENT
    )
    
    db.add(db_attendance)
    db.commit()
    
    # 4. Return custom data so the React UI can display the student's name
    return {
        "success": True,
        "student_name": f"{student.first_name} {student.last_name}",
        "matric_number": student.matric_number,
        "status": "present"
    }
@app.get("/attendance/student/{student_id}", response_model=List[schemas.AttendanceResponse], tags=["Attendance"])
def get_student_attendance(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.STUDENT:
        student_profile = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(status_code=403, detail="You can only view your own attendance.")

    records = db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()
    return records

@app.get("/attendance/student/{student_id}/summary", tags=["Attendance"])
def get_attendance_summary(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """NEW: Get attendance percentage and summary for a student."""
    if current_user.role == models.UserRole.STUDENT:
        profile = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if not profile or profile.id != student_id:
            raise HTTPException(status_code=403, detail="You can only view your own attendance.")

    records = db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value == "present")
    absent = sum(1 for r in records if r.status.value == "absent")
    late = sum(1 for r in records if r.status.value == "late")
    percentage = round((present / total * 100), 2) if total > 0 else 0.0

    return {
        "student_id": student_id,
        "total_days": total,
        "present": present,
        "absent": absent,
        "late": late,
        "attendance_percentage": percentage
    }

# ==============================================================================
# GRADE ENDPOINTS
# ==============================================================================

@app.post("/grades/", response_model=schemas.GradeResponse, tags=["Grades"])
def add_grade(
    grade: schemas.GradeCreate,
    db: Session = Depends(get_db),
):
    student_exists = db.query(models.Student).filter(models.Student.id == grade.student_id).first()
    if not student_exists:
        raise HTTPException(status_code=404, detail="Student not found")

    existing_grade = db.query(models.Grade).filter(
        models.Grade.student_id == grade.student_id,
        models.Grade.class_id == grade.class_id,
        models.Grade.subject == grade.subject,
        models.Grade.term == grade.term,
        models.Grade.academic_session == grade.academic_session
    ).first()

    if existing_grade:
        raise HTTPException(
            status_code=400,
            detail="Grade already exists for this student in this subject for this class and term."
        )

    db_grade = models.Grade(**grade.model_dump())
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade

@app.delete("/grades/{grade_id}", tags=["Grades"])
def delete_grade(grade_id: str, db: Session = Depends(get_db)):
    grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
        
    db.delete(grade)
    db.commit()
    
    return {"message": "Grade deleted successfully"}

@app.get("/grades/student/{student_id}", response_model=List[schemas.GradeResponse], tags=["Grades"])
def get_student_grades(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == models.UserRole.STUDENT:
        student_profile = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
        if not student_profile or student_profile.id != student_id:
            raise HTTPException(status_code=403, detail="You can only view your own grades.")

    return db.query(models.Grade).filter(models.Grade.student_id == student_id).all()

@app.put("/grades/{grade_id}", response_model=schemas.GradeResponse, tags=["Grades"])
def update_grade(
    grade_id: str,
    updates: schemas.GradeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_roles(models.UserRole.ADMIN, models.UserRole.TEACHER)
    )
):
    """NEW: Update an existing grade. Teachers and Admins only."""
    grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")

    for field, value in updates.model_dump().items():
        setattr(grade, field, value)

    db.commit()
    db.refresh(grade)
    return grade

# ==============================================================================
# CLASS ENDPOINTS
# ==============================================================================

@app.post("/classes/", response_model=schemas.ClassResponse, tags=["Classes"])
def create_class(
    school_class: schemas.ClassCreate,
    db: Session = Depends(get_db)
):
    """TEMPORARILY UNLOCKED: Create a new school class tier."""
    db_class = models.Class(
        name=school_class.name,
        class_teacher_id=school_class.class_teacher_id
    )
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

@app.get("/classes/", response_model=List[schemas.ClassResponse], tags=["Classes"])
def list_classes(
    db: Session = Depends(get_db)
):
    """NEW: List all classes."""
    return db.query(models.Class).all()

@app.get("/classes/{class_id}/students", response_model=List[schemas.StudentResponse], tags=["Classes"])
def get_class_students(
    class_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_roles(models.UserRole.ADMIN, models.UserRole.TEACHER)
    )
):
    """NEW: Get all students in a class by checking their grade enrollments."""
    class_grades = db.query(models.Grade).filter(models.Grade.class_id == class_id).all()
    student_ids = list(set([grade.student_id for grade in class_grades]))
    
    if not student_ids:
        return []
    
    students = db.query(models.Student).filter(models.Student.id.in_(student_ids)).all()
    return students

# ==============================================================================
# AI ENDPOINTS
# ==============================================================================

@app.post("/ai/generate-comment/{student_id}", response_model=schemas.CommentResponse, tags=["AI"])
def generate_comment_for_student(
    student_id: str,
    request_data: schemas.CommentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_roles(models.UserRole.ADMIN, models.UserRole.TEACHER)
    )
):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    grades = db.query(models.Grade).filter(
        models.Grade.student_id == student_id,
        models.Grade.term == request_data.term,
        models.Grade.academic_session == request_data.academic_session
    ).all()

    if not grades:
        raise HTTPException(status_code=400, detail="No grades found for this term. Cannot generate comment.")

    attendance_records = db.query(models.Attendance).filter(
        models.Attendance.student_id == student_id
    ).all()

    total_days = len(attendance_records)
    days_present = sum(1 for r in attendance_records if r.status.value == "present")

    performance_summary = "\n".join(
        [f"- {g.subject}: {g.total_score}% (Grade: {g.grade_letter})" for g in grades]
    )
    attendance_summary = f"Attended {days_present} out of {total_days} recorded days."

    generated_comment = ai_service.generate_report_card_comment(
        first_name=student.first_name,
        performance_summary=performance_summary,
        attendance_summary=attendance_summary
    )

    return schemas.CommentResponse(
        student_id=student_id,
        term=request_data.term,
        generated_comment=generated_comment
    )

# ==============================================================================
# REPORT CARD ENDPOINT (on router, not app)
# ==============================================================================

# ==============================================================================
# REPORT CARD ENDPOINT (on router, not app)
# ==============================================================================

@app.get("/report-card/{student_id:path}", tags=["Reports"])
def get_master_report_card(
    student_id: str,
    term: str,
    academic_session: str,
    db: Session = Depends(get_db)
):
    try:
        # 1. Fetch the EXACT student by Matric Number OR Database ID
        student = db.query(models.Student).filter(models.Student.matric_number == student_id).first()
        if not student:
            # Fallback to standard ID if they haven't been assigned a matric number yet
            student = db.query(models.Student).filter(models.Student.id == student_id).first()
            
        if not student:
            return {"error": "Student not found! Please check your Matriculation Number."}
        
        # 2. Get Grades using the TRUE database ID
        grades = db.query(models.Grade).filter(
            models.Grade.student_id == student.id,
            models.Grade.term == term,
            models.Grade.academic_session == academic_session
        ).all()

        # 3. Get Class safely from the grades
        class_name = "Unassigned"
        if grades:
            student_class = db.query(models.Class).filter(models.Class.id == grades[0].class_id).first()
            if student_class:
                class_name = student_class.name

        # 4. Safe dictionary formatting
        grade_list = []
        for g in grades:
            grade_list.append({
                "id": str(g.id),
                "subject": g.subject, 
                "ca_score": g.ca_score,      
                "exam_score": g.exam_score,  
                "total_score": g.total_score, 
                "grade_letter": g.grade_letter
            })
            
        # 5. Generate real AI comment!
        performance_summary = "\n".join([f"- {g.subject}: {g.total_score}%" for g in grades]) if grades else "No grades recorded yet."

        try:
            ai_comment = ai_service.generate_report_card_comment(
                first_name=student.first_name,
                performance_summary=performance_summary,
                attendance_summary="Attendance data pending." 
            )
        except Exception:
            ai_comment = "AI is currently thinking..."

        # 6. --- Calculate Real Attendance ---
        total_days = db.query(models.Attendance).filter(
            models.Attendance.student_id == student.id
        ).count()
        
        days_present = db.query(models.Attendance).filter(
            models.Attendance.student_id == student.id,
            models.Attendance.status == models.AttendanceStatus.PRESENT  # <-- The official Enum object!
        ).count()

        return {
            "student_id": student.id,
            "matric_number": student.matric_number,
            "student_name": f"{student.first_name} {student.last_name}",
            "class_name": class_name,
            "term": term,
            "academic_session": academic_session,
            "grades": grade_list,
            "attendance": {
                "total_days": total_days,
                "days_present": days_present
            },
            "ai_comment": ai_comment
        }
        
    except Exception as e:
        return {"CRASH_REPORT": f"Error: {str(e)}"}

# THIS LINE MUST BE AT THE VERY BOTTOM, AFTER THE FUNCTION!
app.include_router(router)


def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

@app.post("/setup-admin/", tags=["Authentication"])
def setup_first_admin(admin: schemas.UserCreate, db: Session = Depends(get_db)):
    """Run this ONCE to create your first admin account!"""
    existing_user = db.query(models.User).filter(models.User.email == admin.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    new_user = models.User(
        email=admin.email,
        password_hash=hash_password(admin.password),
        role=admin.role  # Your schema perfectly handles the Enum here!
    )
    db.add(new_user)
    db.commit()
    return {"message": "Admin account created successfully!"}


@app.post("/login/", tags=["Authentication"])
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Verifies email and password."""
    hashed_attempt = hash_password(credentials.password)
    
    user = db.query(models.User).filter(
        models.User.email == credentials.email,
        models.User.password_hash == hashed_attempt
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    # Safely extract the role value from your Enum
    role_str = user.role.value if hasattr(user.role, 'value') else str(user.role)
        
    return {
        "message": "Login successful", 
        "email": user.email, 
        "role": role_str
    }


# ==========================================
# DASHBOARD ANALYTICS ENDPOINTS
# ==========================================

@app.get("/dashboard/summary/", tags=["Dashboard"])
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Provides a quick snapshot of school statistics."""
    try:
        total_students = db.query(models.Student).count()
        total_classes = db.query(models.Class).count()
        
        # Count how many attendance records exist for exactly today
        today_str = str(date.today())
        attendance_today = db.query(models.Attendance).filter(
            models.Attendance.date == today_str
        ).count()

        return {
            "total_students": total_students,
            "total_classes": total_classes,
            "attendance_today": attendance_today
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/staff/", tags=["Staff Management"])
def get_all_staff(db: Session = Depends(get_db)):
    """Fetches a list of all registered staff members."""
    users = db.query(models.User).all()
    # Safely format the output so we NEVER send passwords to the frontend!
    staff_list = []
    for u in users:
        role_str = u.role.value if hasattr(u.role, 'value') else str(u.role)
        staff_list.append({
            "id": u.id,
            "email": u.email,
            "role": role_str
        })
    return staff_list

@app.post("/exams/generate", tags=["Exams"])
async def generate_ai_exam(request: schemas.ExamGenerateRequest, db: Session = Depends(get_db)):
    """
    Generates an exam using Gemini Structured Outputs linked directly 
    to your Postgres database backend.
    """
    if request.num_questions == 0 and request.num_theory == 0:
        raise HTTPException(status_code=400, detail="Please select at least one question type.")

    try:
        # 1. Check Postgres for local curriculum notes
        material = db.query(models.CourseMaterial).filter(
            models.CourseMaterial.class_name == request.class_name,
            models.CourseMaterial.topic.ilike(f"%{request.topic}%")
        ).first()

        # 2. Formulate contextual grounding instructions
        if material:
            context_instruction = f"""
            You MUST build the questions using the source text below as your primary resource:
            
            SOURCE LESSON NOTES:
            \"\"\"
            {material.content_text}
            \"\"\"
            
            If the text is too short to fulfill the required counts, use it as your core focus but supplement it with standard, age-appropriate concepts for a {request.class_name} curriculum.
            """
            print(f"DEBUG: Found source material for {request.topic}. Using RAG mode.")
        else:
            context_instruction = f"""
            No specific source text was found. Generate standard, age-appropriate questions matching general curriculum benchmarks for a {request.class_name} tier.
            """
            print(f"DEBUG: No material found for {request.topic}. Falling back to global knowledge.")

        # 3. Construct the prompt with strict array target count parameters
        prompt = f"""
        You are an expert school curriculum designer for a schools evaluation portal. 
        Create a comprehensive exam for a {request.class_name} class on the topic: {request.topic}.
        
        {context_instruction}
        
        MANDATORY STRUCTURAL TARGETS:
        1. You MUST generate exactly {request.num_questions} multiple choice questions inside the 'objective' array. If this target is 0, return an empty array [].
        2. You MUST generate exactly {request.num_theory} essay questions inside the 'theory' array. If this target is 0, return an empty array [].
        """

        # 4. Initialize client using environment key
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        
        # FIXED: Referencing your models using the proper schemas configuration namespace
        generation_config = {
            "response_mime_type": "application/json",
            "response_schema": schemas.FullExamOutputSchema,
            "temperature": 0.3
        }

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=generation_config
        )

        # 5. Parse valid structured text output
        generated_questions = json.loads(response.text)
        
        print("DEBUG: Generated Objective Count:", len(generated_questions.get("objective", [])))
        print("DEBUG: Generated Theory Count:", len(generated_questions.get("theory", [])))

        # 6. Save the validated JSON straight to your Docker Postgres database
        new_exam = models.Exam(
            class_name=request.class_name,
            topic=request.topic,
            questions_data=generated_questions
        )
        db.add(new_exam)
        db.commit()
        db.refresh(new_exam)
        
        return {
            "id": new_exam.id,
            "class_name": request.class_name,
            "topic": request.topic,
            "questions_data": generated_questions 
        }
        
    except Exception as e:
        print(f"CRITICAL BACKEND ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation pipeline failure: {str(e)}")


@app.get("/exams/class/{class_name}", tags=["Exams"])
def get_class_exams(class_name: str, db: Session = Depends(get_db)):
    """Retrieves all available exams, securely stripping answers for students."""
    exams = db.query(models.Exam).filter(models.Exam.class_name == class_name).all()
    
    safe_exams = []
    for exam in exams:
        data = exam.questions_data
        
        # Securely sanitize objective questions
        safe_objective = []
        if data.get("objective"):
            for q in data["objective"]:
                safe_objective.append({"question": q["question"], "options": q["options"]})
        
        # Securely sanitize theory questions
        safe_theory = []
        if data.get("theory"):
            for q in data["theory"]:
                safe_theory.append({"question": q["question"]}) # Strip the marking_guide!
        
        safe_exams.append({
            "id": exam.id,
            "topic": exam.topic,
            "class_name": exam.class_name,
            "questions": {
                "objective": safe_objective,
                "theory": safe_theory
            }
        })
        
    return safe_exams

@app.post("/exams/{exam_id}/submit", tags=["Exams"])
def auto_grade_exam(exam_id: int, submission: schemas.ExamSubmission, db: Session = Depends(get_db)):
    """Receives dynamic student context, auto-grades, and updates the specific report card."""
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # 1. Core Auto-Grading Engine
    questions = exam.questions_data.get("objective", [])
    score = 0
    total_questions = len(questions)

    for index, q in enumerate(questions):
        correct_answer = q.get("correct_answer")
        student_answer = submission.answers.get(str(index))
        
        if student_answer == correct_answer:
            score += 1

    percentage = (score / total_questions) * 100 if total_questions > 0 else 0
    final_score = round(percentage, 1)

    # 2. Save Dynamically to models.Grade
    try:
        if final_score >= 70: grade_letter = "A"
        elif final_score >= 60: grade_letter = "B"
        elif final_score >= 50: grade_letter = "C"
        elif final_score >= 40: grade_letter = "D"
        else: grade_letter = "F"

        new_grade = models.Grade(
            student_id=submission.student_id,         # Dynamic Student ID
            subject=exam.topic,
            ca_score=0, 
            exam_score=final_score,
            total_score=final_score,
            grade_letter=grade_letter,
            term=submission.term,                      # Dynamic Term passed from UI
            academic_session=submission.academic_session # Dynamic Session passed from UI
        )
        db.add(new_grade)
        db.commit()
    except Exception as db_err:
        db.rollback()
        print(f"Database Sync Error: {str(db_err)}")
        
    return {
        "status": "success",
        "score": score,
        "total": total_questions,
        "percentage": final_score
    }

@app.post("/payments", tags=["Finance"])
def create_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    """Records a new payment transaction."""
    new_payment = models.Payment(
        student_id=payment.student_id,
        amount=payment.amount,
        payment_status=payment.payment_status,
        term=payment.term,
        session=payment.session,
        receipt_no=payment.receipt_no
    )
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

@app.get("/payments/student/{student_id}", tags=["Finance"])
def get_student_payments(student_id: int, db: Session = Depends(get_db)):
    """Retrieves all payment history for a specific student."""
    payments = db.query(models.Payment).filter(models.Payment.student_id == student_id).all()
    if not payments:
        raise HTTPException(status_code=404, detail="No payment records found for this student.")
    return payments

@app.get("/payments", tags=["Finance"])
def get_all_payments(db: Session = Depends(get_db)):
    """Retrieves all payment transactions."""
    return db.query(models.Payment).all()

from fastapi import HTTPException # Make sure this is imported at the top of main.py if it isn't already

@app.get("/student/dashboard/{matric_number:path}", tags=["Students"])
def get_student_dashboard(matric_number: str, db: Session = Depends(get_db)):
    
    # 1. Look up the student first!
    student = db.query(models.Student).filter(models.Student.matric_number == matric_number).first()
    
    # If the student doesn't exist, stop right here and send a 404
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Use the student's ID (not matric_number) to fetch their Grades
    grades = db.query(models.Grade).filter(models.Grade.student_id == student.id).all()

    # 3. Use the student's ID to fetch Attendance
    attendance = db.query(models.Attendance).filter(models.Attendance.student_id == student.id).all()
    total_days = len(attendance)
    # Notice I changed "Present" to lowercase "present" here to match our database fix from yesterday!
    present_days = sum(1 for a in attendance if getattr(a, 'status', '') == "Present")

    # 4. Fetch Payments
    payments = db.query(models.Payment).filter(models.Payment.student_id == student.id).all()
    total_paid = sum(p.amount for p in payments)
    
    # Assume a standard term fee for now (you can adjust this logic later)
    total_fee_required = 150000 
    
    return {
        "student_id": student.id, # Pass the ID back so React can use it for the Report Card!
        "student_name": f"{student.first_name} {student.last_name}",
        "attendance": {
            "total": total_days,
            "present": present_days
        },
        "finance": {
            "paid": total_paid,
            "balance": total_fee_required - total_paid
        },
        "grades": grades
    }

@app.post("/exams/{exam_id}/submit", tags=["Exams"])
def auto_grade_exam(exam_id: int, submission: schemas.ExamSubmission, db: Session = Depends(get_db)):
    """Receives student answers, auto-grades them, calculates percentage, and saves to Report Card!"""
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    # 1. The Auto-Grading Engine
    questions = exam.questions_data.get("objective", [])
    score = 0
    total_questions = len(questions)

    for index, q in enumerate(questions):
        correct_answer = q.get("correct_answer")
        student_answer = submission.answers.get(str(index))
        
        if student_answer == correct_answer:
            score += 1

    percentage = (score / total_questions) * 100 if total_questions > 0 else 0
    final_score = round(percentage, 1)

    # 2. AUTOMATICALLY SAVE TO REPORT CARD (models.Grade)
    try:
        # Determine a grade letter based on Nigerian grading standards
        if final_score >= 70: grade_letter = "A"
        elif final_score >= 60: grade_letter = "B"
        elif final_score >= 50: grade_letter = "C"
        elif final_score >= 45: grade_letter = "D"
        else: grade_letter = "F"

        new_grade = models.Grade(
            student_id=submission.student_id,
            subject=exam.topic,          # Uses the exam topic as the report card subject
            ca_score=0,                  # CBT counts directly as the main exam score here
            exam_score=final_score,
            total_score=final_score,
            grade_letter=grade_letter,
            term="1st",                  # Hardcoded for now; can be dynamic later
            academic_session="2025/2026" # Hardcoded to match your database session
        )
        db.add(new_grade)
        db.commit()
    except Exception as db_err:
        print(f"Database Sync Error: {str(db_err)}")

@app.post("/materials/upload", response_model=schemas.CourseMaterialResponse, tags=["E-Learning"])
def upload_course_material(material: schemas.CourseMaterialCreate, db: Session = Depends(get_db)):
    """Allows teachers to save curriculum lesson notes to the database."""
    try:
        new_material = models.CourseMaterial(
            class_name=material.class_name,
            subject=material.subject,
            topic=material.topic,
            content_text=material.content_text
        )
        db.add(new_material)
        db.commit()
        db.refresh(new_material)
        return new_material
    except Exception as e:
        db.rollback()
        print(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save course material.")

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


# 2. ADD THE FILE UPLOAD ROUTER
@app.post("/school/upload-logo", tags=["School Settings"])
async def upload_school_logo(file: UploadFile = File(...)):
    """Accepts an image file from the admin dashboard and overwrites the active logo asset."""
    # Validate the file type
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid format. Please upload a PNG or JPG image.")
    
    try:
        # Save file with a fixed name inside the static folder to cleanly overwrite old logos
        file_path = "static/school_logo.png"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Add a timestamp query parameter (?t=...) to force browsers to bust their image cache
        timestamp = int(time.time())
        logo_url = f"http://localhost:8000/static/school_logo.png?t={timestamp}"
        
        return {"status": "success", "logo_url": logo_url}
        
    except Exception as e:
        print(f"File Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save image asset to server storage.")

        
