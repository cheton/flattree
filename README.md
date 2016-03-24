# node-flattree [![build status](https://travis-ci.org/cheton/node-flattree.svg?branch=master)](https://travis-ci.org/cheton/node-flattree) [![Coverage Status](https://coveralls.io/repos/cheton/node-flattree/badge.svg)](https://coveralls.io/r/cheton/node-flattree)
[![NPM](https://nodei.co/npm/flattree.png?downloads=true&stars=true)](https://nodei.co/npm/flattree/)

Convert hierarchical tree structure to flat structure.

## Installation

```bash
npm install --save flattree
```

## Examples

Given a hierarchical tree structure like below:

```json
{
    "label": "<root>",
    "state": {
        "isFolded": false
    },
    "children": [
        {
            "label": "Alpha"
        },
        {
            "label": "Bravo",
            "state": {
                "isFolded": false
            },
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
```js
flatten(tree).forEach((node, index) => {
    console.log('%s\n  path=%s, parent=%s, children=%d, depth=%d, prefix=%s, folded=%d, more=%d, last=%d',
        node.label,
        JSON.stringify(node._state.path),
        node.parent !== null ? JSON.stringify(node.parent._state.path) : null,
        Object.keys(node.children).length,
        node._state.depth,
        JSON.stringify(node._state.prefixMask),
        node._state.folded,
        node._state.more,
        node._state.last
    );
});
```

```
<root>
  path="", parent=null, children=2, depth=0, prefix="", folded=0, more=1, last=1
Alpha
  path=".0", parent="", children=0, depth=1, prefix="0", folded=0, more=0, last=0
Bravo
  path=".1", parent="", children=3, depth=1, prefix="0", folded=0, more=1, last=1
Charlie
  path=".1.0", parent=".1", children=2, depth=2, prefix="00", folded=0, more=1, last=0
Delta
  path=".1.0.0", parent=".1.0", children=2, depth=3, prefix="001", folded=1, more=0, last=0
Golf
  path=".1.0.1", parent=".1.0", children=0, depth=3, prefix="001", folded=0, more=0, last=1
Hotel
  path=".1.1", parent=".1", children=1, depth=2, prefix="00", folded=0, more=1, last=0
India
  path=".1.1.0", parent=".1.1", children=1, depth=3, prefix="001", folded=0, more=1, last=1
Juliet
  path=".1.1.0.0", parent=".1.1.0", children=0, depth=4, prefix="0010", folded=0, more=0, last=1
Kilo
  path=".1.2", parent=".1", children=0, depth=2, prefix="00", folded=0, more=0, last=1
```

### Nest Hierarchies
```js
flatten(tree).forEach((node, index) => {
    const { _state, label = '', children = [] } = node;
    const { depth, last, more, path, prefixMask } = _state;
  
    if (depth === 0) {
        console.log(label);
        return;
    }

    const prefix = prefixMask.split('')
        .map(s => (Number(s) === 0) ? '  ' : '| ')
        .join('');
    
    console.log('%s%s─%s %s (%s)', prefix, (last ? '└' : '├'), (more ? '┬' : '─'), label, path);
});
```

### Single Root Node
```js
flatten(tree).forEach((node, index) => {
    const { label = '', _state = {}, children = [] } = node;

    let padding = pad('', _state.depth * 2, ' ');
    if (_state.folded) {
        padding += '+ ';
    } else if (children.length > 0) {
        padding += '- ';
    } else {
        padding += '  ';
    }

    if (_state.depth === 0) {
        console.log('%s%s', padding, label);
    } else {
        console.log('%s%s (%s)', padding, label, _state.path);
    }
});
```

### Multiple Root Nodes
```js
flatten(tree.children).forEach((node, index) => {
    const { label = '', _state = {}, children = [] } = node;

    let padding = pad('', _state.depth * 2, ' ');
    if (_state.folded) {
        padding += '+ ';
    } else if (children.length > 0) {
        padding += '- ';
    } else {
        padding += '  ';
    }

    if (_state.depth === 0) {
        console.log('%s%s', padding, label);
    } else {
        console.log('%s%s (%s)', padding, label, _state.path);
    }
});
```
