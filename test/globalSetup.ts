import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
	const instance = await MongoMemoryServer.create();
	const uri = instance.getUri();
	global.__MONGOINSTANCE = instance;
	process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));
}
