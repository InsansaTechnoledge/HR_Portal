import mongoose from 'mongoose';

let bucket;

export const initGridFS = () => {
    if (bucket) return bucket;

    const db = mongoose.connection.db;
    bucket = new mongoose.mongo.GridFSBucket(db, {
        bucketName: 'investDocuments'
    });
    return bucket;
};

export const getGridFSBucket = () => {
    if (!bucket) {
        return initGridFS();
    }
    return bucket;
};
