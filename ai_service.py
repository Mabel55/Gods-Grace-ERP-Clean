import os
from dotenv import load_dotenv
from google import genai  # <-- NEW SDK IMPORT

# Load your environment variables (Make sure GEMINI_API_KEY is in your .env file)
load_dotenv()

# Initialize the new Client
# (This automatically looks for the GEMINI_API_KEY environment variable)
client = genai.Client()

def generate_report_card_comment(first_name: str, performance_summary: str, attendance_summary: str) -> str:
    """
    Feeds the harvested database information to the LLM to generate a personalized comment.
    """
    
    system_prompt = f"""
    You are an expert, professional primary school educator. 
    Your task is to write a warm, encouraging, and highly professional end-of-term report card comment for a student named {first_name}.

    Here is the student's exact data for this term:
    
    ACADEMIC PERFORMANCE:
    {performance_summary}
    
    ATTENDANCE: 
    {attendance_summary}
    
    STRICT GUIDELINES:
    1. Keep the comment strictly between 3 to 4 sentences.
    2. Tone must be professional, empathetic, and suitable for parents to read.
    3. Start by praising their overall effort or attendance.
    4. Explicitly highlight their strongest subject based on the data.
    5. Gently and constructively suggest an area for improvement based on their lowest score.
    6. Do NOT invent or hallucinate any grades, subjects, or behaviors not provided in the data above.
    """

    try:
        # Using the NEW SDK syntax for generating content
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=system_prompt,
        )
        
        return response.text.strip()
    except Exception as e:
        # Fallback just in case the API is down or rate-limited during a demo
        print(f"AI Generation Error: {e}")
        return f"{first_name} has completed the term. Please refer to the subject grades for detailed performance."