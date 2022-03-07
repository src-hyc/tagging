import type { Tag } from './tagger';

type Token = { type: "separator" } | { type: "level", value: string };

function readTagLevel(tagString: string, begin: number) {
	let nextBegin = begin;
	while (nextBegin < tagString.length && tagString[nextBegin] != '/') {
		nextBegin++;
	}
	return { value: tagString.substring(begin, nextBegin), nextBegin };
}

function lex(tagString: string): Array<Token> {
	let index = 0;
	const token: Array<Token> = [];
	while (index < tagString.length) {
		switch (tagString[index]) {
			case '/': {
				token.push({ type: "separator" });
				index++;
				break;
			}
			default: {
				const { value, nextBegin } = readTagLevel(tagString, index);
				index = nextBegin;
				token.push({ type: "level", value });
				break;
			}
		}
	}
	return token;
}

function parse(tokenList: Array<Token>): Tag {
	if (tokenList.length === 0) {
		throw new Error("Empty tag");
	}
	let index = 0;
	const tag: Tag = [];
	let expect: "level" | "separator" = "level";
	do {
		const token = tokenList[index];
		switch (expect) {
			case "level": {
				if (token.type !== "level") {
					throw new Error(`Unexpected token ${token.type}`);
				}
				tag.push(token.value);
				expect = "separator";
				index++;
				break;
			}
			case "separator": {
				if (token.type !== "separator") {
					throw new Error("Unexpected token");
				}
				expect = "level";
				index++;
				break;
			}
		}
	} while (index < tokenList.length);
	return tag;
}

/**
 * Parse a tag from string
 * @param tagString The string to be parsed
 * @return Parsed tag
 * @throws {Error} Invalid tag
 */
export function parseTag(tagString: string): Tag {
	return parse(lex(tagString));
}
