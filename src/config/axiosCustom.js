import axios from "axios";

const axiosCustom = axios.create({
  baseURL: "http://localhost:5024/api",
});

// Request interceptor
axiosCustom.interceptors.request.use(
  (config) => {
    // Chỉ set Content-Type là JSON khi KHÔNG phải FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    // Nếu là FormData thì để Axios tự động xử lý (kèm boundary)

    // Add token to header
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosCustom.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors here
    if (error.response) {
      // Server responded with an error status
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Request error:", error.request);
    } else {
      // Error in setting up the request
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosCustom;
