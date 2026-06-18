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
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = sessionStorage.getItem("token");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post("http://localhost:5024/api/Account/refresh-token", {
          accessToken: accessToken,
          refreshToken: refreshToken
        });

        if (res.data && res.data.accessToken) {
          sessionStorage.setItem("token", res.data.accessToken);
          sessionStorage.setItem("refreshToken", res.data.refreshToken);

          axiosCustom.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;

          return axiosCustom(originalRequest);
        }
      } catch (err) {
        console.error("Refresh token failed, logging out.");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // Handle errors here
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosCustom;
