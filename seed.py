import uuid
from database import SessionLocal
from models import User, Class, Student, Grade, UserRole

def seed_database():
    # Open a direct gateway to the database
    db = SessionLocal()
    try:
        print("🌱 Seeding database with fresh test data...")

        # 1. Create a dummy student user account to satisfy database integrity
        student_email = f"student_{uuid.uuid4().hex[:4]}@school.com"
        test_user = User(
            id=str(uuid.uuid4()),
            email=student_email,
            password_hash="fake_password_hash",  # Matches your model exactly!
            role=UserRole.STUDENT if hasattr(UserRole, 'STUDENT') else 'student',
            is_active=True
        )

        db.add(test_user)
        db.commit()

        # 2. Check if the Class already exists, if not create it
        test_class = db.query(Class).filter(Class.name == "Primary 4").first()
        if not test_class:
            test_class = Class(
                id=str(uuid.uuid4()),
                name="Primary 4"
            )
            db.add(test_class)
            db.commit()
            db.refresh(test_class)
        else:
            print("ℹ️ Class 'Primary 4' already exists, reusing it.")

        # 3. Create a Student linked to that class and user
        # 3. Create a Student linked to their user account
        test_student = Student(
            id=str(uuid.uuid4()),
            first_name="Mabel",
            last_name="Chidi",
            user_id=test_user.id
        )
        db.add(test_student)
        db.commit()
        db.refresh(test_student)

        # 4. Create an English Grade with high scores to test the AI pipeline
        test_grade = Grade(
            id=str(uuid.uuid4()),
            student_id=test_student.id,
            class_id=test_class.id,
            subject="English",
            term="2nd",
            academic_session="2025/2026",
            ca_score=35.0,
            exam_score=58.0,
            total_score=93.0,
            grade_letter="A"
        )
        db.add(test_grade)
        db.commit()

        # --- Beautiful Terminal Output ---
        print("\n" + "="*55)
        print("🎉 DATABASE SEEDED SUCCESSFULLY! 🎉")
        print("="*55)
        print(f"🏫 Class Created:   {test_class.name}")
        print(f"🎒 Student Created: {test_student.first_name} {test_student.last_name}")
        print(f"📊 Grade Inserted:  {test_grade.subject} -> Total: {test_grade.total_score} ({test_grade.grade_letter})")
        print("-"*55)
        print("🚀 COPY THIS STUDENT ID FOR YOUR AI ENDPOINT:")
        print(f"👉 {test_student.id} 👈")
        print("="*55 + "\n")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()