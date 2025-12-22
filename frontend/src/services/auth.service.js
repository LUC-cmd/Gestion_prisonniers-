// Simulation mode - No backend required
const MOCK_USERS_KEY = 'mock_users';

const getMockUsers = () => {
    const users = localStorage.getItem(MOCK_USERS_KEY);
    if (!users) {
        const initialUsers = [
            { id: 1, username: 'admin', email: 'admin@prison.gov', password: 'password', roles: ['ROLE_ADMIN'], status: 'ACTIVE' },
            { id: 2, username: 'doctor', email: 'doctor@prison.gov', password: 'password', roles: ['ROLE_MEDECIN'], status: 'ACTIVE' },
            { id: 3, username: 'personnel', email: 'staff@prison.gov', password: 'password', roles: ['ROLE_PERSONNEL'], status: 'ACTIVE' }
        ];
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(users);
};

const register = (username, email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getMockUsers();
            if (users.find(u => u.username === username)) {
                reject({ response: { data: { message: "L'utilisateur existe déjà !" } } });
                return;
            }
            const newUser = {
                id: users.length + 1,
                username,
                email,
                password,
                roles: [], // Pending assignment
                status: 'ACTIVE'
            };
            users.push(newUser);
            localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
            resolve({ data: { message: "Utilisateur enregistré avec succès !" } });
        }, 800);
    });
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

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default AuthService;
