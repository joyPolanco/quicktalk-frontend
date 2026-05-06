import axios from 'axios'


export const axiosInstance = axios.create({
  baseURL:
  import.meta.env.CLIENT_URL+"/api",
  withCredentials: true
});
