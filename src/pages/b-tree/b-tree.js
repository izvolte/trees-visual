class BTreeNode {
    constructor(maxKeys, isLeaf = true) {
        this.maxKeys = maxKeys;
        this.isLeaf = isLeaf;
        this.keys = [];
        this.children = [];

        // Minimum degree (T).
        // For a node to hold up to maxKeys, we have T = Math.floor((maxKeys + 1) / 2).
        // Example: if maxKeys = 3, T = 2 => each node can have 1..3 keys, except root can have fewer.
        this.minDegree = Math.floor((this.maxKeys + 1) / 2);
    }

    // ===================
    //  Insertion methods
    // ===================

    // Insert a new key in a node that is assumed to be non-full
    insertNonFull(key) {
        let i = this.keys.length - 1;

        if (this.isLeaf) {
            // Insert in the leaf node
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            // Check duplicates
            if (i >= 0 && this.keys[i] === key) {
                console.log(`Ключ ${key} уже существует в дереве.`);
                return;
            }
            this.keys.splice(i + 1, 0, key);
        } else {
            // Move i to find the child to recurse on
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            i++;
            // If the chosen child is full, split it
            if (this.children[i].keys.length === this.maxKeys) {
                this.splitChild(i);
                // After splitting, decide which of the two children to go to
                if (key > this.keys[i]) {
                    i++;
                } else if (key === this.keys[i]) {
                    console.log(`Ключ ${key} уже существует в дереве.`);
                    return;
                }
            }
            this.children[i].insertNonFull(key);
        }
    }

    // Split a full child node
    splitChild(index) {
        const child = this.children[index];
        const newNode = new BTreeNode(child.maxKeys, child.isLeaf);

        // Midpoint index (T-1, if maxKeys=2T-1)
        const midIndex = Math.floor(child.maxKeys / 2);

        // Move the higher keys to newNode
        newNode.keys = child.keys.splice(midIndex + 1);

        // Middle key to lift up
        const upKey = child.keys.splice(midIndex, 1)[0];

        // Move children over if non-leaf
        if (!child.isLeaf) {
            newNode.children = child.children.splice(midIndex + 1);
        }

        // Insert the new child into "this"
        this.keys.splice(index, 0, upKey);
        this.children.splice(index + 1, 0, newNode);
    }

    // =============
    //  Deletion API
    // =============

    /**
     * Recursively delete the key from the subtree rooted with this node.
     */
    deleteKey(key) {
        const idx = this.findKey(key);

        // Case A: key is in this node's keys[]
        if (idx < this.keys.length && this.keys[idx] === key) {
            if (this.isLeaf) {
                // Case A1: key is in a leaf node
                this.removeFromLeaf(idx);
            } else {
                // Case A2: key is in an internal node
                this.removeFromNonLeaf(idx);
            }
        } else {
            // Case B: key is not in this node
            if (this.isLeaf) {
                // If the node is leaf, then the key does not exist in the tree
                // Nothing to do.
                return;
            }

            // Otherwise, the key is in one of the children
            // Decide the child which should contain the key
            const childIndex = idx; // This is the child that will contain the key
            // Before recursing, ensure the child has at least minDegree keys
            if (this.children[childIndex].keys.length < this.minDegree) {
                this.fill(childIndex);
            }

            // Now the child has enough keys; recurse
            this.children[childIndex].deleteKey(key);
        }
    }

    /**
     * Return the index of the first key >= key, or this.keys.length if none are >= key.
     */
    findKey(key) {
        let idx = 0;
        while (idx < this.keys.length && this.keys[idx] < key) {
            idx++;
        }
        return idx;
    }

    /**
     * Remove the key at keys[idx] from a leaf node.
     */
    removeFromLeaf(idx) {
        this.keys.splice(idx, 1);
    }

    /**
     * Remove the key at keys[idx] from an internal node.
     *   - If the left child has >= minDegree keys, replace the key by its predecessor
     *   - Else if the right child has >= minDegree keys, replace the key by its successor
     *   - Else merge the two children around the key and then delete from the merged child
     */
    removeFromNonLeaf(idx) {
        const key = this.keys[idx];
        const leftChild = this.children[idx];
        const rightChild = this.children[idx + 1];

        if (leftChild.keys.length >= this.minDegree) {
            // Replace with predecessor
            const pred = this.getPredecessor(idx);
            this.keys[idx] = pred;
            leftChild.deleteKey(pred);
        } else if (rightChild.keys.length >= this.minDegree) {
            // Replace with successor
            const succ = this.getSuccessor(idx);
            this.keys[idx] = succ;
            rightChild.deleteKey(succ);
        } else {
            // Merge children[idx] and children[idx+1]
            this.merge(idx);
            // After merge, the key we want to delete is in children[idx]
            leftChild.deleteKey(key);
        }
    }

    /**
     * Get predecessor of keys[idx]:
     *   - Move to the left child, then keep going to the rightmost leaf.
     */
    getPredecessor(idx) {
        let current = this.children[idx];
        while (!current.isLeaf) {
            current = current.children[current.children.length - 1];
        }
        return current.keys[current.keys.length - 1];
    }

    /**
     * Get successor of keys[idx]:
     *   - Move to the right child, then keep going to the leftmost leaf.
     */
    getSuccessor(idx) {
        let current = this.children[idx + 1];
        while (!current.isLeaf) {
            current = current.children[0];
        }
        return current.keys[0];
    }

    /**
     * Ensure that the child node children[idx] has at least minDegree-1 keys.
     * If it has fewer, we try to borrow from siblings or merge.
     */
    fill(idx) {
        // Borrow from previous sibling?
        if (idx > 0 && this.children[idx - 1].keys.length >= this.minDegree) {
            this.borrowFromPrev(idx);
        }
        // Borrow from next sibling?
        else if (
            idx < this.children.length - 1 &&
            this.children[idx + 1].keys.length >= this.minDegree
        ) {
            this.borrowFromNext(idx);
        } else {
            // Otherwise, merge with a sibling
            if (idx < this.children.length - 1) {
                this.merge(idx);
            } else {
                this.merge(idx - 1);
            }
        }
    }

    /**
     * Borrow one key from children[idx-1] and move it to children[idx].
     */
    borrowFromPrev(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx - 1];

        // The last key from sibling goes up to the parent
        // The key at parent[idx-1] goes down to child
        child.keys.unshift(this.keys[idx - 1]);
        this.keys[idx - 1] = sibling.keys.pop();

        // Move the sibling's last child as the first child of "child" if not leaf
        if (!child.isLeaf) {
            child.children.unshift(sibling.children.pop());
        }
    }

    /**
     * Borrow one key from children[idx+1] and move it to children[idx].
     */
    borrowFromNext(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx + 1];

        // The first key from sibling goes up to the parent
        // The key at parent[idx] goes down to child
        child.keys.push(this.keys[idx]);
        this.keys[idx] = sibling.keys.shift();

        // Move the sibling's first child as the last child of "child" if not leaf
        if (!child.isLeaf) {
            child.children.push(sibling.children.shift());
        }
    }

    /**
     * Merge children[idx] and children[idx+1].
     * The key this.keys[idx] moves down into the merged node.
     */
    merge(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx + 1];
        const mergeKey = this.keys[idx];

        // Insert mergeKey into the left child
        child.keys.push(mergeKey);

        // Add sibling's keys
        for (let k of sibling.keys) {
            child.keys.push(k);
        }

        // If not leaf, connect the children
        if (!child.isLeaf) {
            for (let c of sibling.children) {
                child.children.push(c);
            }
        }

        // Remove the key and sibling
        this.keys.splice(idx, 1);
        this.children.splice(idx + 1, 1);
    }
}

export default class BTree {
    constructor(maxKeys) {
        if (maxKeys < 3) {
            throw new Error(
                "Максимальное количество ключей должно быть не меньше 3"
            );
        }
        this.maxKeys = maxKeys;
        this.root = new BTreeNode(this.maxKeys, true);
    }

    insert(key) {
        const root = this.root;
        if (root.keys.length === this.maxKeys) {
            // If root is full, split
            const newRoot = new BTreeNode(this.maxKeys, false);
            newRoot.children.push(root);
            newRoot.splitChild(0);
            this.root = newRoot;
            this.root.insertNonFull(key);
        } else {
            root.insertNonFull(key);
        }
    }

    /**
     * Delete a key from the B-Tree if it exists.
     */
    delete(key) {
        if (!this.root) return; // Empty tree
        this.root.deleteKey(key);

        // If the root has become empty and is not leaf, make its child the new root
        if (this.root.keys.length === 0 && !this.root.isLeaf) {
            this.root = this.root.children[0];
        }

        // If the root is empty and a leaf, the tree is empty
        if (this.root.keys.length === 0 && this.root.isLeaf) {
            this.root = null;
        }
    }
}
