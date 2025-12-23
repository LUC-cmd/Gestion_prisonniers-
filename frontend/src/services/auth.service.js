// Simulation mode - No backend required
const MOCK_USERS_KEY = 'mock_users';

const getMockUsers = () => {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    if (!users) {
        const initialUsers = [
            { id: 1, username: 'admin', email: 'admin@prison.gov', password: 'password', roles: ['ROLE_ADMIN'], status: 'ACTIVE', photoUrl: '' },
            { id: 2, username: 'infirmier', email: 'infirmier@prison.gov', password: 'password', roles: ['ROLE_INFIRMIER'], status: 'ACTIVE', photoUrl: '' },
            { id: 3, username: 'personnel', email: 'staff@prison.gov', password: 'password', roles: ['ROLE_PERSONNEL'], status: 'ACTIVE', photoUrl: '' }
        ];
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(users);
};

const login = (username, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getMockUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                const userResponse = { ...user, accessToken: 'mock-jwt-token-' + Math.random() };
                localStorage.setItem('user', JSON.stringify(userResponse));
                resolve({ data: userResponse });
            } else {
                reject({ response: { data: { message: "Identifiants invalides !" } } });
            }
        }, 800);
    });
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const updateCurrentUser = (userData) => {
    const user = getCurrentUser();
    if (user) {
        const updatedUser = { ...user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Also update in mock users list
        const users = getMockUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
        }
        return updatedUser;
    }
    return null;
};

const AuthService = {
    login,
    logout,
    getCurrentUser,
    updateCurrentUser,
};

export default AuthService;
