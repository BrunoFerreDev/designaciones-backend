const BASE_URL = ""
let activeGlobalRequests = 0;
let activeTopBarRequests = 0;
const pendingGetRequests = new Map();

const getLoaderType = (config) => {
  if (config.showLoader === false || config.loaderType === "silent") {
    return "silent";
  }
  if (config.showLoader === true || config.loaderType === "global") {
    return "global";
  }
  return config.loaderType || "topbar";
};

const startLoading = (type) => {
  if (type === "global") {
    if (activeGlobalRequests === 0) {
      document.dispatchEvent(new CustomEvent("global-loader-show"));
    }
    activeGlobalRequests++;
  } else if (type === "topbar") {
    if (activeTopBarRequests === 0) {
      document.dispatchEvent(new CustomEvent("topbar-loader-show"));
    }
    activeTopBarRequests++;
  }
};

const stopLoading = (type) => {
  if (type === "global") {
    activeGlobalRequests--;
    if (activeGlobalRequests <= 0) {
      activeGlobalRequests = 0;
      document.dispatchEvent(new CustomEvent("global-loader-hide"));
    }
  } else if (type === "topbar") {
    activeTopBarRequests--;
    if (activeTopBarRequests <= 0) {
      activeTopBarRequests = 0;
      document.dispatchEvent(new CustomEvent("topbar-loader-hide"));
    }
  }
};

async function rawRequest(method, url, data = null, config = {}) {
  const loaderType = getLoaderType(config);
  startLoading(loaderType);

  const token = localStorage.getItem("jwt_token");
  const headers = {
    ...config.headers,
  };

  const isFormData = data instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let fullUrl = `${BASE_URL}${url}`;
  if (config.params && Object.keys(config.params).length > 0) {
    const queryParams = new URLSearchParams();
    for (const [key, val] of Object.entries(config.params)) {
      if (val !== undefined && val !== null) {
        queryParams.append(key, val);
      }
    }
    fullUrl += `?${queryParams.toString()}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = isFormData ? data : JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, options);

    if (response.status === 401) {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("user");
      window.location.href = "login.html";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      let errData = {};
      try {
        errData = await response.json();
      } catch (e) { }
      const error = new Error(errData.message || `HTTP error ${response.status}`);
      error.status = response.status;
      error.response = { data: errData, status: response.status };
      throw error;
    }

    let resultData = null;
    if (config.responseType === "blob") {
      resultData = await response.blob();
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        resultData = await response.json();
      } else {
        resultData = await response.text();
      }
    }

    return { data: resultData, status: response.status };
  } finally {
    stopLoading(loaderType);
  }
}

export const api = {
  get: (url, config = {}) => rawRequest("GET", url, null, config),
  post: (url, data = null, config = {}) => rawRequest("POST", url, data, config),
  put: (url, data = null, config = {}) => rawRequest("PUT", url, data, config),
  delete: (url, config = {}) => rawRequest("DELETE", url, null, config),
};

export const getDeduplicated = (url, config = {}) => {
  const requestKey = `${url}?${JSON.stringify(config.params || {})}`;
  if (pendingGetRequests.has(requestKey)) {
    return pendingGetRequests.get(requestKey);
  }

  const promise = api.get(url, config).finally(() => {
    pendingGetRequests.delete(requestKey);
  });

  pendingGetRequests.set(requestKey, promise);
  return promise;
};

export default api;
