const MOCK_PLANNING_KEY = 'mock_planning';

const getPlanning = () => {
    const planning = localStorage.getItem(MOCK_PLANNING_KEY);
    if (!planning) {
        const initialPlanning = [
            { id: 1, detaineeId: 1, detaineeName: 'DUPONT Jean', type: 'Transfert Externe', destination: 'Hôpital Central', time: '09:00', date: new Date().toISOString().split('T')[0], status: 'Confirmé' },
            { id: 2, detaineeId: 2, detaineeName: 'LEROI Marc', type: 'Transfert Interne', destination: 'Quartier C', time: '14:30', date: new Date().toISOString().split('T')[0], status: 'En attente' },
            { id: 3, detaineeId: 1, detaineeName: 'DUPONT Jean', type: 'Visite', visitor: 'Mme Dupont', time: '10:00', date: new Date().toISOString().split('T')[0], status: 'Confirmé' }
        ];
        localStorage.setItem(MOCK_PLANNING_KEY, JSON.stringify(initialPlanning));
        return initialPlanning;
    }
    return JSON.parse(planning);
};

const addPlanning = (planningData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const planning = getPlanning();
            const newEntry = {
                ...planningData,
                id: planning.length + 1,
                status: 'Confirmé'
            };
            planning.push(newEntry);
            localStorage.setItem(MOCK_PLANNING_KEY, JSON.stringify(planning));
            resolve({ data: newEntry });
        }, 500);
    });
};

const getAllPlanning = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: getPlanning() });
        }, 300);
    });
};

const PlanningService = {
    addPlanning,
    getAllPlanning
};

export default PlanningService;
