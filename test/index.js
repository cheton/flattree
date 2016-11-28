import _ from 'lodash';
import { test } from 'tap';
import fs from 'fs';
import path from 'path';
import util from 'util';
import pad from 'lodash/pad';
import extend from '../src/extend';
import flatten from '../src/flatten';
import Node from '../src/node';

const fixtures = {
    tree: fs.readFileSync(path.resolve(__dirname, 'fixtures/tree.json'))
};

test('[extend] Cannot convert undefined or null to object', (t) => {
    try {
        extend(null);
    } catch (err) {
        t.same(err, new TypeError('Cannot convert undefined or null to object'));
    }
    t.end();
});

test('[flatten] Flat list view', (t) => {
    const wanted = [
        {
            id: '<root>',
            label: '<root>',
            children: 2,
            parent: '',
            state: {
                path: '.0',
                depth: 0,
                open: true,
                prefixMask: '0',
                total: 11
            }
        },
        {
            id: 'alpha',
            label: 'Alpha',
            children: 0,
            parent: '.0',
            state: {
                path: '.0.0',
                depth: 1,
                open: false,
                prefixMask: '00',
                total: 0
            }
        },
        {
            id: 'bravo',
            label: 'Bravo',
            children: 3,
            parent: '.0',
            state: {
                path: '.0.1',
                depth: 1,
                open: true,
                prefixMask: '00',
                total: 9
            }
        },
        {
            id: 'charlie',
            label: 'Charlie',
            children: 2,
            parent: '.0.1',
            state: {
                path: '.0.1.0',
                depth: 2,
                open: true,
                prefixMask: '000',
                total: 4
            }
        },
        {
            id: 'delta',
            label: 'Delta',
            children: 2,
            parent: '.0.1.0',
            state: {
                path: '.0.1.0.0',
                depth: 3,
                open: true,
                prefixMask: '0001',
                total: 2
            }
        },
        {
            id: 'echo',
            label: 'Echo',
            children: 0,
            parent: '.0.1.0.0',
            state: {
                path: '.0.1.0.0.0',
                depth: 4,
                open: false,
                prefixMask: '00011',
                total: 0
            }
        },
        {
            id: 'foxtrot',
            label: 'Foxtrot',
            children: 0,
            parent: '.0.1.0.0',
            state: {
                path: '.0.1.0.0.1',
                depth: 4,
                open: false,
                prefixMask: '00011',
                total: 0
            }
        },
        {
            id: 'golf',
            label: 'Golf',
            parent: '.0.1.0',
            children: 0,
            state: {
                path: '.0.1.0.1',
                depth: 3,
                open: false,
                prefixMask: '0001',
                total: 0
            }
        },
        {
            id: 'hotel',
            label: 'Hotel',
            children: 1,
            parent: '.0.1',
            state: {
                path: '.0.1.1',
                depth: 2,
                open: true,
                prefixMask: '000',
                total: 2
            }
        },
        {
            id: 'india',
            label: 'India',
            children: 1,
            parent: '.0.1.1',
            state: {
                path: '.0.1.1.0',
                depth: 3,
                open: true,
                prefixMask: '0001',
                total: 1
            }
        },
        {
            id: 'juliet',
            label: 'Juliet',
            parent: '.0.1.1.0',
            children: 0,
            state: {
                path: '.0.1.1.0.0',
                depth: 4,
                open: false,
                prefixMask: '00010',
                total: 0
            }
        },
        {
            id: 'kilo',
            label: 'Kilo',
            parent: '.0.1',
            children: 0,
            state: {
                path: '.0.1.2',
                depth: 2,
                open: false,
                prefixMask: '000',
                total: 0
            }
        }
    ];
    let found = [];

    const tree = JSON.parse(fixtures.tree);
    flatten(tree, { openAllNodes: true }).forEach((node, index) => {
        let o = {
            id: node.id,
            label: node.label,
            parent: node.parent !== null ? node.parent.state.path : null,
            children: Object.keys(node.children).length,
            state: node.state
        };
        if (node.state !== undefined) {
            o.state = node.state;
        }
        found.push(o);
    });

    t.same(found, wanted);
    t.end();
});

test('[flatten] Nested hierarchies', (t) => {
    const wanted = [
        '<root> (.0)',
        '  ├── Alpha (.0.0)',
        '  └─┬ Bravo (.0.1)',
        '    ├─┬ Charlie (.0.1.0)',
        '    | ├─┬ Delta (.0.1.0.0)',
        '    | | ├── Echo (.0.1.0.0.0)',
        '    | | └── Foxtrot (.0.1.0.0.1)',
        '    | └── Golf (.0.1.0.1)',
        '    ├─┬ Hotel (.0.1.1)',
        '    | └─┬ India (.0.1.1.0)',
        '    |   └── Juliet (.0.1.1.0.0)',
        '    └── Kilo (.0.1.2)',
        ''
    ].join('\n');
    let found = '';

    const tree = JSON.parse(fixtures.tree);
    flatten(tree, { openAllNodes: true }).forEach((node, index) => {
        const { state, label = '', children = [] } = node;
        const { depth, open, path, prefixMask } = state;

        if (depth === 0) {
            found = found + label + ' (' + path + ')' + '\n';
            return;
        }
        
        const prefix = prefixMask.substr(1).split('')
            .map(s => (Number(s) === 0) ? '  ' : '| ')
            .join('');

        found = found + 
            prefix + 
            (node.isLastChild() ? '└' : '├') + '─' +
            (node.hasChildren() && open ? '┬' : '─') + ' ' +
            label +
            ' (' + path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('[flatten] Single root node', (t) => {
    const wanted = [
        '- <root> (.0)',
        '    Alpha (.0.0)',
        '  - Bravo (.0.1)',
        '    - Charlie (.0.1.0)',
        '      + Delta (.0.1.0.0)',
        '        Golf (.0.1.0.1)',
        '    - Hotel (.0.1.1)',
        '      - India (.0.1.1.0)',
        '          Juliet (.0.1.1.0.0)',
        '      Kilo (.0.1.2)',
        ''
    ].join('\n');
    let found = '';

    const tree = JSON.parse(fixtures.tree);
    const openNodes = [
        '<root>',
        'bravo',
        'charlie',
        'hotel',
        'india'
    ];
    flatten(tree, { openNodes: openNodes }).forEach((node, index) => {
        const { label = '', state = {}, children = [] } = node;
        const { open } = state;
      
        let padding = pad('', state.depth * 2, ' ');
        if (node.hasChildren() && open) {
            padding += '- ';
        } else if (node.hasChildren() && !open) {
            padding += '+ ';
        } else {
            padding += '  ';
        }

        found = found + padding + label + ' (' + state.path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('[flatten] Multiple root nodes', (t) => {
    const wanted = [
        '  Alpha (.0)',
        '- Bravo (.1)',
        '  - Charlie (.1.0)',
        '    + Delta (.1.0.0)',
        '      Golf (.1.0.1)',
        '  - Hotel (.1.1)',
        '    - India (.1.1.0)',
        '        Juliet (.1.1.0.0)',
        '    Kilo (.1.2)',
        ''
    ].join('\n');
    let found = '';

    const tree = JSON.parse(fixtures.tree);
    const openNodes = [
        'bravo',
        'charlie',
        'hotel',
        'india'
    ];
    flatten(tree.children, { openNodes: openNodes }).forEach((node, index) => {
        const { label = '', state = {}, children = [] } = node;
        const { open } = state;
      
        let padding = pad('', state.depth * 2, ' ');
        if (node.hasChildren() && open) {
            padding += '- ';
        } else if (node.hasChildren() && !open) {
            padding += '+ ';
        } else {
            padding += '  ';
        }
      
        found = found + padding + label + ' (' + state.path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('[flatten] Open all nodes, close two nodes, and rebuild the list', (t) => {
    const wanted = [
        {
            id: '<root>',
            label: '<root>',
            children: 2,
            parent: '',
            state: {
                path: '.0',
                depth: 0,
                open: true,
                prefixMask: '0',
                total: 8
            }
        },
        {
            id: 'alpha',
            label: 'Alpha',
            children: 0,
            parent: '.0',
            state: {
                path: '.0.0',
                depth: 1,
                open: false,
                prefixMask: '00',
                total: 0
            }
        },
        {
            id: 'bravo',
            label: 'Bravo',
            children: 3,
            parent: '.0',
            state: {
                path: '.0.1',
                depth: 1,
                open: true,
                prefixMask: '00',
                total: 6
            }
        },
        {
            id: 'charlie',
            label: 'Charlie',
            children: 2,
            parent: '.0.1',
            state: {
                path: '.0.1.0',
                depth: 2,
                open: true,
                prefixMask: '000',
                total: 2
            }
        },
        {
            id: 'delta',
            label: 'Delta',
            children: 2,
            parent: '.0.1.0',
            state: {
                path: '.0.1.0.0',
                depth: 3,
                open: false,
                prefixMask: '0001',
                total: 0
            }
        },
        {
            id: 'golf',
            label: 'Golf',
            parent: '.0.1.0',
            children: 0,
            state: {
                path: '.0.1.0.1',
                depth: 3,
                open: false,
                prefixMask: '0001',
                total: 0
            }
        },
        {
            id: 'hotel',
            label: 'Hotel',
            children: 1,
            parent: '.0.1',
            state: {
                path: '.0.1.1',
                depth: 2,
                open: true,
                prefixMask: '000',
                total: 1
            }
        },
        {
            id: 'india',
            label: 'India',
            children: 1,
            parent: '.0.1.1',
            state: {
                path: '.0.1.1.0',
                depth: 3,
                open: false,
                prefixMask: '0001',
                total: 0
            }
        },
        {
            id: 'kilo',
            label: 'Kilo',
            parent: '.0.1',
            children: 0,
            state: {
                path: '.0.1.2',
                depth: 2,
                open: false,
                prefixMask: '000',
                total: 0
            }
        }
    ];
    let found = [];

    const tree = JSON.parse(fixtures.tree);
    let openNodes = [
        '<root>',
        'bravo',
        'charlie',
        'delta',
        'hotel',
        'india'
    ];

    // Step 1. Open all nodes
    let nodes = flatten(tree, { openNodes: openNodes });

    // Find the first node with an id attribute that equals to 'charlie'
    let index = _.findIndex(nodes, { 'id': 'charlie' });
    let node = nodes[index];
    let parentIndex = _.lastIndexOf(nodes, node.parent, index);
    let parent = nodes[parentIndex];
    let previousTotal = parent.state.total;

    // Step 2. Close two nodes: 'delta' and 'india'
    openNodes = _.without(openNodes, 'delta', 'india');

    // Returns a new mapped array containing nodes
    openNodes = _.map(openNodes, id => _.find(nodes, { id: id }));

    // It will return all of its sibling nodes if the node's parent have two or more child nodes
    let siblingNodes = flatten(node, { openNodes: openNodes });

    // Step 3. Rebuild the list
    nodes.splice.apply(nodes, [parentIndex + 1, previousTotal].concat(siblingNodes));

    nodes.forEach((node) => {
        let o = {
            id: node.id,
            label: node.label,
            parent: node.parent !== null ? node.parent.state.path : null,
            children: Object.keys(node.children).length,
            state: node.state
        };
        if (node.state !== undefined) {
            o.state = node.state;
        }
        found.push(o);
    });

    t.same(found, wanted);
    t.end();
});

test('[flatten] Corrupted parent node', (t) => {
    const tree = JSON.parse(fixtures.tree);
    let nodes = flatten(tree, { openAllNodes: true });

    // Find the first node with an id attribute that equals to 'charlie'
    let index = _.findIndex(nodes, { 'id': 'charlie' });
    let node = nodes[index];
    let parentIndex = _.lastIndexOf(nodes, node.parent, index);
    let parent = nodes[parentIndex];

    flatten(node, { openAllNodes: true });
    t.equal(parent.parent.state.total, 11);

    { // it should not catch error
        let err = '';
        try {
            // data corruption
            parent.parent.state.total = 0;
            const originalConsoleLogger = console.log;
            console.log = (msg) => {
                t.same(msg, 'Error: The node might have been corrupted: id=%s, parent=%s, children=%s, state=%s');
            };
            flatten(node, { openAllNodes: true, throwOnError: false });
            console.log = originalConsoleLogger;
        } catch (e) {
            err = e;
        }

        t.notOk(err, 'it should not catch error');
    }

    { // it should catch error
        let err = '';
        try {
            // data corruption
            parent.parent.state.total = 0;
            flatten(node, { openAllNodes: true, throwOnError: true });
        } catch (e) {
            err = e;
        }

        t.ok(err, 'it should catch error');
    }

    t.end();
});

test('[flatten] Ensure the parent node is an instance of Node after calling flatten', (t) => {
    const tree = JSON.parse(fixtures.tree);
    const nodes = flatten(tree, { openAllNodes: true });
    t.assert(nodes[0].parent instanceof Node);

    const { id, label, parent, children, state } = nodes[0].parent;
    nodes[0].parent = { id, label, parent, children, state };
    t.assert(!(nodes[0].parent instanceof Node));

    flatten(nodes[0].parent.children, { openAllNodes: true });
    t.assert(nodes[0].parent instanceof Node);

    t.end();
});

test('[node] Node API', (t) => {
    const tree = JSON.parse(fixtures.tree);
    const nodes = flatten(tree, { openAllNodes: true });
    const root = _.find(nodes, node => node.id === '<root>');
    const alpha = _.find(nodes, node => node.id === 'alpha');
    const bravo = _.find(nodes, node => node.id === 'bravo');
    const juliet = _.find(nodes, node => node.id === 'juliet');

    // contains
    t.equal(root.contains(null), false);
    t.equal(root.contains(undefined), false);
    t.equal(root.contains({}), false);
    t.equal(root.contains([]), false);
    t.equal(root.contains(root), false);
    t.equal(root.contains(alpha), true);
    t.equal(root.contains(bravo), true);
    t.equal(root.contains(juliet), true);
    t.equal(alpha.contains(bravo), false);
    t.equal(alpha.contains(juliet), false);
    t.equal(bravo.contains(alpha), false);
    t.equal(bravo.contains(juliet), true);
    t.equal(juliet.contains(root), false);

    // hasChildren
    t.same(root.hasChildren(), true);
    t.same(alpha.hasChildren(), false);
    t.same(bravo.hasChildren(), true);

    // getChildAt
    t.same(root.getChildAt(), null);
    t.same(root.getChildAt(null), null);
    t.same(root.getChildAt(-1), null);
    t.same(root.getChildAt(0), alpha);
    t.same(root.getChildAt(1), bravo);
    t.same(root.getChildAt(2), null);

    // getChildren
    t.same(root.getChildren().length, 2);
    t.same(root.getChildren()[0], alpha);
    t.same(root.getChildren()[1], bravo);

    // getFirstChild
    t.same(root.getFirstChild(), alpha);
    t.same(alpha.getFirstChild(), null);

    // getLastChild
    t.same(root.getLastChild(), bravo);
    t.same(alpha.getLastChild(), null);

    // getParent
    t.same(alpha.getParent(), root);
    t.same(alpha.getParent().getParent(), root.parent);
    t.same(alpha.getParent().getParent().getParent(), null);

    // getPreviousSibling
    t.same(alpha.getPreviousSibling(), null);
    t.same(bravo.getPreviousSibling(), alpha);

    // getNextSibling
    t.same(alpha.getNextSibling(), bravo);
    t.same(bravo.getNextSibling(), null);

    // getPreviousSibling + getNextSibling
    t.same(alpha.getNextSibling().getNextSibling(), null);
    t.same(alpha.getNextSibling().getPreviousSibling(), alpha);

    // hasChildren
    t.same(root.hasChildren(), true);
    t.same(alpha.hasChildren(), false);
    t.same(bravo.hasChildren(), true);

    t.end();
});
