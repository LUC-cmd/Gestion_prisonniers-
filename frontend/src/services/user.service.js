// Simulation mode - No backend required
const MOCK_USERS_KEY = 'mock_users';

const getMockUsers = () => {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    return users ? JSON.parse(users) : [];
};

const getAllUsers = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: getMockUsers() });
        }, 500);
    });
};

const getActiveUsers = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const activeUsers = getMockUsers().filter(u => u.status === 'ACTIVE');
            resolve({ data: activeUsers });
        }, 500);
    });
};

const updateUserRoles = (userId, roles) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getMockUsers();
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                users[index].roles = roles;
                localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
            }
            resolve({ data: users[index] });
        }, 500);
    });
};

const updateUserStatus = (userId, status) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const users = getMockUsers();
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                users[index].status = status;
                localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
            }
            resolve({ data: users[index] });
        }, 500);
    });
};

const UserService = {
    getAllUsers,
    getActiveUsers,
    updateUserRoles,
    updateUserStatus,
};

export default UserService;

