import api from './api';

const API_URL = '/files/'; // The base URL is in api.js

const uploadFile = (file, onUploadProgress) => {
    let formData = new FormData();
    formData.append("file", file);

    return api.post(API_URL + 'upload', formData, {
        // The 'Content-Type' header will be set automatically by the browser
        // because we are sending FormData. The auth header is handled by the interceptor.
        onUploadProgress,
    });
};

const FileService = {
    uploadFile,
};

export default FileService;