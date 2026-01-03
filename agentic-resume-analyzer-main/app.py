from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import re

from resume_agent import extract_text_from_resume, min_crew, full_crew

app = FastAPI(
    title="Resume Analyzer API",
    description="ATS Scan + Resume Rewrite + Job Match using CrewAI & Gemini",
    version="1.0.0"
)

# ---------------- CORS CONFIG ----------------
ENV = os.getenv("ENV", "development").lower()

# Read allowed frontend origins from env (supports comma-separated list)
frontend_origins = os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN")
allow_origin_list = [
    o.strip()
    for o in (frontend_origins.split(",") if frontend_origins else [])
    if o.strip()
]

if ENV == "production":
    # In production, require explicit allowed origins (no wildcards)
    if not allow_origin_list:
        raise RuntimeError(
            "FRONTEND_ORIGINS or FRONTEND_ORIGIN must be set in production for CORS."
        )
else:
    # In non-production, allow all if nothing specified for easier local dev
    if not allow_origin_list:
        allow_origin_list = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ---------------- HELPERS ----------------
def clean_markdown(md_text: str) -> str:
    """Remove basic Markdown markers (*, **, #) for a plain-text resume.

    This keeps content readable in the UI without raw Markdown symbols.
    """
    lines = md_text.splitlines()
    cleaned_lines = []
    for line in lines:
        # Remove heading markers like ###, ##, # at line start
        line = re.sub(r"^\s*#{1,6}\s*", "", line)
        # Remove bullet markers like -, *, + at line start
        line = re.sub(r"^\s*[-*+]\s+", "", line)
        # Remove bold/italic markers **, *
        line = line.replace("**", "").replace("*", "")
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()

def format_output(raw_result):
    """
    DISPLAY-ONLY change:
    Converts CrewAI output into structured JSON:
    - ATS analysis
    - Resume markdown
    - Job fit (if available)
    """

    # Combine all task outputs into one text
    if hasattr(raw_result, "tasks_output") and raw_result.tasks_output:
        combined_text = "\n".join(str(out) for out in raw_result.tasks_output)
    elif hasattr(raw_result, "output") and isinstance(raw_result.output, str):
        combined_text = raw_result.output
    else:
        return {"error": "No readable output from CrewAI"}

    response = {
        "ats": {
            "score": None,
            "top_issues": [],
            "top_improvements": []
        },
        "resume_markdown": None,
        "job_fit": None
    }

    # ================= ATS =================
    score_match = re.search(r"ATS SCORE:\s*(\d+/100)", combined_text)
    if score_match:
        response["ats"]["score"] = score_match.group(1)

    issues_match = re.search(
        r"Top Issues:\n(.+?)\n\nTop Improvements:",
        combined_text,
        re.S
    )
    if issues_match:
        response["ats"]["top_issues"] = [
            clean_markdown(re.sub(r"^[\-*\s]+", "", line)).strip()
            for line in issues_match.group(1).split("\n")
            if line.strip()
        ]

    improvements_match = re.search(
        r"Top Improvements:\n(.+?)(\n\n|\Z)",
        combined_text,
        re.S
    )
    if improvements_match:
        response["ats"]["top_improvements"] = [
            clean_markdown(re.sub(r"^[\-*\s]+", "", line)).strip()
            for line in improvements_match.group(1).split("\n")
            if line.strip()
        ]

    # ================= RESUME MARKDOWN =================
    resume_start = re.search(r"\*\*[A-Z][a-z]+ [A-Z][a-z]+\*\*", combined_text)
    if resume_start:
        raw_resume = combined_text[resume_start.start():].strip()
        response["resume_markdown"] = clean_markdown(raw_resume)

    # ================= JOB FIT (OPTIONAL) =================
    if "Job Role:" in combined_text:
        response["job_fit"] = "Job Role:" + combined_text.split("Job Role:", 1)[1].strip()

    return response


# ---------------- ROUTES ----------------
@app.get("/")
async def home():
    return {"message": "Resume Analyzer API is running 🚀"}


@app.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_role: Optional[str] = Form("Software Developer"),
    crew: Optional[str] = Form("minimal")  # minimal or full
):
    """Upload a resume + choose crew + get results."""

    # Save uploaded file temporarily
    file_path = f"uploads/{resume_file.filename}"
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as f:
        f.write(await resume_file.read())

    # Extract text
    resume_text = extract_text_from_resume(file_path)

    # Select crew
    crew_to_run = min_crew if crew.lower() == "minimal" else full_crew

    # Run analysis
    raw_result = crew_to_run.kickoff(inputs={
        "resume": resume_text,
        "job_role": job_role
    })

    # Optional cleanup
    try:
        os.remove(file_path)
    except:
        pass

    # Return structured output
    return JSONResponse(content=format_output(raw_result))


# ---------------- MAIN FUNCTION ----------------
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Resume Analyzer API...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000)