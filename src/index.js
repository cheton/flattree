// @param {object|array} tree The tree object (or array)
// @param {object} [options] The options object
// @param {boolean} [options.openAllNodes] True to open all nodes. Defaults to false.
// @param {array} [options.openNodes] An array that contains the ids of open nodes
// @return {array}
const flatten = (tree = [], options = {}) => {
    const flatten = [];
    const stack = [];
    const lastNodes = {};

    options.openAllNodes = !!options.openAllNodes;
    options.openNodes = options.openNodes || [];

    { // root node
        const depth = -1;
        const index = 0;
        const root = {
            state: {
                path: '',
                depth: depth
            },
            parent: null,
            children: [].concat(tree)
        };

        stack.push([root, depth, index]);
    }

    while (stack.length > 0) {
        let [current, depth, index] = stack.pop();

        if (depth >= 0) {
            if (!options.openAllNodes && options.openNodes.indexOf(current.id) < 0) {
                continue;
            }
        }

        while (index < current.children.length) {
            const node = current.children[index];
            node.parent = current;
            node.children = node.children || [];

            const path = current.state.path + '.' + index;
            const open = options.openAllNodes || (options.openNodes.indexOf(node.id) >= 0);
            const more = (Object.keys(node.children).length > 0);
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

            node.state = {
                path: path,
                depth: depth + 1,
                last: last,
                more: more,
                open: open,
                prefixMask: prefixMask
            };

            flatten.push(node);

            ++index;

            if (more && !open) {
                continue;
            }

            if (more) {
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
