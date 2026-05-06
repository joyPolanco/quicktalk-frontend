import axios from 'axios'
import { CLIENT_URL } from '../../../backend/config/env.js';


export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development"
    ? "http://localhost:3000/api"
    : CLIENT_URL+"/api",
  withCredentials: true
});
