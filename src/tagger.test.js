import { MongoClient } from 'mongodb';
import { Tagger } from './index.js';

describe('Tagger', () => {
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

	test('Find keys with tags', async () => {
		// tag some tags
		await tagger.tagKey("key4", [ "tag4" ]);

		await tagger.tagKey("key5", [ "tag4" ]);
		await tagger.tagKey("key5", [ "tag5" ]);

		await tagger.tagKey("key6", [ "tag4" ]);
		await tagger.tagKey("key6", [ "tag5" ]);
		await tagger.tagKey("key6", [ "tag6" ]);

		// find keys with different tags
		let keys = await tagger.getKeysByTag([ "tag4" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key4", "key5", "key6" ]));
		expect(keys.length).toEqual(3);

		keys = await tagger.getKeysByTag([ "tag5" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key5", "key6" ]));
		expect(keys.length).toEqual(2);

		keys = await tagger.getKeysByTag([ "tag6" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key6" ]));
		expect(keys.length).toEqual(1);
	});

	test('Tag, untag, and find together', async () => {
		// tag a tag, then untag it
		await tagger.tagKey("key7", [ "tag7" ]);
		await tagger.untagKey("key7", [ "tag7" ]);
		let keys = await tagger.getKeysByTag([ "tag7" ]);
		expect(keys.length).toEqual(0);

		// tag two keys, then untag one
		await tagger.tagKey("key8", [ "tag8" ]);
		await tagger.tagKey("key9", [ "tag8" ]);
		await tagger.untagKey("key8", [ "tag8" ]);
		keys = await tagger.getKeysByTag([ "tag8" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key9" ]));
		expect(keys.length).toEqual(1);

		// tag a key with two tags, then untag one
		await tagger.tagKey("key10", [ "tag9" ]);
		await tagger.tagKey("key10", [ "tag10" ]);
		await tagger.untagKey("key10", [ "tag9" ]);
		keys = await tagger.getKeysByTag([ "tag9" ]);
		expect(keys.length).toEqual(0);
		keys = await tagger.getKeysByTag([ "tag10" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key10" ]));
		expect(keys.length).toEqual(1);
	});

	test('Tag with levels', async () => {
		// a key with a tag of two levels
		await tagger.tagKey("key11", [ "tag_parent", "tag_child" ]);
		let result = await collection.findOne({ "_id": "key11" });
		expect(result).toEqual({ "_id": "key11", "tagSet": [ [ "tag_parent", "tag_child" ] ] });

		let keys = await tagger.getKeysByParentTag([ "tag_parent" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key11" ]));
		expect(keys.length).toEqual(1);

		// another key with the same tag
		await tagger.tagKey("key12", [ "tag_parent", "tag_child" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key11", "key12" ]));
		expect(keys.length).toEqual(2);

		// a key with two tags having a same parent
		await tagger.tagKey("key13", [ "tag_parent1", "tag_child1" ]);
		await tagger.tagKey("key13", [ "tag_parent1", "tag_child2" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent1" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key13" ]));
		expect(keys.length).toEqual(1);

		// different numbers of levels
		await tagger.tagKey("key14", [ "tag_parent1" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent1" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key13", "key14" ]));
		expect(keys.length).toEqual(2);

		// parents with and without children
		await tagger.tagKey("key15", [ "tag_parent2", "tag_child_3" ]);
		await tagger.tagKey("key15", [ "tag_parent2" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent2" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key15" ]));
		expect(keys.length).toEqual(1);
		await tagger.untagKey("key15", [ "tag_parent2", "tag_child3" ]);
		await tagger.tagKey("key15", [ "tag_parent2" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent2" ]);
		expect(keys).toEqual(expect.arrayContaining([ "key15" ]));
		expect(keys.length).toEqual(1);
		await tagger.tagKey("key15", [ "tag_parent2" ]);
		keys = await tagger.getKeysByParentTag([ "tag_parent2", "tag_child3" ]);
		expect(keys.length).toEqual(0);
	});

	test('String tags', async() => {
		// tag a key by string
		await tagger.tagKey("key16", "tag11");
		let keys = await tagger.getKeysByTag([ "tag11" ]);
		expect(keys).toEqual([ "key16" ]);
		keys = await tagger.getKeysByTag("tag11");
		expect(keys).toEqual([ "key16" ]);

		// tag a key by string of tag with levels
		await tagger.tagKey("key17", "tag_level1/tag_level2/tag_level3");
		keys = await tagger.getKeysByParentTag("tag_level1/tag_level2");
		expect(keys).toEqual([ "key17" ]);
		keys = await tagger.getKeysByParentTag([ "tag_level1", "tag_level2" ]);
		expect(keys).toEqual([ "key17" ]);
	});
});
