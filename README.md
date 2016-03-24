# node-flattree [![build status](https://travis-ci.org/cheton/node-flattree.svg?branch=master)](https://travis-ci.org/cheton/node-flattree) [![Coverage Status](https://coveralls.io/repos/cheton/node-flattree/badge.svg)](https://coveralls.io/r/cheton/node-flattree)
[![NPM](https://nodei.co/npm/flattree.png?downloads=true&stars=true)](https://nodei.co/npm/flattree/)

Convert hierarchical tree structure to flat structure.

## Installation

```bash
npm install --save flattree
```

## Usage
```js
import { flatten } from 'flattree';

const tree = {
    label: 'Fruit',
    state: {
        isFolded: false
    },
    children: [
        { label: 'Apple' },
        { label: 'Banana' }
    ]
};

const ft = flatten(tree); // tree can either be Object or Array
console.log(ft);
```

## Examples

Given a hierarchical tree structure like below:

```json
{
    "label": "<root>",
    "children": [
        {
            "label": "Alpha"
        },
        {
            "label": "Bravo",
            "children": [
                {
                    "label": "Charlie",
                    "children": [
                        {
                            "label": "Delta",
                            "state": {
                                "isFolded": true
                            },
                            "children": [
                                {
                                    "label": "Echo"
                                },
                                {
                                    "label": "Foxtrot"
                                }
                            ]
                        },
                        {
                            "label": "Golf"
                        }
                    ]
                },
                {
                    "label": "Hotel",
                    "children": [
                        {
                            "label": "India",
                            "children": [
                                {
                                    "label": "Juliet"
                                }
                            ]
                        }
                    ]
                },
                {
                    "label": "Kilo"
                }
            ]
        }
    ]
}
```

### Flat List View
File: [examples/test1.js](https://github.com/cheton/node-flattree/blob/master/examples/tree1.js)
```
<root>: path="", parent=null, children=2, depth=0, prefix="", folded=0, more=1, last=1
Alpha: path=".0", parent="", children=0, depth=1, prefix="0", folded=0, more=0, last=0
Bravo: path=".1", parent="", children=3, depth=1, prefix="0", folded=0, more=1, last=1
Charlie: path=".1.0", parent=".1", children=2, depth=2, prefix="00", folded=0, more=1, last=0
Delta: path=".1.0.0", parent=".1.0", children=2, depth=3, prefix="001", folded=1, more=0, last=0
Golf: path=".1.0.1", parent=".1.0", children=0, depth=3, prefix="001", folded=0, more=0, last=1
Hotel: path=".1.1", parent=".1", children=1, depth=2, prefix="00", folded=0, more=1, last=0
India: path=".1.1.0", parent=".1.1", children=1, depth=3, prefix="001", folded=0, more=1, last=1
Juliet: path=".1.1.0.0", parent=".1.1.0", children=0, depth=4, prefix="0010", folded=0, more=0, last=1
Kilo: path=".1.2", parent=".1", children=0, depth=2, prefix="00", folded=0, more=0, last=1
```

### Nest Hierarchies
File: [examples/test2.js](https://github.com/cheton/node-flattree/blob/master/examples/tree2.js)
```
<root>
  ├── Alpha (.0)
  └─┬ Bravo (.1)
    ├─┬ Charlie (.1.0)
    | ├── Delta (.1.0.0)
    | └── Golf (.1.0.1)
    ├─┬ Hotel (.1.1)
    | └─┬ India (.1.1.0)
    |   └── Juliet (.1.1.0.0)
    └── Kilo (.1.2)
```

### Single Root Node
File: [examples/test3.js](https://github.com/cheton/node-flattree/blob/master/examples/tree3.js)
```
- <root>
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

### Multiple Root Nodes
File: [examples/test4.js](https://github.com/cheton/node-flattree/blob/master/examples/tree4.js)
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
