import extend from './extend';

class Node {
    id = null;
    label = '';
    parent = null;
    children = [];
    state = {};

    constructor(node) {
        extend(this, node);

        this.children = this.children || [];
    }
    getParent() {
        return this.parent;
    }
    getChildren() {
        return this.children;
    }
    // Gets the first child node.
    // @return {object} Returns the first child node on success, null otherwise.
    getFirstChild() {
        let node = null;
        if (this.children.length > 0) {
            node = this.children[0];
        }
        return node;
    }
    // Gets the next sibling node.
    // @return {object} Returns the next sibling node on success, null otherwise.
    getNextSibling() {
        let node = null;
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if ((index >= 0) && (index < this.parent.children.length - 1)) {
                node = this.parent.children[index + 1];
            }
        }
        return node;
    }
    // Gets previous sibling node.
    // @return {object} Returns the previous sibling node on success, null otherwise.
    getPreviousSibling() {
        let node = null;
        if (this.parent) {
            const index = this.parent.children.indexOf(this);
            if ((index > 0) && (index < this.parent.children.length)) {
                node = this.parent.children[index - 1];
            }
        }
        return node;
    }
}

// IE8 compatibility output
module.exports = Node;
