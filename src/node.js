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
    // Gets a child node at the specified index.
    // @return {object} Returns a node on success, null otherwise.
    getChildAt(index) {
        let node = null;
        if ((this.children.length > 0) && (index >= 0) && (index < this.children.length)) {
            node = this.children[index];
        }
        return node;
    }
    // Gets the child nodes.
    // @return {array} Returns an array of child nodes.
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
    // Gets the last child node.
    // @return {object} Returns the last child node on success, null otherwise.
    getLastChild() {
        let node = null;
        if (this.children.length > 0) {
            node = this.children[this.children.length - 1];
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
    // Gets the parent node.
    // @return {object} Returns the parent node.
    getParent() {
        return this.parent;
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
    // Checks whether this node has children.
    // @return {boolean} Returns true if the node has children, false otherwise.
    hasChildren() {
        return this.children.length > 0;
    }
}

// IE8 compatibility output
module.exports = Node;
