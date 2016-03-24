import fs from 'fs';
import path from 'path';
import { flatten } from '../src';
import tree from '../test/fixtures/tree.json';

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
