import axios from 'axios';

const apiClient = axios.create();

apiClient.interceptors.request.use(config => {
  console.log('Request', config.method?.toUpperCase(), config.url);
  return config;
});

apiClient.interceptors.response.use(
  response => {
    console.log('Response', response.status);
    return response;
  },
  error => {
    console.error('API error', error);
    return Promise.reject(error);
  }
);

export default apiClient;
