import axios from 'axios';
import API_BASE_URL from '../config';

// Create axios instance with credentials enabled
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Create or Update Declaration
export const createOrUpdateDeclaration = async (declarationData) => {
    try {
        const response = await axiosInstance.post(`/api/investmentDeclaration/declaration`, declarationData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Submit Declaration
export const submitDeclaration = async (declarationId, employeeId) => {
    try {
        const response = await axiosInstance.post(`/api/investmentDeclaration/declaration/submit`, {
            declarationId,
            employeeId
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get Declaration by ID
export const getDeclarationById = async (declarationId) => {
    try {
        const response = await axiosInstance.get(`/api/investmentDeclaration/declaration/${declarationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get Declaration by Employee and Financial Year
export const getDeclarationByEmployee = async (employeeId, financialYear = '2025-26') => {
    try {
        const response = await axiosInstance.get(`/api/investmentDeclaration/declaration/employee`, {
            params: {
                employeeId,
                financialYear
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Get All Declarations (Admin only)
export const getAllDeclarations = async (filters = {}) => {
    try {
        const response = await axiosInstance.get(`/api/investmentDeclaration/declarations/all`, {
            params: filters
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Approve Declaration (Admin only)
export const approveDeclaration = async (declarationId, remarks = '') => {
    try {
        const response = await axiosInstance.put(`/api/investmentDeclaration/declaration/approve`, {
            declarationId,
            remarks
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Reject Declaration (Admin only)
export const rejectDeclaration = async (declarationId, remarks = '') => {
    try {
        const response = await axiosInstance.put(`/api/investmentDeclaration/declaration/reject`, {
            declarationId,
            remarks
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Delete Declaration (Admin only)
export const deleteDeclaration = async (declarationId) => {
    try {
        const response = await axiosInstance.delete(`/api/investmentDeclaration/declaration/${declarationId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
