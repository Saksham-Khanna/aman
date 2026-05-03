import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to attach the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (userData) => API.post('/auth/login', userData),
  updateProfile: (profileData) => API.put('/auth/profile', profileData),
  updatePassword: (passwordData) => API.put('/auth/password', passwordData),
};

export const taskAPI = {
  getTasks: () => API.get('/tasks'),
  createTask: (taskData) => API.post('/tasks', taskData),
  updateTask: (id, taskData) => API.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => API.delete(`/tasks/${id}`),
};

export const activityAPI = {
  getActivities: () => API.get('/activities'),
};

export const projectAPI = {
  getProjects: () => API.get('/projects'),
  createProject: (projectData) => API.post('/projects', projectData),
  updateProject: (id, projectData) => API.put(`/projects/${id}`, projectData),
  deleteProject: (id) => API.delete(`/projects/${id}`),
};

export const userAPI = {
  getUsers: () => API.get('/users'),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => API.delete(`/users/${id}`),
};

export const teamAPI = {
  getTeams: () => API.get('/teams'),
  createTeam: (teamData) => API.post('/teams', teamData),
  updateTeam: (id, teamData) => API.put(`/teams/${id}`, teamData),
  deleteTeam: (id) => API.delete(`/teams/${id}`),
};

export default API;
