import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Award, Edit2, Trash2, Search } from 'lucide-react';
import API_BASE_URL from "../../config";

const JobPostingManager = () => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    skills: '',
    salary: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const processedSkills = formData.skills.split(',').map(skill => skill.trim()).filter(Boolean);

    const jobData = {
      jobTitle: formData.title,
      jobLocation: formData.location,
      jobDescription: formData.description,
      skills: processedSkills,
      salaryRange: formData.salary ? `${formData.salary}` : "Not specified"
    };

    try {
      if (currentJob) {
        await axios.put(`${API_BASE_URL}/api/job/update/${currentJob.jobId}`, jobData);
      } else {
        await axios.post(`${API_BASE_URL}/api/job/post`, jobData);
      }
      fetchJobs();
      resetForm();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      description: '',
      skills: '',
      salary: ''
    });
    setCurrentJob(null);
  };

  const handleEdit = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.jobTitle,
      location: job.jobLocation,
      description: job.jobDescription,
      skills: job.skills.join(', '),
      salary: job.salaryRange.replace('₹', '')
    });
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/job/delete/${jobId}`);
        fetchJobs();
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.jobLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Posting Management</h1>
          <p className="mt-2 text-gray-600">Manage Insansa's job opportunities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentJob ? "Edit Job Posting" : "Create New Job Posting"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="pl-10 w-full h-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent p-3"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g., React, Node.js, Python"
                    className="pl-10 w-full h-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Salary Range (₹)</label>
                <div className="relative">
                  <input
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., 5-7 LPA"
                    className="pl-10 w-full h-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 h-11 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {currentJob ? "Update Job Posting" : "Create Job Posting"}
                </button>
                {currentJob && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 h-11 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Job Listings */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Openings</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full h-11 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Scrollable Job Listings */}
            <div className="space-y-4 h-[400px] overflow-y-auto bg-gray-50 rounded-xl shadow-inner p-4">
              {filteredJobs.map(job => (
                <div key={job.jobId} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.jobTitle}</h3>
                      <p className="text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.jobLocation}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(job)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit job posting"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.jobId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete job posting"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-gray-600 line-clamp-2">{job.jobDescription}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-green-600 font-medium flex items-center">
                      ₹ {job.salaryRange}
                    </p>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">No job postings found</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobPostingManager;