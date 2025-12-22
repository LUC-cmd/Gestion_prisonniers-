// Simulation mode - No backend required
const MOCK_DETAINEES_KEY = 'mock_detainees';

const getMockDetainees = () => {
    const detainees = localStorage.getItem(MOCK_DETAINEES_KEY);
    if (!detainees) {
        const initialDetainees = [
            {
                id: 1, firstName: 'Jean', lastName: 'Dupont',
                arrivalDate: '2023-10-15', detentionType: 'Préventive',
                status: 'VALIDATED', medicalStatus: 'Bon', bloodType: 'A+',
                allergies: 'Aucune', cellNumber: 'B-102'
            },
            {
                id: 2, firstName: 'Marc', lastName: 'Leroi',
                arrivalDate: '2023-11-02', detentionType: 'Condamné',
                status: 'VALIDATED', medicalStatus: 'Critique', bloodType: 'O-',
                allergies: 'Pénicilline', cellNumber: 'A-205'
            },
            {
                id: 3, firstName: 'Paul', lastName: 'Bernard',
                arrivalDate: '2023-12-01', detentionType: 'Préventive',
                status: 'PENDING_VALIDATION', medicalStatus: 'Mauvais', bloodType: 'B+',
                allergies: 'Pollen', cellNumber: 'C-012'
            }
        ];
        localStorage.setItem(MOCK_DETAINEES_KEY, JSON.stringify(initialDetainees));
        return initialDetainees;
    }
    return JSON.parse(detainees);
};

const createDetainee = (detaineeData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const detainees = getMockDetainees();
            const newDetainee = {
                ...detaineeData,
                id: detainees.length + 1,
                status: 'PENDING_VALIDATION'
            };
            detainees.push(newDetainee);
            localStorage.setItem(MOCK_DETAINEES_KEY, JSON.stringify(detainees));
            resolve({ data: newDetainee });
        }, 800);
    });
};

const getAllDetainees = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: getMockDetainees() });
        }, 500);
    });
};

const updateDetaineeStatus = (detaineeId, status, adminComments) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const detainees = getMockDetainees();
            const index = detainees.findIndex(d => d.id === parseInt(detaineeId));
            if (index !== -1) {
                detainees[index].status = status;
                detainees[index].adminComments = adminComments;
                localStorage.setItem(MOCK_DETAINEES_KEY, JSON.stringify(detainees));
            }
            resolve({ data: detainees[index] });
        }, 500);
    });
};

const getDetaineeById = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const detainees = getMockDetainees();
            const detainee = detainees.find(d => d.id === parseInt(id));
            if (detainee) resolve({ data: detainee });
            else reject(new Error('Détenu non trouvé'));
        }, 300);
    });
};

const DetaineeService = {
    createDetainee,
    getAllDetainees,
    getDetaineeById,
    updateDetaineeStatus,
};

export default DetaineeService;

