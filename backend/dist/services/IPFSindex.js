import crypto from 'crypto';
import { MongoClient } from 'mongodb';
// Thêm Helia và các tiện ích
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
const dbName = 'metadata';
const collectionName = 'files';
export async function storeModeratedFile(buffer, fileName, fileType) {
    // 1. Kết nối MongoDB nếu chưa có
    if (!mongoClient.connect()) {
        await mongoClient.connect();
    }
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);
    // 2. Tạo IPFS client bằng Helia
    const helia = await createHelia();
    const fs = unixfs(helia);
    // 3. Upload file
    console.log('📤 Uploading to IPFS...');
    const cid = await fs.addBytes(buffer);
    const fileSize = buffer.length;
    // 4. Tạo metadata
    const metadata = {
        cid: cid.toString(),
        fileName,
        fileType,
        fileSize,
        uploadTimestamp: new Date()
    };
    // 5. Sinh SHA256 digest từ metadata
    const raw = JSON.stringify(metadata);
    const digest = crypto.createHash('sha256').update(raw).digest('hex');
    // 6. Lưu vào MongoDB
    await collection.insertOne({ ...metadata, digest });
    return { digest };
}
export default storeModeratedFile;
