// Simulation mode - No backend required
const MOCK_INCIDENTS_KEY = 'mock_incidents';

const getMockIncidents = () => {
    const incidents = localStorage.getItem(MOCK_INCIDENTS_KEY);
    return incidents ? JSON.parse(incidents) : [];
};

const getIncidents = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: getMockIncidents() });
        }, 500);
    });
};

const createIncident = (incidentData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const incidents = getMockIncidents();
            const newIncident = {
                ...incidentData,
                id: incidents.length + 1,
                createdAt: new Date().toISOString()
            };
            incidents.push(newIncident);
            localStorage.setItem(MOCK_INCIDENTS_KEY, JSON.stringify(incidents));
            resolve({ data: newIncident });
        }, 800);
    });
};

const IncidentService = {
    getIncidents,
    createIncident,
};

export default IncidentService;

