# node-flattree [![build status](https://travis-ci.org/cheton/node-flattree.svg?branch=master)](https://travis-ci.org/cheton/node-flattree) [![Coverage Status](https://coveralls.io/repos/cheton/node-flattree/badge.svg)](https://coveralls.io/r/cheton/node-flattree)
[![NPM](https://nodei.co/npm/flattree.png?downloads=true&stars=true)](https://nodei.co/npm/flattree/)

Convert hierarchical tree structure to flat structure.

## Installation

```bash
npm install --save flattree
```

## Examples

### Flat List View
```js
flatten(tree).forEach((node, index) => {
    console.log({
        label: node.label,
        parent: node.parent !== null ? node.parent._state.path : null,
        children: Object.keys(node.children).length,
        _state: node._state
    ));
});
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
    
    console.log(prefix + 
        (last ? '└' : '├') + '─' +
        (more ? '┬' : '─') + ' ' +
        label +
        ' (' + path + ')'
    );
});
```
