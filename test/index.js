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
            label: '<root>',
            state: { isFolded: false },
            children: 2,
            parent: null,
            _state: {
                path: '',
                depth: 0,
                folded: false,
                more: true,
                last: true,
                prefixMask: ''
            }
        },
        {
            label: 'Alpha',
            children: 0,
            parent: '',
            _state: {
                path: '.0',
                depth: 1,
                folded: false,
                more: false,
                last: false,
                prefixMask: '0'
            }
        },
        {
            label: 'Bravo',
            state: { isFolded: false },
            children: 3,
            parent: '',
            _state: {
                path: '.1',
                depth: 1,
                folded: false,
                more: true,
                last: true,
                prefixMask: '0'
            }
        },
        {
            label: 'Charlie',
            children: 2,
            parent: '.1',
            _state: {
                path: '.1.0',
                depth: 2,
                folded: false,
                more: true,
                last: false,
                prefixMask: '00'
            }
        },
        {
            label: 'Delta',
            state: { isFolded: true },
            children: 2,
            parent: '.1.0',
            _state: {
                path: '.1.0.0',
                depth: 3,
                folded: true,
                more: false,
                last: false,
                prefixMask: '001'
            }
        },
        {
            label: 'Golf',
            parent: '.1.0',
            children: 0,
            _state: {
                path: '.1.0.1',
                depth: 3,
                folded: false,
                more: false,
                last: true,
                prefixMask: '001'
            }
        },
        {
            label: 'Hotel',
            children: 1,
            parent: '.1',
            _state: {
                path: '.1.1',
                depth: 2,
                folded: false,
                more: true,
                last: false,
                prefixMask: '00'
            }
        },
        {
            label: 'India',
            children: 1,
            parent: '.1.1',
            _state: {
               path: '.1.1.0',
               depth: 3,
               folded: false,
               more: true,
               last: true,
               prefixMask: '001'
            }
        },
        {
            label: 'Juliet',
            parent: '.1.1.0',
            children: 0,
            _state: {
                path: '.1.1.0.0',
                depth: 4,
                folded: false,
                more: false,
                last: true,
                prefixMask: '0010'
            }
        },
        {
            label: 'Kilo',
            parent: '.1',
            children: 0,
            _state: {
                path: '.1.2',
                depth: 2,
                folded: false,
                more: false,
                last: true,
                prefixMask: '00'
            }
        }
    ];
    let found = [];

    const tree = JSON.parse(fixtures.tree);
    flatten(tree).forEach((node, index) => {
        let o = {
            label: node.label,
            parent: node.parent !== null ? node.parent._state.path : null,
            children: Object.keys(node.children).length,
            _state: node._state
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
        '<root>',
        '  ├── Alpha (.0)',
        '  └─┬ Bravo (.1)',
        '    ├─┬ Charlie (.1.0)',
        '    | ├── Delta (.1.0.0)',
        '    | └── Golf (.1.0.1)',
        '    ├─┬ Hotel (.1.1)',
        '    | └─┬ India (.1.1.0)',
        '    |   └── Juliet (.1.1.0.0)',
        '    └── Kilo (.1.2)',
        ''
    ].join('\n');
    let found = '';

    const tree = JSON.parse(fixtures.tree);
    flatten(tree).forEach((node, index) => {
        const { _state, label = '', children = [] } = node;
        const { depth, last, more, path, prefixMask } = _state;
        
        if (depth === 0) {
            found = found + label + '\n';
            return;
        }

        const prefix = prefixMask.split('')
            .map(s => (Number(s) === 0) ? '  ' : '| ')
            .join('');

        found = found + 
            prefix + 
            (last ? '└' : '├') + '─' +
            (more ? '┬' : '─') + ' ' +
            label +
            ' (' + path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});

test('Single root node', (t) => {
    const wanted = [
        '- <root>',
        '    Alpha (.0)',
        '  - Bravo (.1)',
        '    - Charlie (.1.0)',
        '      + Delta (.1.0.0)',
        '        Golf (.1.0.1)',
        '    - Hotel (.1.1)',
        '      - India (.1.1.0)',
        '          Juliet (.1.1.0.0)',
        '      Kilo (.1.2)',
        ''
    ].join('\n');
    let found = '';

    const tree = JSON.parse(fixtures.tree);
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
            found = found + padding + label + '\n';
        } else {
            found = found + padding + label + ' (' + _state.path + ')' + '\n';
        }
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
      
        found = found + padding + label + ' (' + _state.path + ')' + '\n';
    });

    t.same(found, wanted);
    t.end();
});
