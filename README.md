# flattree [![build status](https://travis-ci.org/cheton/flattree.svg?branch=master)](https://travis-ci.org/cheton/flattree) [![Coverage Status](https://coveralls.io/repos/cheton/flattree/badge.svg)](https://coveralls.io/r/cheton/flattree)
[![NPM](https://nodei.co/npm/flattree.png?downloads=true&stars=true)](https://nodei.co/npm/flattree/)

Convert hierarchical tree structure to flat structure.
With a flat structure, it allows you to scroll a large tree easily using [Clusterize.js](https://github.com/NeXTs/Clusterize.js).

## Installation

```bash
npm install --save flattree
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
var nodes = flatten(tree, {
    openNodes: ['fruit', 'banana'],
    openAllNodes: false, // Defaults to false
    throwOnEerror: false // Defaults to false
});
console.log(nodes);
```

This demostrates how to close a node and rebuild the list:
```js
var _ = require('lodash');
var flatten = require('flattree').flatten;

// Create the list
var nodes = flatten(require('./test/fixtures/tree.json'), { openAllNodes: true });

// Find the first node with an id attribute that equals to 'banana'
var index = _.findIndex(nodes, { 'id': 'banana' });
var node = nodes[index];

if (node.state.depth > 0) { // (node.state.depth > 0)
    var parentIndex = _.lastIndexOf(nodes, node.parent, index);
    var parent = nodes[parentIndex];
    var previousTotal = parent.state.total;

    // Close the node by passing empty options
    var siblingNodes = flatten(node);
    // The above will return all of its sibling nodes if the node's parent have two or more child nodes.

    // Rebuild the list
    nodes.splice.apply(nodes, [parentIndex + 1, previousTotal].concat(siblingNodes));
} else { // (node.state.depth === 0)
    nodes.splice(index + 1, node.state.total);
    node.state.open = false;
    node.state.total = 0;
}

console.log(nodes);
```

## Examples

Given a hierarchical tree structure like below:

```json
{
  "id": "<root>",
  "label": "<root>",
  "children": [
    {
      "id": "alpha",
      "label": "Alpha"
    },
    {
      "id": "bravo",
      "label": "Bravo",
      "children": [
        {
          "id": "charlie",
          "label": "Charlie",
          "children": [
            {
              "id": "delta",
              "label": "Delta",
              "children": [
                {
                  "id": "echo",
                  "label": "Echo"
                },
                {
                  "id": "foxtrot",
                  "label": "Foxtrot"
                }
              ]
            },
            {
              "id": "golf",
              "label": "Golf"
            }
          ]
        },
        {
          "id": "hotel",
          "label": "Hotel",
          "children": [
            {
              "id": "india",
              "label": "India",
              "children": [
                {
                  "id": "juliet",
                  "label": "Juliet"
                }
              ]
            }
          ]
        },
        {
          "id": "kilo",
          "label": "Kilo"
        }
      ]
    }
  ]
}
```

### Flat List View
File: [examples/test1.js](https://github.com/cheton/flattree/blob/master/examples/tree1.js)
```
<root>: path=".0", parent="", children=2, total=11, depth=0, prefix="0", last=1, more=1, open=1
Alpha: path=".0.0", parent=".0", children=0, total=0, depth=1, prefix="00", last=0, more=0, open=0
Bravo: path=".0.1", parent=".0", children=3, total=9, depth=1, prefix="00", last=1, more=1, open=1
Charlie: path=".0.1.0", parent=".0.1", children=2, total=4, depth=2, prefix="000", last=0, more=1, open=1
Delta: path=".0.1.0.0", parent=".0.1.0", children=2, total=2, depth=3, prefix="0001", last=0, more=1, open=1
Echo: path=".0.1.0.0.0", parent=".0.1.0.0", children=0, total=0, depth=4, prefix="00011", last=0, more=0, open=0
Foxtrot: path=".0.1.0.0.1", parent=".0.1.0.0", children=0, total=0, depth=4, prefix="00011", last=1, more=0, open=0
Golf: path=".0.1.0.1", parent=".0.1.0", children=0, total=0, depth=3, prefix="0001", last=1, more=0, open=0
Hotel: path=".0.1.1", parent=".0.1", children=1, total=2, depth=2, prefix="000", last=0, more=1, open=1
India: path=".0.1.1.0", parent=".0.1.1", children=1, total=1, depth=3, prefix="0001", last=1, more=1, open=1
Juliet: path=".0.1.1.0.0", parent=".0.1.1.0", children=0, total=0, depth=4, prefix="00010", last=1, more=0, open=0
Kilo: path=".0.1.2", parent=".0.1", children=0, total=0, depth=2, prefix="000", last=1, more=0, open=0
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
