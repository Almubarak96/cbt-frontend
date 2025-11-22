export const environment = {

    API_BASE: 'http://localhost:8080/',


    production: false,
    proctor: {
        apiBase: 'https://your-backend.example.com/api/proctor',
        faceDetectIntervalMs: 3000,
        snapshotIntervalMs: 20000,
        uploadChunkSizeBytes: 512 * 1024 // 512 KB
    }

};
