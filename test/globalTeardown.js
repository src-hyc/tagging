import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalTeardown() {
	const instance = global.__MONGOINSTANCE;
	await instance.stop();
};
