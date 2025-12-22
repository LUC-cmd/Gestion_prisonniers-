// Simulation mode - No backend required

const uploadFile = (file, onUploadProgress) => {
    return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (onUploadProgress) {
                onUploadProgress({ loaded: progress, total: 100 });
            }
            if (progress >= 100) {
                clearInterval(interval);
                resolve({ data: { message: "Fichier téléchargé avec succès !", fileName: file.name } });
            }
        }, 100);
    });
};

const FileService = {
    uploadFile,
};

export default FileService;