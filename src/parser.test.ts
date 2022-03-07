import { parseTag } from './parser.ts';

test('Parse a tag of 1 level', () => {
	expect(parseTag("tag")).toEqual([ "tag" ]);
});

test('Parse a tag of 2 levels', () => {
	expect(parseTag("tag_parent/tag_child")).toEqual([ "tag_parent", "tag_child" ]);
});

test('Parse a tag of 3 levels', () => {
	expect(parseTag("tag_level1/tag_level2/tag_level3")).toEqual([ "tag_level1", "tag_level2", "tag_level3" ]);
});

test('Invalid syntax', () => {
	// empty tag
	expect(() => {
		parseTag("");
	}).toThrow();

	// continuous separator
	expect(() => {
		parseTag("//");
	}).toThrow();
});
