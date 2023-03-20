// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
/** This module is browser compatible. */ import { ascend } from "./_comparators.ts";
import { BinarySearchNode } from "./binary_search_node.ts";
export * from "./_comparators.ts";
/**
 * An unbalanced binary search tree. The values are in ascending order by default,
 * using JavaScript's built in comparison operators to sort the values.
 */ export class BinarySearchTree {
    root;
    _size;
    constructor(compare = ascend){
        this.compare = compare;
        this.root = null;
        this._size = 0;
    }
    static from(collection, options) {
        let result;
        let unmappedValues = [];
        if (collection instanceof BinarySearchTree) {
            result = new BinarySearchTree(options?.compare ?? collection.compare);
            if (options?.compare || options?.map) {
                unmappedValues = collection;
            } else {
                const nodes = [];
                if (collection.root) {
                    result.root = BinarySearchNode.from(collection.root);
                    nodes.push(result.root);
                }
                while(nodes.length){
                    const node = nodes.pop();
                    const left = node.left ? BinarySearchNode.from(node.left) : null;
                    const right = node.right ? BinarySearchNode.from(node.right) : null;
                    if (left) {
                        left.parent = node;
                        nodes.push(left);
                    }
                    if (right) {
                        right.parent = node;
                        nodes.push(right);
                    }
                }
            }
        } else {
            result = options?.compare ? new BinarySearchTree(options.compare) : new BinarySearchTree();
            unmappedValues = collection;
        }
        const values = options?.map ? Array.from(unmappedValues, options.map, options.thisArg) : unmappedValues;
        for (const value of values)result.insert(value);
        return result;
    }
    /** The amount of values stored in the binary search tree. */ get size() {
        return this._size;
    }
    findNode(value) {
        let node = this.root;
        while(node){
            const order = this.compare(value, node.value);
            if (order === 0) break;
            const direction = order < 0 ? "left" : "right";
            node = node[direction];
        }
        return node;
    }
    rotateNode(node, direction) {
        const replacementDirection = direction === "left" ? "right" : "left";
        if (!node[replacementDirection]) {
            throw new TypeError(`cannot rotate ${direction} without ${replacementDirection} child`);
        }
        const replacement = node[replacementDirection];
        node[replacementDirection] = replacement[direction] ?? null;
        if (replacement[direction]) replacement[direction].parent = node;
        replacement.parent = node.parent;
        if (node.parent) {
            const parentDirection = node === node.parent[direction] ? direction : replacementDirection;
            node.parent[parentDirection] = replacement;
        } else {
            this.root = replacement;
        }
        replacement[direction] = node;
        node.parent = replacement;
    }
    insertNode(Node, value) {
        if (!this.root) {
            this.root = new Node(null, value);
            this._size++;
            return this.root;
        } else {
            let node = this.root;
            while(true){
                const order = this.compare(value, node.value);
                if (order === 0) break;
                const direction = order < 0 ? "left" : "right";
                if (node[direction]) {
                    node = node[direction];
                } else {
                    node[direction] = new Node(node, value);
                    this._size++;
                    return node[direction];
                }
            }
        }
        return null;
    }
    removeNode(value) {
        let removeNode = this.findNode(value);
        if (removeNode) {
            const successorNode = !removeNode.left || !removeNode.right ? removeNode : removeNode.findSuccessorNode();
            const replacementNode = successorNode.left ?? successorNode.right;
            if (replacementNode) replacementNode.parent = successorNode.parent;
            if (!successorNode.parent) {
                this.root = replacementNode;
            } else {
                successorNode.parent[successorNode.directionFromParent()] = replacementNode;
            }
            if (successorNode !== removeNode) {
                removeNode.value = successorNode.value;
                removeNode = successorNode;
            }
            this._size--;
        }
        return removeNode;
    }
    /**
   * Adds the value to the binary search tree if it does not already exist in it.
   * Returns true if successful.
   */ insert(value) {
        return !!this.insertNode(BinarySearchNode, value);
    }
    /**
   * Removes node value from the binary search tree if found.
   * Returns true if found and removed.
   */ remove(value) {
        return !!this.removeNode(value);
    }
    /** Returns node value if found in the binary search tree. */ find(value) {
        return this.findNode(value)?.value ?? null;
    }
    /** Returns the minimum value in the binary search tree or null if empty. */ min() {
        return this.root ? this.root.findMinNode().value : null;
    }
    /** Returns the maximum value in the binary search tree or null if empty. */ max() {
        return this.root ? this.root.findMaxNode().value : null;
    }
    /** Removes all values from the binary search tree. */ clear() {
        this.root = null;
        this._size = 0;
    }
    /** Checks if the binary search tree is empty. */ isEmpty() {
        return this.size === 0;
    }
    /**
   * Returns an iterator that uses in-order (LNR) tree traversal for
   * retrieving values from the binary search tree.
   */ *lnrValues() {
        const nodes = [];
        let node = this.root;
        while(nodes.length || node){
            if (node) {
                nodes.push(node);
                node = node.left;
            } else {
                node = nodes.pop();
                yield node.value;
                node = node.right;
            }
        }
    }
    /**
   * Returns an iterator that uses reverse in-order (RNL) tree traversal for
   * retrieving values from the binary search tree.
   */ *rnlValues() {
        const nodes = [];
        let node = this.root;
        while(nodes.length || node){
            if (node) {
                nodes.push(node);
                node = node.right;
            } else {
                node = nodes.pop();
                yield node.value;
                node = node.left;
            }
        }
    }
    /**
   * Returns an iterator that uses pre-order (NLR) tree traversal for
   * retrieving values from the binary search tree.
   */ *nlrValues() {
        const nodes = [];
        if (this.root) nodes.push(this.root);
        while(nodes.length){
            const node = nodes.pop();
            yield node.value;
            if (node.right) nodes.push(node.right);
            if (node.left) nodes.push(node.left);
        }
    }
    /**
   * Returns an iterator that uses post-order (LRN) tree traversal for
   * retrieving values from the binary search tree.
   */ *lrnValues() {
        const nodes = [];
        let node = this.root;
        let lastNodeVisited = null;
        while(nodes.length || node){
            if (node) {
                nodes.push(node);
                node = node.left;
            } else {
                const lastNode = nodes[nodes.length - 1];
                if (lastNode.right && lastNode.right !== lastNodeVisited) {
                    node = lastNode.right;
                } else {
                    yield lastNode.value;
                    lastNodeVisited = nodes.pop();
                }
            }
        }
    }
    /**
   * Returns an iterator that uses level order tree traversal for
   * retrieving values from the binary search tree.
   */ *lvlValues() {
        const children = [];
        let cursor = this.root;
        while(cursor){
            yield cursor.value;
            if (cursor.left) children.push(cursor.left);
            if (cursor.right) children.push(cursor.right);
            cursor = children.shift() ?? null;
        }
    }
    /**
   * Returns an iterator that uses in-order (LNR) tree traversal for
   * retrieving values from the binary search tree.
   */ *[Symbol.iterator]() {
        yield* this.lnrValues();
    }
    compare;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE1My4wL2NvbGxlY3Rpb25zL2JpbmFyeV9zZWFyY2hfdHJlZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLyoqIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS4gKi9cblxuaW1wb3J0IHsgYXNjZW5kIH0gZnJvbSBcIi4vX2NvbXBhcmF0b3JzLnRzXCI7XG5pbXBvcnQgeyBCaW5hcnlTZWFyY2hOb2RlLCBEaXJlY3Rpb24gfSBmcm9tIFwiLi9iaW5hcnlfc2VhcmNoX25vZGUudHNcIjtcbmV4cG9ydCAqIGZyb20gXCIuL19jb21wYXJhdG9ycy50c1wiO1xuXG4vKipcbiAqIEFuIHVuYmFsYW5jZWQgYmluYXJ5IHNlYXJjaCB0cmVlLiBUaGUgdmFsdWVzIGFyZSBpbiBhc2NlbmRpbmcgb3JkZXIgYnkgZGVmYXVsdCxcbiAqIHVzaW5nIEphdmFTY3JpcHQncyBidWlsdCBpbiBjb21wYXJpc29uIG9wZXJhdG9ycyB0byBzb3J0IHRoZSB2YWx1ZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW5hcnlTZWFyY2hUcmVlPFQ+IGltcGxlbWVudHMgSXRlcmFibGU8VD4ge1xuICBwcm90ZWN0ZWQgcm9vdDogQmluYXJ5U2VhcmNoTm9kZTxUPiB8IG51bGwgPSBudWxsO1xuICBwcm90ZWN0ZWQgX3NpemUgPSAwO1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgY29tcGFyZTogKGE6IFQsIGI6IFQpID0+IG51bWJlciA9IGFzY2VuZCxcbiAgKSB7fVxuXG4gIC8qKiBDcmVhdGVzIGEgbmV3IGJpbmFyeSBzZWFyY2ggdHJlZSBmcm9tIGFuIGFycmF5IGxpa2Ugb3IgaXRlcmFibGUgb2JqZWN0LiAqL1xuICBzdGF0aWMgZnJvbTxUPihcbiAgICBjb2xsZWN0aW9uOiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPiB8IEJpbmFyeVNlYXJjaFRyZWU8VD4sXG4gICk6IEJpbmFyeVNlYXJjaFRyZWU8VD47XG4gIHN0YXRpYyBmcm9tPFQ+KFxuICAgIGNvbGxlY3Rpb246IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+IHwgQmluYXJ5U2VhcmNoVHJlZTxUPixcbiAgICBvcHRpb25zOiB7XG4gICAgICBjb21wYXJlPzogKGE6IFQsIGI6IFQpID0+IG51bWJlcjtcbiAgICB9LFxuICApOiBCaW5hcnlTZWFyY2hUcmVlPFQ+O1xuICBzdGF0aWMgZnJvbTxULCBVLCBWPihcbiAgICBjb2xsZWN0aW9uOiBBcnJheUxpa2U8VD4gfCBJdGVyYWJsZTxUPiB8IEJpbmFyeVNlYXJjaFRyZWU8VD4sXG4gICAgb3B0aW9uczoge1xuICAgICAgY29tcGFyZT86IChhOiBVLCBiOiBVKSA9PiBudW1iZXI7XG4gICAgICBtYXA6ICh2YWx1ZTogVCwgaW5kZXg6IG51bWJlcikgPT4gVTtcbiAgICAgIHRoaXNBcmc/OiBWO1xuICAgIH0sXG4gICk6IEJpbmFyeVNlYXJjaFRyZWU8VT47XG4gIHN0YXRpYyBmcm9tPFQsIFUsIFY+KFxuICAgIGNvbGxlY3Rpb246IEFycmF5TGlrZTxUPiB8IEl0ZXJhYmxlPFQ+IHwgQmluYXJ5U2VhcmNoVHJlZTxUPixcbiAgICBvcHRpb25zPzoge1xuICAgICAgY29tcGFyZT86IChhOiBVLCBiOiBVKSA9PiBudW1iZXI7XG4gICAgICBtYXA/OiAodmFsdWU6IFQsIGluZGV4OiBudW1iZXIpID0+IFU7XG4gICAgICB0aGlzQXJnPzogVjtcbiAgICB9LFxuICApOiBCaW5hcnlTZWFyY2hUcmVlPFU+IHtcbiAgICBsZXQgcmVzdWx0OiBCaW5hcnlTZWFyY2hUcmVlPFU+O1xuICAgIGxldCB1bm1hcHBlZFZhbHVlczogQXJyYXlMaWtlPFQ+IHwgSXRlcmFibGU8VD4gPSBbXTtcbiAgICBpZiAoY29sbGVjdGlvbiBpbnN0YW5jZW9mIEJpbmFyeVNlYXJjaFRyZWUpIHtcbiAgICAgIHJlc3VsdCA9IG5ldyBCaW5hcnlTZWFyY2hUcmVlKFxuICAgICAgICBvcHRpb25zPy5jb21wYXJlID8/XG4gICAgICAgICAgKGNvbGxlY3Rpb24gYXMgdW5rbm93biBhcyBCaW5hcnlTZWFyY2hUcmVlPFU+KS5jb21wYXJlLFxuICAgICAgKTtcbiAgICAgIGlmIChvcHRpb25zPy5jb21wYXJlIHx8IG9wdGlvbnM/Lm1hcCkge1xuICAgICAgICB1bm1hcHBlZFZhbHVlcyA9IGNvbGxlY3Rpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBub2RlczogQmluYXJ5U2VhcmNoTm9kZTxVPltdID0gW107XG4gICAgICAgIGlmIChjb2xsZWN0aW9uLnJvb3QpIHtcbiAgICAgICAgICByZXN1bHQucm9vdCA9IEJpbmFyeVNlYXJjaE5vZGUuZnJvbShcbiAgICAgICAgICAgIGNvbGxlY3Rpb24ucm9vdCBhcyB1bmtub3duIGFzIEJpbmFyeVNlYXJjaE5vZGU8VT4sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBub2Rlcy5wdXNoKHJlc3VsdC5yb290KTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3Qgbm9kZTogQmluYXJ5U2VhcmNoTm9kZTxVPiA9IG5vZGVzLnBvcCgpITtcbiAgICAgICAgICBjb25zdCBsZWZ0OiBCaW5hcnlTZWFyY2hOb2RlPFU+IHwgbnVsbCA9IG5vZGUubGVmdFxuICAgICAgICAgICAgPyBCaW5hcnlTZWFyY2hOb2RlLmZyb20obm9kZS5sZWZ0KVxuICAgICAgICAgICAgOiBudWxsO1xuICAgICAgICAgIGNvbnN0IHJpZ2h0OiBCaW5hcnlTZWFyY2hOb2RlPFU+IHwgbnVsbCA9IG5vZGUucmlnaHRcbiAgICAgICAgICAgID8gQmluYXJ5U2VhcmNoTm9kZS5mcm9tKG5vZGUucmlnaHQpXG4gICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICBpZiAobGVmdCkge1xuICAgICAgICAgICAgbGVmdC5wYXJlbnQgPSBub2RlO1xuICAgICAgICAgICAgbm9kZXMucHVzaChsZWZ0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgICByaWdodC5wYXJlbnQgPSBub2RlO1xuICAgICAgICAgICAgbm9kZXMucHVzaChyaWdodCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9IChvcHRpb25zPy5jb21wYXJlXG4gICAgICAgID8gbmV3IEJpbmFyeVNlYXJjaFRyZWUob3B0aW9ucy5jb21wYXJlKVxuICAgICAgICA6IG5ldyBCaW5hcnlTZWFyY2hUcmVlKCkpIGFzIEJpbmFyeVNlYXJjaFRyZWU8VT47XG4gICAgICB1bm1hcHBlZFZhbHVlcyA9IGNvbGxlY3Rpb247XG4gICAgfVxuICAgIGNvbnN0IHZhbHVlczogSXRlcmFibGU8VT4gPSBvcHRpb25zPy5tYXBcbiAgICAgID8gQXJyYXkuZnJvbSh1bm1hcHBlZFZhbHVlcywgb3B0aW9ucy5tYXAsIG9wdGlvbnMudGhpc0FyZylcbiAgICAgIDogdW5tYXBwZWRWYWx1ZXMgYXMgVVtdO1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSByZXN1bHQuaW5zZXJ0KHZhbHVlKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIFRoZSBhbW91bnQgb2YgdmFsdWVzIHN0b3JlZCBpbiB0aGUgYmluYXJ5IHNlYXJjaCB0cmVlLiAqL1xuICBnZXQgc2l6ZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9zaXplO1xuICB9XG5cbiAgcHJvdGVjdGVkIGZpbmROb2RlKHZhbHVlOiBUKTogQmluYXJ5U2VhcmNoTm9kZTxUPiB8IG51bGwge1xuICAgIGxldCBub2RlOiBCaW5hcnlTZWFyY2hOb2RlPFQ+IHwgbnVsbCA9IHRoaXMucm9vdDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgY29uc3Qgb3JkZXI6IG51bWJlciA9IHRoaXMuY29tcGFyZSh2YWx1ZSBhcyBULCBub2RlLnZhbHVlKTtcbiAgICAgIGlmIChvcmRlciA9PT0gMCkgYnJlYWs7XG4gICAgICBjb25zdCBkaXJlY3Rpb246IFwibGVmdFwiIHwgXCJyaWdodFwiID0gb3JkZXIgPCAwID8gXCJsZWZ0XCIgOiBcInJpZ2h0XCI7XG4gICAgICBub2RlID0gbm9kZVtkaXJlY3Rpb25dO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByb3RhdGVOb2RlKG5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4sIGRpcmVjdGlvbjogRGlyZWN0aW9uKSB7XG4gICAgY29uc3QgcmVwbGFjZW1lbnREaXJlY3Rpb246IERpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gXCJsZWZ0XCJcbiAgICAgID8gXCJyaWdodFwiXG4gICAgICA6IFwibGVmdFwiO1xuICAgIGlmICghbm9kZVtyZXBsYWNlbWVudERpcmVjdGlvbl0pIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGBjYW5ub3Qgcm90YXRlICR7ZGlyZWN0aW9ufSB3aXRob3V0ICR7cmVwbGFjZW1lbnREaXJlY3Rpb259IGNoaWxkYCxcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IHJlcGxhY2VtZW50OiBCaW5hcnlTZWFyY2hOb2RlPFQ+ID0gbm9kZVtyZXBsYWNlbWVudERpcmVjdGlvbl0hO1xuICAgIG5vZGVbcmVwbGFjZW1lbnREaXJlY3Rpb25dID0gcmVwbGFjZW1lbnRbZGlyZWN0aW9uXSA/PyBudWxsO1xuICAgIGlmIChyZXBsYWNlbWVudFtkaXJlY3Rpb25dKSByZXBsYWNlbWVudFtkaXJlY3Rpb25dIS5wYXJlbnQgPSBub2RlO1xuICAgIHJlcGxhY2VtZW50LnBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgIGlmIChub2RlLnBhcmVudCkge1xuICAgICAgY29uc3QgcGFyZW50RGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBub2RlID09PSBub2RlLnBhcmVudFtkaXJlY3Rpb25dXG4gICAgICAgID8gZGlyZWN0aW9uXG4gICAgICAgIDogcmVwbGFjZW1lbnREaXJlY3Rpb247XG4gICAgICBub2RlLnBhcmVudFtwYXJlbnREaXJlY3Rpb25dID0gcmVwbGFjZW1lbnQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucm9vdCA9IHJlcGxhY2VtZW50O1xuICAgIH1cbiAgICByZXBsYWNlbWVudFtkaXJlY3Rpb25dID0gbm9kZTtcbiAgICBub2RlLnBhcmVudCA9IHJlcGxhY2VtZW50O1xuICB9XG5cbiAgcHJvdGVjdGVkIGluc2VydE5vZGUoXG4gICAgTm9kZTogdHlwZW9mIEJpbmFyeVNlYXJjaE5vZGUsXG4gICAgdmFsdWU6IFQsXG4gICk6IEJpbmFyeVNlYXJjaE5vZGU8VD4gfCBudWxsIHtcbiAgICBpZiAoIXRoaXMucm9vdCkge1xuICAgICAgdGhpcy5yb290ID0gbmV3IE5vZGUobnVsbCwgdmFsdWUpO1xuICAgICAgdGhpcy5fc2l6ZSsrO1xuICAgICAgcmV0dXJuIHRoaXMucm9vdDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gPSB0aGlzLnJvb3Q7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBvcmRlcjogbnVtYmVyID0gdGhpcy5jb21wYXJlKHZhbHVlLCBub2RlLnZhbHVlKTtcbiAgICAgICAgaWYgKG9yZGVyID09PSAwKSBicmVhaztcbiAgICAgICAgY29uc3QgZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBvcmRlciA8IDAgPyBcImxlZnRcIiA6IFwicmlnaHRcIjtcbiAgICAgICAgaWYgKG5vZGVbZGlyZWN0aW9uXSkge1xuICAgICAgICAgIG5vZGUgPSBub2RlW2RpcmVjdGlvbl0hO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGVbZGlyZWN0aW9uXSA9IG5ldyBOb2RlKG5vZGUsIHZhbHVlKTtcbiAgICAgICAgICB0aGlzLl9zaXplKys7XG4gICAgICAgICAgcmV0dXJuIG5vZGVbZGlyZWN0aW9uXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByb3RlY3RlZCByZW1vdmVOb2RlKFxuICAgIHZhbHVlOiBULFxuICApOiBCaW5hcnlTZWFyY2hOb2RlPFQ+IHwgbnVsbCB7XG4gICAgbGV0IHJlbW92ZU5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gfCBudWxsID0gdGhpcy5maW5kTm9kZSh2YWx1ZSk7XG4gICAgaWYgKHJlbW92ZU5vZGUpIHtcbiAgICAgIGNvbnN0IHN1Y2Nlc3Nvck5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gfCBudWxsID1cbiAgICAgICAgIXJlbW92ZU5vZGUubGVmdCB8fCAhcmVtb3ZlTm9kZS5yaWdodFxuICAgICAgICAgID8gcmVtb3ZlTm9kZVxuICAgICAgICAgIDogcmVtb3ZlTm9kZS5maW5kU3VjY2Vzc29yTm9kZSgpITtcbiAgICAgIGNvbnN0IHJlcGxhY2VtZW50Tm9kZTogQmluYXJ5U2VhcmNoTm9kZTxUPiB8IG51bGwgPSBzdWNjZXNzb3JOb2RlLmxlZnQgPz9cbiAgICAgICAgc3VjY2Vzc29yTm9kZS5yaWdodDtcbiAgICAgIGlmIChyZXBsYWNlbWVudE5vZGUpIHJlcGxhY2VtZW50Tm9kZS5wYXJlbnQgPSBzdWNjZXNzb3JOb2RlLnBhcmVudDtcblxuICAgICAgaWYgKCFzdWNjZXNzb3JOb2RlLnBhcmVudCkge1xuICAgICAgICB0aGlzLnJvb3QgPSByZXBsYWNlbWVudE5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdWNjZXNzb3JOb2RlLnBhcmVudFtzdWNjZXNzb3JOb2RlLmRpcmVjdGlvbkZyb21QYXJlbnQoKSFdID1cbiAgICAgICAgICByZXBsYWNlbWVudE5vZGU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdWNjZXNzb3JOb2RlICE9PSByZW1vdmVOb2RlKSB7XG4gICAgICAgIHJlbW92ZU5vZGUudmFsdWUgPSBzdWNjZXNzb3JOb2RlLnZhbHVlO1xuICAgICAgICByZW1vdmVOb2RlID0gc3VjY2Vzc29yTm9kZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3NpemUtLTtcbiAgICB9XG4gICAgcmV0dXJuIHJlbW92ZU5vZGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyB0aGUgdmFsdWUgdG8gdGhlIGJpbmFyeSBzZWFyY2ggdHJlZSBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0IGluIGl0LlxuICAgKiBSZXR1cm5zIHRydWUgaWYgc3VjY2Vzc2Z1bC5cbiAgICovXG4gIGluc2VydCh2YWx1ZTogVCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuaW5zZXJ0Tm9kZShCaW5hcnlTZWFyY2hOb2RlLCB2YWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBub2RlIHZhbHVlIGZyb20gdGhlIGJpbmFyeSBzZWFyY2ggdHJlZSBpZiBmb3VuZC5cbiAgICogUmV0dXJucyB0cnVlIGlmIGZvdW5kIGFuZCByZW1vdmVkLlxuICAgKi9cbiAgcmVtb3ZlKHZhbHVlOiBUKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5yZW1vdmVOb2RlKHZhbHVlKTtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIG5vZGUgdmFsdWUgaWYgZm91bmQgaW4gdGhlIGJpbmFyeSBzZWFyY2ggdHJlZS4gKi9cbiAgZmluZCh2YWx1ZTogVCk6IFQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5maW5kTm9kZSh2YWx1ZSk/LnZhbHVlID8/IG51bGw7XG4gIH1cblxuICAvKiogUmV0dXJucyB0aGUgbWluaW11bSB2YWx1ZSBpbiB0aGUgYmluYXJ5IHNlYXJjaCB0cmVlIG9yIG51bGwgaWYgZW1wdHkuICovXG4gIG1pbigpOiBUIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMucm9vdCA/IHRoaXMucm9vdC5maW5kTWluTm9kZSgpLnZhbHVlIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSBtYXhpbXVtIHZhbHVlIGluIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUgb3IgbnVsbCBpZiBlbXB0eS4gKi9cbiAgbWF4KCk6IFQgfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5yb290ID8gdGhpcy5yb290LmZpbmRNYXhOb2RlKCkudmFsdWUgOiBudWxsO1xuICB9XG5cbiAgLyoqIFJlbW92ZXMgYWxsIHZhbHVlcyBmcm9tIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUuICovXG4gIGNsZWFyKCkge1xuICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgdGhpcy5fc2l6ZSA9IDA7XG4gIH1cblxuICAvKiogQ2hlY2tzIGlmIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgZW1wdHkuICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGl0ZXJhdG9yIHRoYXQgdXNlcyBpbi1vcmRlciAoTE5SKSB0cmVlIHRyYXZlcnNhbCBmb3JcbiAgICogcmV0cmlldmluZyB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IHNlYXJjaCB0cmVlLlxuICAgKi9cbiAgKmxuclZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgICBjb25zdCBub2RlczogQmluYXJ5U2VhcmNoTm9kZTxUPltdID0gW107XG4gICAgbGV0IG5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gfCBudWxsID0gdGhpcy5yb290O1xuICAgIHdoaWxlIChub2Rlcy5sZW5ndGggfHwgbm9kZSkge1xuICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgbm9kZSA9IG5vZGUubGVmdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2Rlcy5wb3AoKSE7XG4gICAgICAgIHlpZWxkIG5vZGUudmFsdWU7XG4gICAgICAgIG5vZGUgPSBub2RlLnJpZ2h0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGl0ZXJhdG9yIHRoYXQgdXNlcyByZXZlcnNlIGluLW9yZGVyIChSTkwpIHRyZWUgdHJhdmVyc2FsIGZvclxuICAgKiByZXRyaWV2aW5nIHZhbHVlcyBmcm9tIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUuXG4gICAqL1xuICAqcm5sVmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuICAgIGNvbnN0IG5vZGVzOiBCaW5hcnlTZWFyY2hOb2RlPFQ+W10gPSBbXTtcbiAgICBsZXQgbm9kZTogQmluYXJ5U2VhcmNoTm9kZTxUPiB8IG51bGwgPSB0aGlzLnJvb3Q7XG4gICAgd2hpbGUgKG5vZGVzLmxlbmd0aCB8fCBub2RlKSB7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5yaWdodDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUgPSBub2Rlcy5wb3AoKSE7XG4gICAgICAgIHlpZWxkIG5vZGUudmFsdWU7XG4gICAgICAgIG5vZGUgPSBub2RlLmxlZnQ7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB1c2VzIHByZS1vcmRlciAoTkxSKSB0cmVlIHRyYXZlcnNhbCBmb3JcbiAgICogcmV0cmlldmluZyB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IHNlYXJjaCB0cmVlLlxuICAgKi9cbiAgKm5sclZhbHVlcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+IHtcbiAgICBjb25zdCBub2RlczogQmluYXJ5U2VhcmNoTm9kZTxUPltdID0gW107XG4gICAgaWYgKHRoaXMucm9vdCkgbm9kZXMucHVzaCh0aGlzLnJvb3QpO1xuICAgIHdoaWxlIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gPSBub2Rlcy5wb3AoKSE7XG4gICAgICB5aWVsZCBub2RlLnZhbHVlO1xuICAgICAgaWYgKG5vZGUucmlnaHQpIG5vZGVzLnB1c2gobm9kZS5yaWdodCk7XG4gICAgICBpZiAobm9kZS5sZWZ0KSBub2Rlcy5wdXNoKG5vZGUubGVmdCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB1c2VzIHBvc3Qtb3JkZXIgKExSTikgdHJlZSB0cmF2ZXJzYWwgZm9yXG4gICAqIHJldHJpZXZpbmcgdmFsdWVzIGZyb20gdGhlIGJpbmFyeSBzZWFyY2ggdHJlZS5cbiAgICovXG4gICpscm5WYWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxUPiB7XG4gICAgY29uc3Qgbm9kZXM6IEJpbmFyeVNlYXJjaE5vZGU8VD5bXSA9IFtdO1xuICAgIGxldCBub2RlOiBCaW5hcnlTZWFyY2hOb2RlPFQ+IHwgbnVsbCA9IHRoaXMucm9vdDtcbiAgICBsZXQgbGFzdE5vZGVWaXNpdGVkOiBCaW5hcnlTZWFyY2hOb2RlPFQ+IHwgbnVsbCA9IG51bGw7XG4gICAgd2hpbGUgKG5vZGVzLmxlbmd0aCB8fCBub2RlKSB7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICBub2RlID0gbm9kZS5sZWZ0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbGFzdE5vZGU6IEJpbmFyeVNlYXJjaE5vZGU8VD4gPSBub2Rlc1tub2Rlcy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3ROb2RlLnJpZ2h0ICYmIGxhc3ROb2RlLnJpZ2h0ICE9PSBsYXN0Tm9kZVZpc2l0ZWQpIHtcbiAgICAgICAgICBub2RlID0gbGFzdE5vZGUucmlnaHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgeWllbGQgbGFzdE5vZGUudmFsdWU7XG4gICAgICAgICAgbGFzdE5vZGVWaXNpdGVkID0gbm9kZXMucG9wKCkhO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gaXRlcmF0b3IgdGhhdCB1c2VzIGxldmVsIG9yZGVyIHRyZWUgdHJhdmVyc2FsIGZvclxuICAgKiByZXRyaWV2aW5nIHZhbHVlcyBmcm9tIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUuXG4gICAqL1xuICAqbHZsVmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuICAgIGNvbnN0IGNoaWxkcmVuOiBCaW5hcnlTZWFyY2hOb2RlPFQ+W10gPSBbXTtcbiAgICBsZXQgY3Vyc29yOiBCaW5hcnlTZWFyY2hOb2RlPFQ+IHwgbnVsbCA9IHRoaXMucm9vdDtcbiAgICB3aGlsZSAoY3Vyc29yKSB7XG4gICAgICB5aWVsZCBjdXJzb3IudmFsdWU7XG4gICAgICBpZiAoY3Vyc29yLmxlZnQpIGNoaWxkcmVuLnB1c2goY3Vyc29yLmxlZnQpO1xuICAgICAgaWYgKGN1cnNvci5yaWdodCkgY2hpbGRyZW4ucHVzaChjdXJzb3IucmlnaHQpO1xuICAgICAgY3Vyc29yID0gY2hpbGRyZW4uc2hpZnQoKSA/PyBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGl0ZXJhdG9yIHRoYXQgdXNlcyBpbi1vcmRlciAoTE5SKSB0cmVlIHRyYXZlcnNhbCBmb3JcbiAgICogcmV0cmlldmluZyB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IHNlYXJjaCB0cmVlLlxuICAgKi9cbiAgKltTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD4ge1xuICAgIHlpZWxkKiB0aGlzLmxuclZhbHVlcygpO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHVDQUF1QyxHQUV2QyxTQUFTLE1BQU0sUUFBUSxtQkFBbUIsQ0FBQztBQUMzQyxTQUFTLGdCQUFnQixRQUFtQix5QkFBeUIsQ0FBQztBQUN0RSxjQUFjLG1CQUFtQixDQUFDO0FBRWxDOzs7Q0FHQyxHQUNELE9BQU8sTUFBTSxnQkFBZ0I7SUFDM0IsQUFBVSxJQUFJLENBQW9DO0lBQ2xELEFBQVUsS0FBSyxDQUFLO0lBQ3BCLFlBQ1ksT0FBK0IsR0FBRyxNQUFNLENBQ2xEO1FBRFUsZUFBQSxPQUErQixDQUFBO2FBSGpDLElB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