import api from './api';

const API_URL = '/detainees'; // The base URL is in api.js

const createDetainee = (detaineeData) => {
    return api.post(API_URL, detaineeData);
};

const getAllDetainees = () => {
    return api.get(API_URL);
};

const updateDetaineeStatus = (detaineeId, status, adminComments) => {
    return api.put(`${API_URL}${detaineeId}/status`, adminComments, {
        params: { status: status }
    });
};

const DetaineeService = {
    createDetainee,
    getAllDetainees,
    updateDetaineeStatus,
};

export default DetaineeService;

