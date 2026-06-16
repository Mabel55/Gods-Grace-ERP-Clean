from database import SessionLocal
from models import Student, Grade, Attendance
import ai_service

def check_master_report():
    db = SessionLocal()
    
    # The ID from your last seed.py run!
    student_id = "0d51cab7-1faf-4a19-aa9f-d8f62dfb6f38" 

    try:
        print("\n" + "="*60)
        print("🏫 FETCHING MASTER REPORT CARD...")
        print("="*60)

        # 1. Get Student
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            print("❌ Student not found.")
            return

        # 2. Get Grades
        grades = db.query(Grade).filter(Grade.student_id == student_id).all()
        
        # 3. Get Attendance
        attendance_records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
        total_days = len(attendance_records)
        days_present = sum(1 for r in attendance_records if r.status.value == "present")

        # Summaries for AI
        perf_summary = "\n".join([f"- {g.subject}: {g.total_score}% (Grade: {g.grade_letter})" for g in grades])
        att_summary = f"Attended {days_present} out of {total_days} recorded days."

        print("🧠 Calling AI Engine to write comment...\n")
        
        # 4. Generate Comment
        try:
            ai_comment = ai_service.generate_report_card_comment(
                first_name=student.first_name,
                performance_summary=perf_summary,
                attendance_summary=att_summary
            )
            # Extract text whether it returns a Pydantic model or a string
            final_text = ai_comment.generated_comment if hasattr(ai_comment, 'generated_comment') else str(ai_comment)
        except Exception as e:
            final_text = f"AI Error: {e}"

        # --- PRINT THE BEAUTIFUL RESULT ---
        print("🎓 STUDENT: " + f"{student.first_name} {student.last_name}".upper())
        print("-" * 60)
        print("📊 GRADES:")
        for g in grades:
            print(f"   • {g.subject}: {g.total_score}% ({g.grade_letter})")
        
        print("\n🤖 AI PRINCIPAL'S REMARK:")
        print(f"   \"{final_text}\"")
        print("="*60 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    check_master_report()