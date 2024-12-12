import React, { useEffect, useState } from 'react';
import styles from './Form.module.css'; // Import the CSS module

// const API_BASE_URL = 'http://localhost:5001'; 

const API_BASE_URL = 'https://talentapply-1s9izbs7.b4a.run';

const JobForm = () => {
    const [jobTitle, setJobTitle] = useState('');
    const [jobLocation, setJobLocation] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`);
            if (!response.ok) throw new Error('Failed to fetch jobs.');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const locations = jobLocation.split(',').map((loc) => loc.trim());

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobTitle,
                    jobLocation: locations,
                    jobDescription,
                }),
            });

            if (!response.ok) throw new Error('Failed to create job');

            const data = await response.json();
            setSuccess(`Job posted successfully: ${data.jobTitle}`);
            setJobTitle('');
            setJobLocation('');
            setJobDescription('');
            fetchJobs();
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDelete = async (jobId) => {
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete job');

            setSuccess('Job deleted successfully');
            setJobs(jobs.filter((job) => job._id !== jobId));
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <div className={styles.container}>
                <h2>Post a New Job</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="jobTitle">Job Title:</label>
                        <input
                            id="jobTitle"
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="jobLocation">Job Location (comma separated):</label>
                        <input
                            id="jobLocation"
                            type="text"
                            value={jobLocation}
                            onChange={(e) => setJobLocation(e.target.value)}
                            required
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="jobDescription">Job Description:</label>
                        <textarea
                            id="jobDescription"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            required
                            className={styles.textarea}
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={loading}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </button>
                </form>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <h2 className={styles.jobList}>Existing Jobs</h2>
                {loading ? (
                    <p>Loading jobs...</p>
                ) : (
                    <ul className={styles.jobList}>
                        {jobs.map((job) => (
                            <li key={job._id} className={styles.jobItem}>
                                <strong>{job.jobTitle}</strong>
                                <p>Location: {job.jobLocation.join(', ')}</p>
                                <p>{job.jobDescription}</p>
                                <button className={styles.deleteButton} onClick={() => handleDelete(job._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
};

export default JobForm;
