import { MongoClient } from 'mongodb';

/** Tagger class stores taggings in a MongoDB collection */
export default class Tagger {
	#collection;

	/**
	 * @param {Collection} collection A MongoDB collection
	 */
	constructor(collection) {
		this.#collection = collection;
	}

	/**
	 * Tag a key with a tag
	 * @param {string} key Key to be tagged on
	 * @param {!Array<string>} tag Tag to be tagged
	 * @return {!Promise<undefined>} Resolves on success, rejects on failure
	 */
	async tagKey(key, tag) {
		return this.#collection.updateOne(
			{ "_id": key },
			{
				$addToSet: { "tagSet": tag },
			},
			{ upsert: true },
		)
		.then(() => {});
	}

	/**
	 * Untag a tag from a key
	 * @param {string} key Key to be untagged from
	 * @param {!Array<string>} tag Tag to be untagged
	 * @return {!Promise<undefined>} Resolves on success, rejects on failure
	 */
	async untagKey(key, tag) {
		return this.#collection.updateOne(
			{ "_id": key},
			{
				$pull: { "tagSet": tag },
			},
		)
		.then(() => {});
	}
}
