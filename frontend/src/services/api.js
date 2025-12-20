import axios from 'axios';
import AuthService from './auth.service';

const API_URL = 'http://localhost:8080/api/';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
      console.log("Interceptor: Attaching token:", user.token.substring(0, 10) + "...");
      config.headers['Authorization'] = 'Bearer ' + user.token;
    } else {
      console.log("Interceptor: No token found");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (err.response) {
      // Access Token was expired or invalid
      if (err.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;
        console.error("Token expiré ou invalide. Déconnexion et redirection vers la page de connexion.");

        AuthService.logout();
        window.location.href = '/login';

        // Return a pending promise to prevent the calling component's .catch() block from executing
        return new Promise(() => { });
      }
    }

    return Promise.reject(err);
  }
);

export default api;
