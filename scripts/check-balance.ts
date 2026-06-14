import "dotenv/config";
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';
async function main() {
  const client = createPublicClient({ chain: base, transport: http('https://mainnet.base.org') });
  const bal = await client.getBalance({ address: '0x22807e70fa9EC35aA5C6147513b309b5055b046F' });
  console.log('Oracle ETH balance:', formatEther(bal), 'ETH');
  // Also check how many markets already have addresses in MongoDB
  const { MongoClient } = await import('mongodb');
  const mongo = new MongoClient(process.env.MONGODB_URI!);
  await mongo.connect();
  const db = mongo.db('basebetz');
  const total = await db.collection('markets').countDocuments();
  const deployed = await db.collection('markets').countDocuments({ contractAddress: { $exists: true } });
  console.log(`MongoDB markets: ${total} total, ${deployed} with contractAddress`);
  await mongo.close();
}
main().catch(console.error);
