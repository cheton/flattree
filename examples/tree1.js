import fs from 'fs';
import path from 'path';
import { flatten } from '../src';
import tree from '../test/fixtures/tree.json';

flatten(tree).forEach((node, index) => {
    console.log('%s: path=%s, parent=%s, children=%d, depth=%d, prefix=%s, folded=%d, more=%d, last=%d',
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
