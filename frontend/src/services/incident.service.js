import api from './api';

const API_URL = '/incidents/'; // The base URL is in api.js

const getIncidents = () => {
    return api.get(API_URL);
};

const createIncident = (incidentData) => {
    return api.post(API_URL, incidentData);
};

const IncidentService = {
    getIncidents,
    createIncident,
};

export default IncidentService;

