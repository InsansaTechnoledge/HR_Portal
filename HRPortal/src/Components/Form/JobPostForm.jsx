import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Award, Edit2, Trash2, Search, Building2, Plus, Save, X, Users, IndianRupee, Loader, Loader2 } from 'lucide-react';
import API_BASE_URL from "../../config";
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Dialog, DialogDescription, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from '../../hooks/useToast';

const JobPostingManager = () => {
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    description: "",
    skills: "",
    salary: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  /* ================= FETCH JOBS ================= */
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/job/list`);
      if (res.status === 200) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching jobs", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch job postings.",
      }); 
    }
  };

  /* ================= FORM HANDLERS ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      description: "",
      skills: "",
      salary: "",
    });
    setCurrentJob(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const processedSkills = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      jobTitle: formData.title,
      jobLocation: formData.location,
      jobDescription: formData.description,
      skills: processedSkills,
      salaryRange: formData.salary || "Not specified",
    };
    

    try {
      const res = currentJob
        ? await axios.put(
            `${API_BASE_URL}/api/job/update/${currentJob.jobId}`,payload
          )
        : await axios.post(`${API_BASE_URL}/api/job/post`, payload);
      // if (currentJob) {
      //   const res = await axios.put(
      //     `${API_BASE_URL}/api/job/update/${currentJob.jobId}`,
      //     payload
      //   );
      // } else {
      //   await axios.post(`${API_BASE_URL}/api/job/post`, payload);
      // }
      if(res && res.status === 200){
        toast({
          variant: "success",
          title: currentJob ? "Job updated" : "Job posted",
          description: `The job has been successfully ${currentJob ? 'updated' : 'posted'}.`,
        });
      }
      fetchJobs();
      resetForm();
      setLoading(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: currentJob ? "Failed to update job." : "Failed to post job.",
      }); 
      setLoading(false);
      console.error("Error saving job", err);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (job) => {
    setCurrentJob(job);
    setFormData({
      title: job.jobTitle,
      location: job.jobLocation,
      description: job.jobDescription,
      skills: job.skills.join(", "),
      salary: job.salaryRange,
    });
  };

  /* ================= DELETE ================= */
  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_BASE_URL}/api/job/delete/${jobToDelete.jobId}`
      );
      if(res.status === 200){
        toast({
          variant: "success", 
          title: "Job deleted",
          description: "The job posting has been successfully deleted.",
        });
      }
      fetchJobs();
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete job posting.",
      });
      setLoading(false);
      console.error("Error deleting job", err);
    }finally {
      setLoading(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredJobs = jobs.filter(
    (job) =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Job Posting Management</h1>
            <p className="text-muted-foreground">Create and manage job opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{jobs.length} Active Jobs</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Job Form */}
          <Card className="border-0 shadow-card h-fit">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-info/5 border-b border-border">
              <CardTitle className="flex items-center gap-2">
                {currentJob ? (
                  <>
                    <Edit2 className="w-5 h-5 text-primary" />
                    Edit Job Posting
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-primary" />
                    Create New Job Posting
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {currentJob ? 'Update the job details below' : 'Fill in the details for the new position'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Software Engineer"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Vadodara, Gujarat or Remote"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input id="department" placeholder="e.g. Engineering" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Employment Type</Label>
                  <Input id="type" placeholder="e.g. Full-time, Part-time" />
                </div> */}

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the role, responsibilities, and what success looks like..."
                    className="min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, Node.js, Python (comma separated)"
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="salary"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="e.g. 80,000 - 120,000"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {currentJob ? (loading ? 'Updating...' : 'Update Job') : (loading ? 'Posting...' : 'Post Job')}
                  </Button>
                  {currentJob && (
                    <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="space-y-4">
            {/* Search */}
            <Card className="border-0 shadow-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, location, or skill..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            <Card className="border-0 shadow-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Current Openings ({filteredJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto divide-y divide-border">
                  {filteredJobs.map(job => (
                    <div 
                      key={job.jobId} 
                      className="p-5 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-foreground truncate">{job.jobTitle}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span>{job.jobLocation}</span>
                            <span className="text-border">•</span>
                            <span className="text-success font-medium">₹ {job.salaryRange}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {job.jobDescription}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {job.skills.map((skill, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary"
                                className="bg-primary/10 text-primary border-primary/20 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(job)}
                            className="text-primary hover:bg-primary/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteClick(job)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredJobs.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No job postings found</p>
                      <p className="text-sm">Create a new job posting to get started</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Job Posting
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the job posting for <strong>{jobToDelete?.jobTitle}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? ("Deleting...") : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPostingManager;