import { MongoClient } from 'mongodb';

import { parseTag } from './parser.js';

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
	 * @param {!Array<string> | string} tag Tag to be tagged
	 * @return {!Promise<undefined>} Resolves on success, rejects on failure
	 * @throws {Error} Tag is invalid
	 */
	async tagKey(key, tag) {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
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
	 * @param {!Array<string> | string} tag Tag to be untagged
	 * @return {!Promise<undefined>} Resolves on success, rejects on failure
	 * @throws {Error} Tag is invalid
	 */
	async untagKey(key, tag) {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
		return this.#collection.updateOne(
			{ "_id": key},
			{
				$pull: { "tagSet": tag },
			},
		)
		.then(() => {});
	}

	/**
	 * Find keys with a given tag
	 * @param {!Array<string> | string} tag Tag to be used to find keys
	 * @return {!Promise<!Array<string>>} Resolves to keys with the given tag on success, rejects on failure
	 * @throws {Error} Tag is invalid
	 */
	async getKeysByTag(tag) {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
		return this.#collection.find({ "tagSet": tag }).toArray()
		.then(result => result.map(document => document["_id"]));
	}

	/**
	 * Find keys with a given parent tag
	 * @param {!Array<string> | string} parentTag Parent tag to be used to find keys
	 * @return {!Promise<!Array<string>>} Resolves to keys with the given parent tag on success, rejects on failure
	 * @throws {Error} Tag is invalid
	 */
	async getKeysByParentTag(parentTag) {
		if (typeof parentTag === "string") {
			parentTag = parseTag(parentTag);
		}
		return this.#collection.aggregate([
			{
				$unwind: "$tagSet",
			},
			{
				$project: {
					"tagSet": {
						$slice: [ "$tagSet", parentTag.length ],
					},
				},
			},
			{
				$match: {
					"tagSet": parentTag,
				},
			},
			{
				$group: {
					"_id": "$_id",
				},
			},
		]).toArray()
		.then(result => result.map(document => document["_id"]));
	}
}
