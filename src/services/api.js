import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001'
});

// Adjunta el token en cada petición
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si el token es inválido o venció, vuelve al login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes("/login")) {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;