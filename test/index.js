import { test } from 'tap';
import fs from 'fs';
import path from 'path';
import util from 'util';
import pad from 'lodash/pad';
import { flatten } from '../src';

const fixtures = {
    tree: fs.readFileSync(path.resolve(__dirname, 'fixtures/tree.json'))
};

test('Flat list view', (t) => {
    const wanted = [
        {
            id: '<root>',
            label: '<root>',
            children: 2,
            parent: '',
            state: {
                path: '.0',
                depth: 0,
                last: true,
                more: true,
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
                last: false,
                more: false,
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
                last: true,
                more: true,
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
                last: false,
                more: true,
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
                last: false,
                more: true,
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
                last: false,
                more: false,
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
                last: true,
                more: false,
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
                last: true,
                more: false,
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
                last: false,
                more: true,
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
                last: true,
                more: true,
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
                last: true,
                more: false,
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
                last: true,
                more: false,
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

test('Nested hierarchies', (t) => {
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
        const { depth, last, more, open, path, prefixMask } = state;

        if (depth === 0) {
            found = found + label + ' (' + path + ')' + '\n';
            return;
        }
        
        const prefix = prefixMask.substr(1).split('')
            .map(s => (Number(s) === 0) ? '  ' : '| ')
            .join('');

        found = found + 
            prefix + 
            (last ? '└' : '├') + '─' +
            (more && open ? '┬' : '─') + ' ' +
            label +
            ' (' + path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('Single root node', (t) => {
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
        const { more, open } = state;
      
        let padding = pad('', state.depth * 2, ' ');
        if (more && open) {
            padding += '- ';
        } else if (more && !open) {
            padding += '+ ';
        } else {
            padding += '  ';
        }

        found = found + padding + label + ' (' + state.path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('Multiple root nodes', (t) => {
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
        const { more, open } = state;
      
        let padding = pad('', state.depth * 2, ' ');
        if (more && open) {
            padding += '- ';
        } else if (state.more) {
            padding += '+ ';
        } else {
            padding += '  ';
        }
      
        found = found + padding + label + ' (' + state.path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});
