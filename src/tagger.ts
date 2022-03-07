import type { Collection } from 'mongodb';

import { parseTag } from './parser';

export type Tag = Array<string>;

/** Tagger class stores taggings in a MongoDB collection */
export default class Tagger {
	private readonly collection: Collection;

	/**
	 * @param collection A MongoDB collection
	 */
	constructor(collection: Collection) {
		this.collection = collection;
	}

	/**
	 * Tag a key with a tag
	 * @param key Key to be tagged on
	 * @param tag Tag to be tagged
	 * @return Resolves on success, rejects on failure
	 */
	async tagKey(key: string, tag: Tag | string): Promise<undefined> {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
		return this.collection.updateOne(
			{ "_id": key },
			{
				$addToSet: { "tagSet": tag },
			},
			{ upsert: true },
		)
		.then(() => undefined);
	}

	/**
	 * Untag a tag from a key
	 * @param key Key to be untagged from
	 * @param tag Tag to be untagged
	 * @return Resolves on success, rejects on failure
	 */
	async untagKey(key: string, tag: Tag | string): Promise<undefined> {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
		return this.collection.updateOne(
			{ "_id": key},
			{
				$pull: { "tagSet": tag },
			},
		)
		.then(() => undefined);
	}

	/**
	 * Find keys with a given tag
	 * @param tag Tag to be used to find keys
	 * @return Resolves to keys with the given tag on success, rejects on failure
	 */
	async getKeysByTag(tag: Tag | string): Promise<Array<string>> {
		if (typeof tag === "string") {
			tag = parseTag(tag);
		}
		return this.collection.find({ "tagSet": tag }).toArray()
		.then(result => result.map(document => <string><unknown>document["_id"]));
	}

	/**
	 * Find keys with a given parent tag
	 * @param parentTag Parent tag to be used to find keys
	 * @return Resolves to keys with the given parent tag on success, rejects on failure
	 */
	async getKeysByParentTag(parentTag: Tag | string): Promise<Array<string>> {
		if (typeof parentTag === "string") {
			parentTag = parseTag(parentTag);
		}
		return this.collection.aggregate([
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
