import { MongoClient } from 'mongodb';

export default class Tagger {
	#collection;

	constructor(collection) {
		this.#collection = collection;
	}

	async tagKey(key, tag) {
		return this.#collection.updateOne(
			{ "_id": key },
			{
				$addToSet: { "tagSet": tag },
			},
			{ upsert: true },
		);
	}
}
