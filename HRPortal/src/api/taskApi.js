import axios from 'axios';
import API_BASE_URL from '../config';
// const API_BASE_URL = '/api/task';

// Create axios instance with credentials enabled
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true // Enable sending cookies
});

// Create a new task
export const createTask = async (taskData, role) => {
    try {
        const response = await axiosInstance.post(`/api/task`, taskData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get all tasks with filters
export const getAllTasks = async (filters = {}) => {
    try {
        const response = await axiosInstance.get(`/api/task`, { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get task by ID
export const getTaskById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/task/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update task
export const updateTask = async (id, updates) => {
    try {
        const response = await axiosInstance.put(`/api/task/${id}`, updates);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete task
export const deleteTask = async (id) => {
    try {
        const response = await axiosInstance.delete(`/api/task/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Add comment to task
export const addComment = async (id, text) => {
    try {
        const response = await axiosInstance.post(`/api/task/${id}/comment`, { text });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Update comment on task
export const updateComment = async (taskId, commentIndex, text) => {
    try {
        const response = await axiosInstance.put(`/api/task/${taskId}/comment/${commentIndex}`, { text });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete comment from task
export const deleteComment = async (taskId, commentIndex) => {
    try {
        const response = await axiosInstance.delete(`/api/task/${taskId}/comment/${commentIndex}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get task statistics
export const getTaskStats = async () => {
    try {
        const response = await axiosInstance.get(`/api/task/stats`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
