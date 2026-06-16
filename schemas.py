from pydantic import BaseModel, EmailStr, ConfigDict, Field, model_validator
from typing import Optional, List, Dict, Any
from datetime import date
from models import UserRole, AttendanceStatus
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    password: str  # Plain text password; we hash it in the backend later

class UserResponse(UserBase):
    id: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True) 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Student Schemas ---
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None

class StudentCreate(StudentBase):
    pass 

class StudentResponse(StudentBase):
    id: str
    user_id: str
    matric_number: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# --- Attendance Schemas (The AI Data Source) ---
class AttendanceCreate(BaseModel):
    student_id: str
    class_id: str
    date: date
    status: AttendanceStatus

class AttendanceResponse(AttendanceCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)

# --- Class Schemas ---
class ClassCreate(BaseModel):
    name: str
    class_teacher_id: Optional[str] = None 

class ClassResponse(ClassCreate):
    id: str

    model_config = ConfigDict(from_attributes=True)

# --- Grade Schemas ---
class GradeCreate(BaseModel):
    student_id: str
    class_id: str
    subject: str
    term: str
    academic_session: str
    ca_score: float = Field(default=0.0, ge=0, le=40)
    exam_score: float = Field(default=0.0, ge=0, le=60)
    total_score: Optional[float] = None
    grade_letter: Optional[str] = None

    @model_validator(mode='after')
    def compute_total_and_grade(self):
        self.total_score = self.ca_score + self.exam_score
        
        if self.total_score >= 70:
            self.grade_letter = 'A'
        elif self.total_score >= 60:
            self.grade_letter = 'B'
        elif self.total_score >= 50:
            self.grade_letter = 'C'
        elif self.total_score >= 40:
            self.grade_letter = 'D'
        else:
            self.grade_letter = 'F'
            
        return self

class GradeResponse(GradeCreate):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

# --- AI Comment Schemas ---
class CommentRequest(BaseModel):
    term: str
    academic_session: str

class CommentResponse(BaseModel):
    student_id: str
    term: str
    generated_comment: str

# --- Master Report Card Schemas ---
class SubjectGradeDetail(BaseModel):
    subject: str
    ca_score: float
    exam_score: float
    total_score: float
    grade_letter: str

class MasterReportCardResponse(BaseModel):
    student_id: str
    student_name: str
    class_name: str
    term: str
    academic_session: str
    grades: List[SubjectGradeDetail]
    ai_comment: str

    model_config = ConfigDict(from_attributes=True)

# What React sends to FastAPI
class ExamGenerateRequest(BaseModel):
    class_name: str
    topic: str
    num_questions: int = 5
    num_theory: int = 2

# What FastAPI sends back to React
class ExamResponse(BaseModel):
    id: int
    class_name: str
    topic: str
    questions_data: List[Dict[str, Any]]

# --- CBT Schemas ---
class ExamSubmission(BaseModel):
    student_id: str  # Changed to str to match your GradeCreate student_id type cleanly
    term: str        # e.g., "1st", "2nd", "3rd"
    academic_session: str  # e.g., "2025/2026"
    # A dictionary matching question index to their chosen string option
    answers: Dict[str, str]
    
class PaymentCreate(BaseModel):
    student_id: int
    amount: float
    payment_status: str
    term: str
    session: str
    receipt_no: str

class CourseMaterialCreate(BaseModel):
    class_name: str
    subject: str
    topic: str
    content_text: str

class CourseMaterialResponse(BaseModel):
    id: int
    class_name: str
    subject: str
    topic: str
    content_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class AIObjectiveQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class AITheoryQuestion(BaseModel):
    question: str
    marking_guide: str

class FullExamOutputSchema(BaseModel):
    objective: List[AIObjectiveQuestion]
    theory: List[AITheoryQuestion]
