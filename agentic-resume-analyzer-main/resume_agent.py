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
    goal="Perform comprehensive ATS (Applicant Tracking System) scanning of the resume and provide a detailed score out of 100 with specific deductions marked.",
    llm=llm,
    verbose=False,
    backstory="""You are an expert ATS system analyzer with deep knowledge of how modern Applicant Tracking Systems parse and score resumes. 
    You understand keyword optimization, formatting issues, section structure, and what makes a resume ATS-friendly. 
    You provide detailed breakdowns of scoring with specific point deductions."""
)

ats_scanning_task = Task(
    description="""Perform a comprehensive ATS scan of the resume and provide a detailed score out of 100.
        
        Evaluate the following criteria and assign points:
        1. **Format & Structure (20 points)**: Clean formatting, proper sections, no images/tables blocking text
        2. **Keywords & Skills (25 points)**: Relevant industry keywords, technical skills, tools mentioned
        3. **Work Experience (20 points)**: Clear job titles, companies, dates, quantifiable achievements
        4. **Contact Information (10 points)**: Complete contact details, LinkedIn, professional email
        5. **Education (10 points)**: Degrees, institutions, relevant certifications
        6. **Action Verbs & Impact (10 points)**: Strong action verbs, measurable results
        7. **Grammar & Spelling (5 points)**: Error-free content
        
        For EACH criterion:
        - Assign actual points earned
        - Specify points deducted and WHY
        - Provide specific examples from the resume
        
        This is the resume: {resume}""",
    expected_output="""A detailed ATS score report in the following format:
    
    **OVERALL ATS SCORE: X/100**
    
    **DETAILED SCORING BREAKDOWN:**
    
    1. Format & Structure: X/20
       - Points Deducted: Y points
       - Reason: [Specific issues found]
       - Examples: [Specific problems in resume]
    
    2. Keywords & Skills: X/25
       - Points Deducted: Y points
       - Reason: [Missing keywords, weak skills section]
       - Examples: [What's missing]
    
    [Continue for all 7 criteria]
    
    **CRITICAL ISSUES:**
    - [List of major problems affecting ATS parsing]
    
    **RECOMMENDATIONS:**
    - [Specific actionable improvements]
    ------------------------------
FINAL OUTPUT FORMAT (MANDATORY)

After completing the full ATS analysis exactly as requested above,
RETURN THE SAME CONTENT STRICTLY IN JSON FORMAT BELOW.

Do NOT remove any information.
Do NOT summarize.
Do NOT add new analysis.

JSON FORMAT:

{
  "ats": {
    "overall_score": "X/100",
    "detailed_breakdown": [
      {
        "section": "Format & Structure",
        "score": "X/20",
        "points_deducted": number,
        "reason": "string",
        "examples": ["string"]
      }
    ],
    "critical_issues": ["string"],
    "recommendations": ["string"]
  }
}
------------------------------""",
    agent=ats_scanner
)

# ============================================================================
# AGENT 2: RESUME ADVISOR
# ============================================================================

resume_advisor = Agent(
    role="Professional Resume Writer",
    goal="Based on the ATS scan feedback, rewrite and improve the resume to make it ATS-friendly and stand out to recruiters.",
    llm=llm,
    verbose=False,
    backstory="""With a strategic mind and an eye for detail, you excel at refining resumes based on ATS feedback. 
    You know how to highlight relevant skills and experiences while ensuring the resume passes ATS systems with high scores."""
)

resume_advisor_task = Task(
    description="""Rewrite the resume based on the ATS scanning feedback to make it ATS-friendly and stand out for recruiters. 
        
        Focus on:
        - Fixing all formatting issues identified in ATS scan
        - Adding missing keywords and optimizing existing ones
        - Improving action verbs and quantifiable achievements
        - Ensuring proper section structure
        - Making content more impactful while staying truthful
        
        You can enhance and adjust the resume but don't fabricate facts. This is the resume: {resume}""",
    expected_output="""An improved resume in markdown format that addresses all ATS issues and effectively highlights the candidate's qualifications
    ------------------------------
FINAL OUTPUT FORMAT (MANDATORY)

After rewriting the resume exactly as requested above,
RETURN ONLY THE FINAL RESUME IN JSON FORMAT.

Do NOT include explanations.
Do NOT include analysis.
Do NOT include ATS feedback.

JSON FORMAT:

{
  "resume_markdown": "FULL RESUME IN MARKDOWN FORMAT"
}
------------------------------""",
    context=[ats_scanning_task],
    agent=resume_advisor
)

# ============================================================================
# AGENT 3: JOB ROLE ANALYZER
# ============================================================================

job_role_analyzer = Agent(
    role="Senior Career Counselor & Job Match Specialist",
    goal="Analyze if the candidate has relevant skills, experience, and qualifications for the specified job role. Provide gap analysis and recommendations.",
    llm=llm,
    verbose=False,
    backstory="""You are an experienced career counselor who specializes in matching candidates to job roles. 
    You have deep understanding of various industries and can accurately assess if a candidate's background aligns with job requirements. 
    You provide honest, constructive feedback about skill gaps and career development paths."""
)

job_role_analysis_task = Task(
    description= """Analyze the improved resume against the specified job role: {job_role}
        
        Provide a comprehensive analysis covering:
        
        1. **Overall Match Score (0-100)**: How well does the candidate fit this role?
        
        2. **Skills Analysis:**
           - Required skills for {job_role} that candidate HAS
           - Required skills that candidate is MISSING
           - Transferable skills from candidate's background
        
        3. **Experience Analysis:**
           - Relevant experience that matches the role
           - Experience gaps or insufficient background areas
           - Years of experience vs. typical requirements
        
        4. **Qualifications Analysis:**
           - Educational background fit
           - Certifications (present/missing)
           - Industry knowledge
        
        5. **Strengths for This Role:**
           - Top 3-5 reasons to hire this candidate
        
        6. **Red Flags/Concerns:**
           - What might concern recruiters?
           - Any deal-breakers?
        
        7. **Development Recommendations:**
           - Skills to acquire
           - Certifications to pursue
           - Experience to gain
        
        8. **Application Strategy:**
           - Should they apply? (Yes/No/Maybe with conditions)
           - How to position their application
           - What to emphasize in cover letter""",
    expected_output="""A comprehensive job role fit analysis report with:
    - Overall match score and verdict
    - Detailed skills gap analysis
    - Experience alignment assessment
    - Specific strengths and concerns
    - Actionable career development recommendations
    - Strategic application advice
    ------------------------------
FINAL OUTPUT FORMAT (MANDATORY)

After completing the full job-role analysis exactly as requested above,
RETURN THE SAME CONTENT STRICTLY IN JSON FORMAT.

Do NOT remove details.
Do NOT summarize further.

JSON FORMAT:

{
  "job_fit": {
    "job_role": "string",
    "match_score": "X/100",
    "verdict": "Apply | Maybe | Do Not Apply",
    "strengths": ["string"],
    "gaps": ["string"],
    "recommendations": ["string"]
  }
}
------------------------------""",
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
only_ats_crew = Crew(
    agents=[ats_scanner],
    tasks=[ats_scanning_task],
    verbose=False,
    show_tasks=False
)

# ============================================================================
# EXECUTION
# ============================================================================

if __name__ == "__main__":
    resume_path = ""
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