import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (data: { name: string; email: string; password: string; role: string }) =>
  api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

// Notes
export const getNotes = (params?: { subject?: string; search?: string }) =>
  api.get("/notes/", { params });

export const getMyNotes = () => api.get("/notes/my");

export const getNote = (id: string) => api.get(`/notes/${id}`);

export const uploadNote = (formData: FormData) =>
  api.post("/notes/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const updateNote = (id: string, data: object) => api.put(`/notes/${id}`, data);

export const deleteNote = (id: string) => api.delete(`/notes/${id}`);

export const downloadNote = (id: string) => api.get(`/notes/${id}/download`);

// AI
export const aiSummarize = (noteId: string) => api.post(`/ai/summarize/${noteId}`);

export const aiAsk = (noteId: string, question: string) =>
  api.post(`/ai/ask/${noteId}`, { question });

export const aiQuiz = (noteId: string, numQuestions: number = 5) =>
  api.post(`/ai/quiz/${noteId}`, { num_questions: numQuestions });

export default api;
