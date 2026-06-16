import uuid
from sqlalchemy import Column, String, Date, Text, ForeignKey, Enum, Integer, Boolean, Float, JSON, DateTime
from sqlalchemy.orm import relationship
import enum
from database import Base
from datetime import datetime

# --- Enums ---
class UserRole(enum.Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"
    PARENT = "parent"

class AttendanceStatus(enum.Enum):
    PRESENT = "Present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"

# --- Core Identity ---
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False)
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False)

# --- School Entities ---
class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    matric_number = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(Date)
    medical_notes = Column(Text)
    
    # --- NEW QR TOKEN COLUMN ---
    qr_token = Column(String, unique=True, default=lambda: str(uuid.uuid4()), index=True) 

    user = relationship("User", back_populates="student_profile")
    attendance_records = relationship("Attendance", back_populates="student")
    grades = relationship("Grade", back_populates="student")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    department = Column(String)

    user = relationship("User", back_populates="teacher_profile")
    classes = relationship("Class", back_populates="class_teacher")

class Class(Base):
    __tablename__ = "classes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    class_teacher_id = Column(String, ForeignKey("teachers.id"))

    class_teacher = relationship("Teacher", back_populates="classes")
    attendance_records = relationship("Attendance", back_populates="school_class")

# --- Action Tables (The Data for the AI) ---
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=True)

    student = relationship("Student", back_populates="attendance_records")
    school_class = relationship("Class", back_populates="attendance_records")

class Grade(Base):
    __tablename__ = "grades"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    class_id = Column(String, ForeignKey("classes.id"), nullable=False)
    subject = Column(String, nullable=False)
    term = Column(String, nullable=False)
    academic_session = Column(String, nullable=False) # e.g., "2025/2026"
    
    # --- The Automated Computation Fields ---
    ca_score = Column(Float, default=0.0)
    exam_score = Column(Float, default=0.0)
    total_score = Column(Float, default=0.0)
    grade_letter = Column(String, nullable=True) 

    student = relationship("Student", back_populates="grades")
    # Optional but highly recommended:
    school_class = relationship("Class")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, index=True)  # e.g., "Basic 5"
    topic = Column(String)                   # e.g., "Photosynthesis"
    
    # We use JSON to store the list of questions, options, and correct answers easily!
    questions_data = Column(JSON)            
    
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True) # ID of the student who paid
    amount = Column(Float)
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_status = Column(String) # e.g., "Complete", "Part-Payment"
    term = Column(String) # e.g., "1st Term"
    session = Column(String) # e.g., "2025/2026"
    receipt_no = Column(String, unique=True) # Unique ID for the receipt

class CourseMaterial(Base):
    __tablename__ = "course_materials"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, index=True) # e.g., "Basic 5"
    subject = Column(String, index=True)    # e.g., "Basic Science"
    topic = Column(String, index=True)      # e.g., "Photosynthesis"
    content_text = Column(Text)             # The actual raw notes/lesson text
    created_at = Column(DateTime, default=datetime.utcnow)

