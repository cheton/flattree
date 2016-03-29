const extend = (target, ...sources) => {
    sources.forEach((source) => {
        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    });

    return target;
};

// @param {object|array} nodes The tree nodes
// @param {object} [options] The options object
// @param {boolean} [options.openAllNodes] True to open all nodes. Defaults to false.
// @param {array} [options.openNodes] An array that contains the ids of open nodes
// @return {array}
const flatten = (nodes = [], options = {}) => {
    nodes = [].concat(nodes);

    const flatten = [];
    const stack = [];
    const pool = {
        lastChild: {}
    };

    options.openAllNodes = !!options.openAllNodes;
    options.openNodes = options.openNodes || [];
    options.throwOnError = !!options.throwOnError;

    { // root node
        const firstNode = (nodes.length > 0) ? nodes[0] : null;
        const parent = firstNode ? firstNode.parent : null;
        const index = 0;
        const root = parent || { // defaults
            label: '',
            parent: null,
            children: nodes,
            state: {
                depth: -1,
                path: '',
                total: 0
            }
        };

        if (root === parent) {
            const subtotal = (root.state.total || 0);

            // Traversing up through its ancestors
            let p = root;
            while (p) {
                const { path, lastChild, total = 0 } = p.state;

                // Rebuild the lastChild pool
                if (path && lastChild) {
                    pool.lastChild[path] = true;
                }

                // Subtract the number 'subtotal' from the total of the root node and all its ancestors
                p.state.total = (total - subtotal);
                if (p.state.total < 0) {
                    if (options.throwOnError) {
                        throw new Error('The node might have been corrupted: id=' + JSON.stringify(p.id) + ', state=' + JSON.stringify(p.state));
                    } else {
                        console && console.log('Error: The node might have been corrupted: id=%s, label=%s, parent=%s, children=%s, state=%s',
                            JSON.stringify(p.id),
                            JSON.stringify(p.label),
                            p.parent,
                            p.children,
                            JSON.stringify(p.state),
                        );
                    }
                }

                p = p.parent;
            }
        }

        stack.push([root, root.state.depth, index]);
    }

    while (stack.length > 0) {
        let [current, depth, index] = stack.pop();

        while (index < current.children.length) {
            const node = current.children[index];
            node.parent = current;
            node.children = node.children || [];

            const path = current.state.path + '.' + index;
            const more = Object.keys(node.children).length > 0;
            const open = more && (() => {
                const { openAllNodes, openNodes } = options;
                if (openAllNodes) {
                    return true;
                }
                // determine by node object
                if (openNodes.indexOf(node) >= 0) {
                    return true;
                }
                // determine by node id
                if (openNodes.indexOf(node.id) >= 0) {
                    return true;
                }
                return false;
            })();
            const lastChild = (index === current.children.length - 1);
            const prefixMask = ((prefix) => {
                let mask = '';
                while (prefix.length > 0) {
                    prefix = prefix.replace(/\.\d+$/, '');
                    if (!prefix || pool.lastChild[prefix]) {
                        mask = '0' + mask;
                    } else {
                        mask = '1' + mask;
                    }
                }
                return mask;
            })(path);

            if (lastChild) {
                pool.lastChild[path] = true;
            }

            // This allows you to put extra information to node.state
            node.state = extend({}, node.state, {
                depth: depth + 1,
                lastChild: lastChild,
                more: more,
                open: open,
                path: path,
                prefixMask: prefixMask,
                total: 0
            });

            { // Traversing up through its ancestors and update the total number of child nodes
                let p = node;
                while (p.parent !== null) {
                    p.parent.state.total++;
                    p = p.parent;
                }
            }

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
