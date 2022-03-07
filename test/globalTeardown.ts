import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown() {
	const instance: MongoMemoryServer = global.__MONGOINSTANCE;
	await instance.stop();
}
