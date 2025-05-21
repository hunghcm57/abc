import { create } from 'ipfs-http-client';
import { fetch } from 'undici';
import type { Options } from 'ipfs-http-client';
import { Readable } from 'stream';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

interface ExtendedOptions extends Options {
  fetch?: typeof fetch;
}

const ipfs = create({
  url: process.env.IPFS_API_URL || 'http://localhost:5001',
  fetch: (url, options) => fetch(url, { ...options, duplex: 'half' })
} as ExtendedOptions);


const mongoClient = new MongoClient(process.env.MONGO_URI || 'mongodb://localhost:27017');
const dbName = 'metadata';
const collectionName = 'files';

interface StoreResult {
  digest: string;
}

export async function storeModeratedFile(
  buffer: Buffer,
  fileName: string,
  fileType: string
): Promise<StoreResult> {
  // 1. Connect to MongoDB
  if (!mongoClient.connect()) {
    await mongoClient.connect();
  }

  const db = mongoClient.db(dbName);
  const collection = db.collection(collectionName);

  // 2. Upload file to IPFS
  console.log('Uploading to IPFS...');
  const fileStream = Readable.from(buffer);
  const fileSize = buffer.length;
  const result = await ipfs.add({ path: fileName, content: fileStream });
  const cid = result.cid.toString();

  // 4. Create metadata
  const metadata = {
    cid,
    fileName,
    fileType,
    fileSize,
    uploadTimestamp: new Date(),
  };

  // 5. Generate SHA256 digest
  const raw = JSON.stringify({
    cid,
    fileName,
    fileType,
    fileSize,
    // score,
  });

  const digest = crypto.createHash('sha256').update(raw).digest('hex');

  // 6. Insert metadata with digest into MongoDB
  await collection.insertOne({ ...metadata, digest });

  // ✅ 7. Return only digest
  return { digest };
}

export default storeModeratedFile;

