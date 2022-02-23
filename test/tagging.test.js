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

	test('Tag a key, then untag it', async () => {
		await tagger.tagKey("key2", [ "tag1" ]);
		let result = await collection.findOne({ "_id": "key2" });
		expect(result).toEqual({ "_id": "key2", "tagSet": [ [ "tag1" ] ] });

		await tagger.untagKey("key2", [ "tag1" ]);
		result = await collection.findOne({ "_id": "key2" });
		expect(result.tagSet.length).toEqual(0);
	});

	test('Multiple tag and untag', async () => {
		// tag a tag
		await tagger.tagKey("key3", [ "tag1" ]);
		let result = await collection.findOne({ "_id": "key3" });

		// tag another tag
		await tagger.tagKey("key3", [ "tag2" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ], [ "tag2" ] ]));
		expect(result.tagSet.length).toEqual(2);

		// tag an existing tag
		await tagger.tagKey("key3", [ "tag2" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ], [ "tag2" ] ]));
		expect(result.tagSet.length).toEqual(2);

		// untag a non-existing tag
		await tagger.untagKey("key3", [ "tag3" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ], [ "tag2" ] ]));
		expect(result.tagSet.length).toEqual(2);

		// untag a tag
		await tagger.untagKey("key3", [ "tag2" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ] ]));
		expect(result.tagSet.length).toEqual(1);

		// tagging an untagged tag
		await tagger.tagKey("key3", [ "tag2" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ], [ "tag2" ] ]));
		expect(result.tagSet.length).toEqual(2);

		// tag yet another tag
		await tagger.tagKey("key3", [ "tag3" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag1" ], [ "tag2" ], [ "tag3" ] ]));
		expect(result.tagSet.length).toEqual(3);

		// untag a tag with different order
		await tagger.untagKey("key3", [ "tag1" ]);
		result = await collection.findOne({ "_id": "key3" });
		expect(result.tagSet).toEqual(expect.arrayContaining([ [ "tag2" ], [ "tag3" ] ]));
		expect(result.tagSet.length).toEqual(2);
	});
});
