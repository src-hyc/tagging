# Tagging

Tagging is a tagging library with JavaScript and MongoDB.

## Installation

Use the package manager [npm](https://www.npmjs.com) to install tagging.

```bash
npm i @src-hyc/tagging
```

## Usage

```javascript
import { Tagger } from '@src-hyc/tagging';

const tagger = new Tagger(collection);

tagger.tagKey("key", [ "tag" ]);
tagger.getKeysByTag([ "tag" ]); // returns [ "key" ]

tagger.tagKey("key2", [ "tag_parent", "tag_child" ]);
tagger.getKeysByParentTag([ "tag_parent" ]); // returns [ "key2" ]

// can also parse strings into tag of arrays
tagger.getKeysByTag("tag_parent/tag_child"); // returns [ "key2" ]
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
