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
        const children = [].concat(tree);
        const root = {
            label: '',
            parent: null,
            children: children,
            state: {
                path: '',
                depth: depth,
                total: 0
            }
        };

        stack.push([root, depth, index]);
    }

    while (stack.length > 0) {
        let [current, depth, index] = stack.pop();

        while (index < current.children.length) {
            const node = current.children[index];
            node.parent = current;
            node.children = node.children || [];

            const path = current.state.path + '.' + index;
            const more = Object.keys(node.children).length > 0;
            const open = more && (options.openAllNodes || (options.openNodes.indexOf(node.id) >= 0));
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

            node.state = node.state || {};
            node.state.total = 0;
            node.state.path = path;
            node.state.depth = depth + 1;
            node.state.last = last;
            node.state.more = more;
            node.state.open = open;
            node.state.prefixMask = prefixMask;

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
