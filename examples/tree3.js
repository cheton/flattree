import fs from 'fs';
import path from 'path';
import { flatten } from '../src';
import tree from '../test/fixtures/tree.json';

const pad = (n = 0, chars) => {
    let s = '';
    while (n > 0) { s += chars; --n }
    return s;
};
const openNodes = [
    '<root>',
    'bravo',
    'charlie',
    'hotel',
    'india'
];
flatten(tree, { openNodes: openNodes }).forEach((node, index) => {
    const { label = '', state = {}, children = [] } = node;
    const { open, path } = state;
  
    let padding = pad(state.depth * 2, ' ');
    if (node.hasChildren() && open) {
        padding += '- ';
    } else if (node.hasChildren() && !open) {
        padding += '+ ';
    } else {
        padding += '  ';
    }

    console.log('%s%s (%s)', padding, label, path);
});
