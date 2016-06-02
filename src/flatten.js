/* eslint no-console: 0 */
import extend from './extend';
import Node from './node';

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
        let firstNode = (nodes.length > 0) ? nodes[0] : null;
        let parentNode = firstNode ? firstNode.parent : null;
        if (parentNode && !(parentNode instanceof Node)) {
            parentNode = new Node(parentNode);
        }
        const rootNode = parentNode || new Node({ // defaults
            parent: null,
            children: nodes,
            state: {
                depth: -1,
                open: true, // always open
                path: '',
                prefixMask: '',
                total: 0
            }
        });

        if (rootNode === parentNode) {
            const subtotal = (rootNode.state.total || 0);

            // Traversing up through its ancestors
            let p = rootNode;
            while (p) {
                const { path, total = 0 } = p.state;

                // Rebuild the lastChild pool
                if (p.isLastChild() && path) {
                    pool.lastChild[path] = true;
                }

                // Subtract the number 'subtotal' from the total of the root node and all its ancestors
                p.state.total = (total - subtotal);
                if (p.state.total < 0) {
                    if (options.throwOnError) {
                        throw new Error('The node might have been corrupted: id=' + JSON.stringify(p.id) + ', state=' + JSON.stringify(p.state));
                    } else {
                        console && console.log('Error: The node might have been corrupted: id=%s, parent=%s, children=%s, state=%s',
                            JSON.stringify(p.id),
                            p.parent,
                            p.children,
                            JSON.stringify(p.state),
                        );
                    }
                }

                p = p.parent;
            }
        }

        stack.push([rootNode, rootNode.state.depth, 0]);
    }

    while (stack.length > 0) {
        let [current, depth, index] = stack.pop();

        while (index < current.children.length) {
            let node = current.children[index];
            if (!(node instanceof Node)) {
                node = new Node(node);
            }
            node.parent = current;
            node.children = node.children || [];

            // Ensure parent.children[index] is equal to the current node
            node.parent.children[index] = node;

            const path = current.state.path + '.' + index;
            const open = node.hasChildren() && (() => {
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

            if (node.isLastChild()) {
                pool.lastChild[path] = true;
            }

            // This allows you to put extra information to node.state
            node.state = extend({}, node.state, {
                depth: depth + 1,
                open: open,
                path: path,
                prefixMask: prefixMask,
                total: 0
            });

            let parentDidOpen = true;

            { // Check the open state from its ancestors
                let p = node;
                while (p.parent !== null) {
                    if (p.parent.state.open === false) {
                        parentDidOpen = false;
                        break;
                    }
                    p = p.parent;
                }
            }

            if (parentDidOpen) {
                // Push the node to flatten list only if all of its parent nodes have the open state set to true
                flatten.push(node);

                // Update the total number of visible child nodes
                let p = node;
                while (p.parent !== null) {
                    p.parent.state.total++;
                    p = p.parent;
                }
            }

            ++index;

            if (node.hasChildren()) {
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

export default flatten;
