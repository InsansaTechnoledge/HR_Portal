from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import re
import json

from resume_agent import extract_text_from_resume, min_crew, full_crew, only_ats_crew

app = FastAPI(
    title="Resume Analyzer API",
    description="ATS Scan + Resume Rewrite + Job Match using CrewAI & Gemini",
    version="1.0.0"
)

# ---------------- CORS CONFIG ----------------
ENV = os.getenv("ENV", "development").lower()

frontend_origins = os.getenv("FRONTEND_ORIGINS") or os.getenv("FRONTEND_ORIGIN")
allow_origin_list = [
    o.strip()
    for o in (frontend_origins.split(",") if frontend_origins else [])
    if o.strip()
]

if ENV == "production":
    if not allow_origin_list:
        raise RuntimeError(
            "FRONTEND_ORIGINS or FRONTEND_ORIGIN must be set in production for CORS."
        )
else:
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
    lines = md_text.splitlines()
    cleaned_lines = []
    for line in lines:
        line = re.sub(r"^\s*#{1,6}\s*", "", line)
        line = re.sub(r"^\s*[-*+]\s+", "", line)
        line = line.replace("**", "").replace("*", "")
        cleaned_lines.append(line)
    return "\n".join(cleaned_lines).strip()


def format_output(raw_result):
    """
    DISPLAY ONLY:
    Structured JSON output without touching agent prompts
    """

    response = {
        "ats": {
            "score": None,
            "top_issues": [],
            "top_improvements": []
        },
        "ats_full_report": None,
        "resume_markdown": None,
        "job_fit": None
    }

    if not hasattr(raw_result, "tasks_output") or not raw_result.tasks_output:
        return {"error": "No readable output from CrewAI"}

    for out in raw_result.tasks_output:
        text = str(out)

        json_match = re.search(r"\{[\s\S]*\}", text)
        if not json_match:
            continue

        try:
            parsed = json.loads(json_match.group())
        except Exception:
            continue

        # ---------- ATS ----------
        if "ats" in parsed:
            response["ats_full_report"] = parsed["ats"]
            response["ats"]["score"] = parsed["ats"].get("overall_score")
            response["ats"]["top_issues"] = parsed["ats"].get("critical_issues", [])
            response["ats"]["top_improvements"] = parsed["ats"].get("recommendations", [])

        # ---------- RESUME ----------
        if "resume_markdown" in parsed:
            response["resume_markdown"] = parsed["resume_markdown"]

        # ---------- JOB FIT ----------
        if "job_fit" in parsed:
            response["job_fit"] = parsed["job_fit"]

    return response


# ---------------- ROUTES ----------------
@app.get("/")
async def home():
    return {"message": "Resume Analyzer API is running 🚀"}


@app.post("/analyze")
async def analyze_resume(
    resume_file: UploadFile = File(...),
    job_role: Optional[str] = Form("Software Developer"),
    crew: Optional[str] = Form("minimal")
):
    file_path = f"uploads/{resume_file.filename}"
    os.makedirs("uploads", exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(await resume_file.read())

    resume_text = extract_text_from_resume(file_path)

    crew_value = (crew or "minimal").lower()
    if crew_value == "minimal":
        crew_to_run = min_crew
    elif crew_value == "ats":
        crew_to_run = only_ats_crew
    else:
        crew_to_run = full_crew

    inputs = {"resume": resume_text}

    # Job role is only required/used for full analysis (job matching)
    if crew_value == "full":
        inputs["job_role"] = job_role or "Software Developer"

    raw_result = crew_to_run.kickoff(inputs=inputs)

    try:
        os.remove(file_path)
    except:
        pass

    return JSONResponse(content=format_output(raw_result))


# ---------------- MAIN ----------------
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Resume Analyzer API...")
    uvicorn.run("app:app", host="127.0.0.1", port=8000)