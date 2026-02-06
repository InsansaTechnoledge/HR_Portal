import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import API_BASE_URL from "../../config";

function JobPostForm() {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/job/list`);

        if (response.status === 200 && response.data.jobs) {
          setJobs(response.data.jobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();

  }, [])



  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    skills: '',
    salary: ''
  });
  const [editingJob, setEditingJob] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Process skills into an array
    const processedSkills = formData.skills
      ? formData.skills.split(',').map(skill => skill.trim())
      : [];

    if (editingJob) {
      // Update existing job
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.jobId === editingJob.jobId
            ? {
              ...job,
              title: formData.title,
              location: formData.location,
              description: formData.description,
              skills: processedSkills,
              salary: formData.salary
            }
            : job
        )
      );
      setEditingJob(null);

      const updateJob = {

        jobTitle: formData.title,
        jobLocation: formData.location,
        jobDescription: formData.description,
        skills: formData.skills,
        salaryRange: formData.salary || "Not specified"
      }

      const response = await axios.put(`${API_BASE_URL}/api/job/update/${editingJob.jobId}`)
      if (response.status === 200) {
        alert(response.data.message);
      }


    } else {
      const newJob = {

        jobTitle: formData.title,
        jobLocation: formData.location,
        jobDescription: formData.description,
        skills: processedSkills,
        salaryRange: formData.salary || "Not specified"
      };

      try {


        const response = await axios.post(`${API_BASE_URL}/api/job/post`, newJob, {
          headers: {
            'content-type': 'application/json'
          }
        });
        if (response.status == 200) {
          alert('job Posted')
        }
        
      }
      catch (err) {
        console.log(err)
      }

      setJobs(prevJobs => [...prevJobs, newJob]);
    }

    setFormData({
      title: '',
      location: '',
      description: '',
      skills: '',
      salary: ''
    });
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      location: job.location,
      description: job.description,
      skills: job.skills.join(', '),
      salary: job.salary
    });
  };

  const handleDelete = async (jobId) => {
    setJobs(jobs.filter(job => job.jobId !== jobId));

    const response = await axios.delete(`${API_BASE_URL}/api/job/delete/${jobId}`);
    alert(response.data.message);

    // Reset index if needed
    if (currentIndex >= jobs.length - 1) {
      setCurrentIndex(Math.max(0, jobs.length - 2));
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? jobs.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === jobs.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Optional: Auto-advance carousel
  // useEffect(() => {
  //   const interval = setInterval(handleNext, 10000);
  //   return () => clearInterval(interval);
  // }, [currentIndex]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      {/* Job Posting Form */}
      <div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 mb-12">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-6">
          {editingJob ? "Edit Job" : "Post New Job"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="job-title"
              className="block text-sm font-medium text-gray-700"
            >
              Job Title
            </label>
            <input
              id="job-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="job-location"
              className="block text-sm font-medium text-gray-700"
            >
              Job Location
            </label>
            <input
              id="job-location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="job-description"
              className="block text-sm font-medium text-gray-700"
            >
              Job Description
            </label>
            <textarea
              id="job-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="job-skills"
              className="block text-sm font-medium text-gray-700"
            >
              Key Skills (comma-separated)
            </label>
            <input
              id="job-skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="e.g. React, Node.js, TypeScript"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="job-salary"
              className="block text-sm font-medium text-gray-700"
            >
              Salary Range
            </label>
            <input
              id="job-salary"
              name="salary"
              type="text"
              value={formData.salary}
              onChange={handleInputChange}
              placeholder="e.g. $120,000 - $150,000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editingJob ? "Update Job" : "Post Job"}
          </button>
        </form>
      </div>

      {/* Modern Job Carousel */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-12">
          Current Job Openings
        </h2>

        {jobs.length === 0 ? (
          <div className="text-center text-gray-500">
            No job openings available
          </div>
        ) : (
          <div className="relative">
            <AnimatePresence>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white shadow-2xl rounded-2xl overflow-hidden grid md:grid-cols-3 gap-8 p-8"
              >
                {/* Job Details Column */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-700">
                      {jobs[currentIndex].title}
                    </h3>
                    <p className="text-gray-500 mt-2">
                      {jobs[currentIndex].location}
                    </p>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    {jobs[currentIndex].description}
                  </p>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {jobs[currentIndex].skills.map((skill) => (
                        <span
                          key={skill}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-xl font-bold text-green-600">
                      {jobs[currentIndex].salary}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(jobs[currentIndex])}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(jobs[currentIndex].jobId)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Job Image/Icon Column */}
                <div className="hidden md:flex items-center justify-center">
                  <div className="bg-indigo-100 rounded-full p-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-24 w-24 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <button
                onClick={handlePrev}
                className="bg-white/50 hover:bg-white/75 backdrop-blur-sm rounded-full p-3 shadow-md transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                onClick={handleNext}
                className="bg-white/50 hover:bg-white/75 backdrop-blur-sm rounded-full p-3 shadow-md transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Pagination Dots */}
        {jobs.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            {jobs.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full transition-all ${index === currentIndex
                  ? 'bg-indigo-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobPostForm;