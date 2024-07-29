import axios from "axios";

const axiosInterceptorInstance = axios.create({
  baseURL: "http://localhost:3004",
});

axiosInterceptorInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(config);
    return config;
  } catch (err) {
    return Promise.reject(err);
  }
});

axiosInterceptorInstance.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response.data.message === "Token expired") {
      try {
        const response = await axiosInterceptorInstance.post("/refreshToken", {
          token: localStorage.getItem("authToken"),
        });
        const newToken = response.data.token;
        if (response.data.token) {
          localStorage.setItem("authToken", newToken);
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `${newToken}`;
          console.log("originalRequest", originalRequest);
          return axiosInterceptorInstance(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

const axiosInterceptorInstance2 = axios.create({
  baseURL: "http://localhost:3005",
});

axiosInterceptorInstance2.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("authToken");
    if (token) {
      // config.headers.Authorization = `Bearer ${token}`;
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(config);
    return config;
  } catch (err) {
    return Promise.reject(err);
  }
});

axiosInterceptorInstance2.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response.data.message === "Token expired") {
      try {
        const response = await axiosInterceptorInstance2.post("/refreshToken", {
          token: localStorage.getItem("authToken"),
        });
        const newToken = response.data.token;
        if (response.data.token) {
          console.log("1", localStorage.getItem("authToken"));
          localStorage.setItem("authToken", newToken);
          console.log("2", localStorage.getItem("authToken"));
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `${newToken}`;
          console.log("originalRequest", originalRequest);
          return axiosInterceptorInstance2(originalRequest);
        }
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInterceptorInstance, axiosInterceptorInstance2 };
