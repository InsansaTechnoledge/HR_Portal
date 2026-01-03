# Warning control
import warnings
warnings.filterwarnings('ignore')

# Required installations:
# !pip install PyMuPDF python-docx crewai crewai-tools google-generativeai python-dotenv

import fitz  # PyMuPDF for PDF processing
import docx  # python-docx for DOCX processing
import os
from crewai import Agent, Task, Crew, LLM
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Any

# Load environment variables from .env file
load_dotenv()

# ============================================================================
# TEXT EXTRACTION FUNCTIONS
# ============================================================================

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            page_any: Any = page
            text += page_any.get_text()
    return text.strip()


def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join(para.text for para in doc.paragraphs)


def extract_text_from_resume(file_path):
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        return "Unsupported file format."

# ============================================================================
# API CONFIGURATION - GEMINI
# ============================================================================

gemini_api_key = os.getenv('GEMINI_API_KEY')
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=gemini_api_key)

llm = LLM(
    model="gemini/gemini-2.5-flash",
    api_key=gemini_api_key
)

# ============================================================================
# AGENT 1: ATS SCANNER
# ============================================================================

ats_scanner = Agent(
    role="ATS Resume Scanner Specialist",
    goal="Provide a short ATS score with key issues and improvements.",
    llm=llm,
    verbose=False,
    backstory="You are an ATS expert who gives concise, recruiter-friendly resume evaluations."
)

ats_scanning_task = Task(
    description="""Analyze the resume and provide a SHORT ATS evaluation.

Resume:
{resume}
""",
    expected_output="""
ATS SCORE: X/100

Top Issues:
- Issue 1
- Issue 2
- Issue 3

Top Improvements:
- Improvement 1
- Improvement 2
- Improvement 3
""",
    agent=ats_scanner
)

# ============================================================================
# AGENT 2: RESUME ADVISOR
# ============================================================================

resume_advisor = Agent(
    role="Professional Resume Writer",
    goal="Rewrite the resume to be ATS-friendly.",
    llm=llm,
    verbose=False,
    backstory="You rewrite resumes cleanly for ATS systems without explanations."
)

resume_advisor_task = Task(
    description="""Rewrite the resume to be ATS-friendly.
Fix formatting, keywords, and bullet points.
Do NOT explain anything.

Resume:
{resume}
""",
    expected_output="""
Return ONLY the improved resume in clean MARKDOWN.
No explanations.
No analysis.
Resume content only.
""",
    context=[ats_scanning_task],
    agent=resume_advisor
)

# ============================================================================
# AGENT 3: JOB ROLE ANALYZER
# ============================================================================

job_role_analyzer = Agent(
    role="Senior Career Counselor & Job Match Specialist",
    goal="Provide a short job-role fit analysis.",
    llm=llm,
    verbose=False,
    backstory="You give concise job-fit verdicts with strengths, gaps, and advice."
)

job_role_analysis_task = Task(
    description="""Analyze the resume for the job role: {job_role}.
Provide a SHORT evaluation only.
""",
    expected_output="""
Job Role: {job_role}
Match Score: X/100
Verdict: Apply / Maybe / Do Not Apply

Strengths:
- Point 1
- Point 2

Gaps:
- Gap 1
- Gap 2

Advice:
- 2–3 bullet points only
""",
    context=[resume_advisor_task],
    agent=job_role_analyzer
)

# ============================================================================
# CREW SETUP
# ============================================================================

full_crew = Crew(
    agents=[ats_scanner, resume_advisor, job_role_analyzer],
    tasks=[ats_scanning_task, resume_advisor_task, job_role_analysis_task],
    verbose=False,
    show_tasks=False
)

min_crew = Crew(
    agents=[ats_scanner, resume_advisor],
    tasks=[ats_scanning_task, resume_advisor_task],
    verbose=False,
    show_tasks=False
)

# ============================================================================
# EXECUTION
# ============================================================================

if __name__ == "__main__":
    resume_path = "Resumes/Baljit_Singh_Resume_SDE.pdf"
    resume_text = extract_text_from_resume(resume_path)

    crew_to_run = full_crew  # change to full_crew if needed

    raw_result = crew_to_run.kickoff(inputs={
        "resume": resume_text,
        "job_role": "Software Developer"
    })

    print("\n==================== FINAL RESULT ====================\n")

    if hasattr(raw_result, "tasks_output") and raw_result.tasks_output:
        for out in raw_result.tasks_output:
            print(out)
    else:
        result_text = getattr(raw_result, "output", None)
        if result_text:
            print(result_text.strip())
        else:
            print("⚠️ No final output returned. Check crew configuration.")

    print("\n======================================================\n")