import fs from 'fs';
import path from 'path';
import { flatten } from '../src';
import tree from '../test/fixtures/tree.json';

flatten(tree, { openAllNodes: true }).forEach((node, index) => {
    const { state, label = '', children = [] } = node;
    const { depth, open, path, prefixMask } = state;

    if (depth === 0) {
        console.log('%s (%s)', label, path);
        return;
    }

    const prefix = prefixMask.substr(1).split('')
        .map(s => (Number(s) === 0) ? '  ' : '| ')
        .join('');

    console.log('%s%s─%s %s (%s)', prefix, (node.isLastChild() ? '└' : '├'), (node.hasChildren() && open ? '┬' : '─'), label, path);
});
