import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SuccessToaster from "../Components/Toaster/SuccessToaser";
import ErrorToaster from "../Components/Toaster/ErrorToaster";
import {apibaseURl} from "../config"
import axios from "axios";

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const [resume_file, setResumeFile] = useState(null);
  const [job_role, setJobRole] = useState("");
  const [crew, setCrew] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setSuccessMessage("");
      setErrorMessage("");
      setIsLoading(true);

      if (!resume_file || !job_role || !crew) {
        setErrorMessage("Please fill all the details before submitting.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("resume_file", resume_file);
      formData.append("job_role", job_role);
      formData.append("crew", crew);

      console.log("Form Ready for API:", {
        resume_file,
        job_role,
        crew,
      });

      // API call
      const response = await axios.post(`${apibaseURl}/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          withCredentials: true,
        },
      });

      if (response.data.success || response.status === 200) {
        setSuccessMessage("Resume analyzed successfully!");
        console.log("Analysis Result:", response.data);
        
        // Navigate to results page after a short delay
        setTimeout(() => {
          navigate("/analysis-result", {
            state: {
              result: response.data,
              analysisType: crew,
            },
          });
        }, 1500);
      }
    } catch (error) {
      console.log("Error during resume analysis:", error);
      setErrorMessage("Failed to analyze resume. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Resume Analyzer</h1>

        {successMessage && <SuccessToaster message={successMessage} />}
        {errorMessage && <ErrorToaster message={errorMessage} />}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Upload */}
          <div>
            <label className="block font-medium mb-1">Upload Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="w-full border rounded-lg p-2"
            />
          </div>

          {/* Text Area */}
          <div>
            <label className="block font-medium mb-1">
              Job Description / Skills
            </label>
            <textarea
              rows="5"
              value={job_role}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Paste job Title here..."
              className="w-full border rounded-lg p-3"
            ></textarea>
          </div>

          {/* Dropdown */}
          <div>
            <label className="block font-medium mb-1">Analysis Type</label>
            <select
              value={crew}
              onChange={(e) => setCrew(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select</option>
              <option value="minimal">Minimal (rewrite + ATS)</option>
              <option value="full">Full (rewrite + job match)</option>
              <option value="ats">ATS Only</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
          >
            {isLoading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>
      </div>
    </div>
  );
}
