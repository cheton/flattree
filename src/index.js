import './polyfill';

const isFolded = (node = {}) => {
    const { state = {} } = node;
    const { isFolded = false } = state;

    return !!isFolded;
};

const flatten = (tree = []) => {
    let flatten = [];
    let stack = [];
    let lastNodes = {};

    if (Array.isArray(tree)) { // Array format
        const depth = -1;
        const index = 0;
        const root = {
            _state: {
                path: '',
                depth: depth
            },
            parent: null,
            children: tree
        };

        stack.push([root, depth, index]);
    } else { // Object format
        const folded = isFolded(tree);
        const children = tree.children || [];
        const depth = 0;
        const index = 0;
        const root = Object.assign({}, tree, {
            _state: {
                path: '',
                depth: depth,
                folded: folded,
                more: (!folded) && (Object.keys(children).length > 0),
                last: true,
                prefixMask: ''
            },
            parent: null
        });

        flatten.push(root);
        stack.push([root, depth, index]);
    }

    while (stack.length > 0) {
        let [current, depth, index] = stack.pop();

        if (isFolded(current)) {
            continue;
        }

        while (index < current.children.length) {
            const node = current.children[index];
            node.parent = current;
            node.children = node.children || [];

            const folded = isFolded(node);
            const path = current._state.path + '.' + index;
            const more = (!folded) && (Object.keys(node.children).length > 0);
            const last = (index === current.children.length - 1);
            const prefixMask = ((prefix) => {
                let mask = '';
                while (prefix.length > 0) {
                    prefix = prefix.replace(/\.\d+$/, '');
                    if (!prefix || lastNodes[prefix]) {
                        mask = '0' + mask;
                    } else {
                        mask = '1' + mask;
                    }
                }
                return mask;
            })(path);

            if (last) {
                lastNodes[path] = true;
            }

            node._state = {
                path: path,
                depth: depth + 1,
                folded: folded,
                more: more,
                last: last,
                prefixMask: prefixMask
            };

            flatten.push(node);

            ++index;

            if (!more) {
                continue;
            }

            if (Object.keys(node.children).length > 0) {
                // Push back parent node to the stack that will be able to continue
                // the next iteration once all the child nodes of the current node
                // have been completely explored.
                stack.push([current, depth, index]);

                index = 0;
                depth = depth + 1;
                current = node;
            }
        }
    }

    return flatten;
};

export {
    flatten
};
