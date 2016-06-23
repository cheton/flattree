# flattree [![build status](https://travis-ci.org/cheton/flattree.svg?branch=master)](https://travis-ci.org/cheton/flattree) [![Coverage Status](https://coveralls.io/repos/github/cheton/flattree/badge.svg?branch=master)](https://coveralls.io/github/cheton/flattree?branch=master)

[![NPM](https://nodei.co/npm/flattree.png?downloads=true&stars=true)](https://www.npmjs.com/package/flattree)

Convert hierarchical tree structure to flat structure.
With a flat structure, it allows you to scroll a large tree easily using [Clusterize.js](https://github.com/NeXTs/Clusterize.js). 

Check out [infinite-tree](https://github.com/cheton/infinite-tree) to see how it integrated with [FlatTree](https://github.com/cheton/flattree) and [Clusterize.js](https://github.com/NeXTs/Clusterize.js).

## Installation

```bash
npm install --save flattree
```
## Examples

Given a hierarchical tree structure like [this](https://github.com/cheton/flattree/blob/master/test/fixtures/tree.json), you can build a tree in any form. For example:

### Flat List View
File: [examples/test1.js](https://github.com/cheton/flattree/blob/master/examples/tree1.js)
```
<root>: path=".0", parent="", children=2, total=11, depth=0, prefix="0", open=1, lastChild=1
Alpha: path=".0.0", parent=".0", children=0, total=0, depth=1, prefix="00", open=0, lastChild=0
Bravo: path=".0.1", parent=".0", children=3, total=9, depth=1, prefix="00", open=1, lastChild=1
Charlie: path=".0.1.0", parent=".0.1", children=2, total=4, depth=2, prefix="000", open=1, lastChild=0
Delta: path=".0.1.0.0", parent=".0.1.0", children=2, total=2, depth=3, prefix="0001", open=1, lastChild=0
Echo: path=".0.1.0.0.0", parent=".0.1.0.0", children=0, total=0, depth=4, prefix="00011", open=0, lastChild=0
Foxtrot: path=".0.1.0.0.1", parent=".0.1.0.0", children=0, total=0, depth=4, prefix="00011", open=0, lastChild=1
Golf: path=".0.1.0.1", parent=".0.1.0", children=0, total=0, depth=3, prefix="0001", open=0, lastChild=1
Hotel: path=".0.1.1", parent=".0.1", children=1, total=2, depth=2, prefix="000", open=1, lastChild=0
India: path=".0.1.1.0", parent=".0.1.1", children=1, total=1, depth=3, prefix="0001", open=1, lastChild=1
Juliet: path=".0.1.1.0.0", parent=".0.1.1.0", children=0, total=0, depth=4, prefix="00010", open=0, lastChild=1
Kilo: path=".0.1.2", parent=".0.1", children=0, total=0, depth=2, prefix="000", open=0, lastChild=1
```

### Nested Hierarchy
File: [examples/test2.js](https://github.com/cheton/flattree/blob/master/examples/tree2.js)
```
<root> (.0)
  ├── Alpha (.0.0)
  └─┬ Bravo (.0.1)
    ├─┬ Charlie (.0.1.0)
    | ├─┬ Delta (.0.1.0.0)
    | | ├── Echo (.0.1.0.0.0)
    | | └── Foxtrot (.0.1.0.0.1)
    | └── Golf (.0.1.0.1)
    ├─┬ Hotel (.0.1.1)
    | └─┬ India (.0.1.1.0)
    |   └── Juliet (.0.1.1.0.0)
    └── Kilo (.0.1.2)
```

### Single Root Node
File: [examples/test3.js](https://github.com/cheton/flattree/blob/master/examples/tree3.js)
```
- <root> (.0)
    Alpha (.0.0)
  - Bravo (.0.1)
    - Charlie (.0.1.0)
      + Delta (.0.1.0.0)
        Golf (.0.1.0.1)
    - Hotel (.0.1.1)
      - India (.0.1.1.0)
          Juliet (.0.1.1.0.0)
      Kilo (.0.1.2)
```

### Multiple Root Nodes
File: [examples/test4.js](https://github.com/cheton/flattree/blob/master/examples/tree4.js)
```
  Alpha (.0)
- Bravo (.1)
  - Charlie (.1.0)
    + Delta (.1.0.0)
      Golf (.1.0.1)
  - Hotel (.1.1)
    - India (.1.1.0)
        Juliet (.1.1.0.0)
    Kilo (.1.2)
```

## Usage
```js
var flatten = require('flattree').flatten;

var tree = { // tree can either be object or array
    id: 'fruit',
    label: 'Fruit',
    children: [
        { id: 'apple', label: 'Apple' },
        { id: 'banana', label: 'Banana', children: [{ id: 'cherry', label: 'Cherry' }] }
    ]
};

flatten(tree, {
    openNodes: ['fruit', 'banana'],
    openAllNodes: false, // Defaults to false
    throwOnEerror: false // Defaults to false
});
// → [Node { id: 'fruit', ...}, Node { id: 'apple', ...}, Node { id: 'banana', ...}, Node { id: 'cherry', ...}]
```

This demostrates how to open a node and rebuild the tree:
```js
var _ = require('lodash');
var flatten = require('flattree').flatten;

// Create the list
var nodes = flatten(require('./test/fixtures/tree.json'));
// → [Node { id: 'fruit', ...}]

// Find the first node with an id attribute that equals to 'fruit'
var index = _.findIndex(nodes, { 'id': 'fruit' });
var node = nodes[index];

var siblingNodes = flatten(node.children, { openNodes: ['fruit'] });

// Insert an array inside another array
nodes.splice.apply(nodes, [index + 1, 0].concat(siblingNodes));

console.log(nodes);
// → [Node { id: 'fruit', ...}, Node { id: 'apple', ...}, Node { id: 'banana', ...}]
```

This demostrates how to close a node and rebuild the tree:
```js
var _ = require('lodash');
var flatten = require('flattree').flatten;

// Create the list
var nodes = flatten(require('./test/fixtures/tree.json'), { openAllNodes: true });
// → [Node { id: 'fruit', ...}, Node { id: 'apple', ...}, Node { id: 'banana', ...}, Node { id: 'cherry', ...}]

// Find the first node with an id attribute that equals to 'banana'
var index = _.findIndex(nodes, { 'id': 'banana' });
var node = nodes[index];
var deleteCount = node.state.total;

// Traversing up through ancestors to subtract node.state.total
var p = node;
while (p) {
    p.state.total = (p.state.total - deleteCount);
    p = p.parent;
}

// Remove elements from an array
nodes.splice(index + 1, deleteCount);

console.log(nodes);
// → [Node { id: 'fruit', ...}, Node { id: 'apple', ...}, Node { id: 'banana', ...}]
```

## API
https://github.com/cheton/flattree/wiki/API

## License

Copyright (c) 2016 Cheton Wu

Licensed under the [MIT License](LICENSE).
