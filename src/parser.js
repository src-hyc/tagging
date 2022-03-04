function readTagLevel(tagString, begin) {
	let nextBegin = begin;
	while (nextBegin < tagString.length && tagString[nextBegin] != '/') {
		nextBegin++;
	}
	return { value: tagString.substring(begin, nextBegin), nextBegin };
}

function lex(tagString) {
	let index = 0;
	let token = [];
	while (index < tagString.length) {
		switch (tagString[index]) {
			case '/':
				token.push({ type: "separator" });
				index++
				break;
			default:
				let { value, nextBegin } = readTagLevel(tagString, index);
				index = nextBegin;
				token.push({ type: "level", value });
				break;
		}
	}
	return token;
}

function parse(tokenList) {
	if (tokenList.length === 0) {
		throw new Error("Empty tag");
	}
	let index = 0;
	let tag = [];
	let expect = "level";
	do {
		let token = tokenList[index];
		switch (expect) {
			case "level":
				if (token.type !== "level") {
					throw new Error(`Unexpected token ${token.type}`);
				}
				tag.push(token.value);
				expect = "separator";
				index++;
				break;
			case "separator":
				if (token.type !== "separator") {
					throw new Error(`Unexpected token ${token.type}`);
				}
				expect = "level";
				index++;
				break;
		}
	} while (index < tokenList.length);
	return tag;
}

/**
 * Parse a tag from string
 * @param {string} tagString The string to be parsed
 * @return {!Array<string>} Parsed tag
 */
export function parseTag(tagString) {
	return parse(lex(tagString));
}
