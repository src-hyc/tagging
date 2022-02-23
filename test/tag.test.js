import { MongoClient } from 'mongodb';
import { Tagger } from '@tagging/tagger';

describe('Tagging', () => {
	let connection;
	let collection;
	let tagger;

	beforeAll(async () => {
		connection = await MongoClient.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
		});
		collection = connection.db("tagging").collection("tagging");
		tagger = new Tagger(collection);
	});

	afterAll(async () => {
		await connection.close();
	});

	test('Tag a key', async () => {
		await tagger.tagKey("key", [ "tag" ]);
		let result = await collection.findOne({ "_id": "key" });
		expect(result).toEqual({ "_id": "key", "tagSet": [ [ "tag" ] ] });
	});
});
