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
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
