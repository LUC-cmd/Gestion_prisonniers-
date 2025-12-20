import api from './api';

const API_URL = '/admin/'; // The base URL is in api.js

const getAllUsers = () => {
    return api.get(API_URL + 'users');
};

const getActiveUsers = () => {
    return api.get(API_URL + 'active-users');
};

const updateUserRoles = (userId, roles) => {
    return api.put(API_URL + `users/${userId}/roles`, { roles });
};

const updateUserStatus = (userId, status) => {
    return api.put(API_URL + `users/${userId}/status?status=${status}`, {});
};

const UserService = {
    getAllUsers,
    getActiveUsers,
    updateUserRoles,
    updateUserStatus,
};

export default UserService;

