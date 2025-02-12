// Класс узла Splay-дерева
class SplayTreeNode {
    constructor(key) {
        this.key = key;
        this.left = null;
        this.right = null;
    }
}

// Правый поворот
function rotateRight(x) {
    const y = x.left;
    x.left = y.right;
    y.right = x;
    return y;
}

// Левый поворот
function rotateLeft(x) {
    const y = x.right;
    x.right = y.left;
    y.left = x;
    return y;
}

/**
 * Функция splay:
 * Перемещает узел с заданным ключом (или последний посещённый узел, если ключ не найден)
 * в корень дерева, используя рекурсивные повороты.
 */
function splay(root, key) {
    if (root === null || root.key === key) {
        return root;
    }

    // Если ключ меньше, чем ключ корня — работаем с левым поддеревом
    if (key < root.key) {
        if (root.left === null) return root;
        // Zig-Zig (левый левый случай)
        if (key < root.left.key) {
            root.left.left = splay(root.left.left, key);
            root = rotateRight(root);
        }
        // Zig-Zag (левый правый случай)
        else if (key > root.left.key) {
            root.left.right = splay(root.left.right, key);
            if (root.left.right !== null) {
                root.left = rotateLeft(root.left);
            }
        }
        return root.left === null ? root : rotateRight(root);
    }
    // Если ключ больше, чем ключ корня — работаем с правым поддеревом
    else {
        if (root.right === null) return root;
        // Zig-Zig (правый правый случай)
        if (key > root.right.key) {
            root.right.right = splay(root.right.right, key);
            root = rotateLeft(root);
        }
        // Zig-Zag (правый левый случай)
        else if (key < root.right.key) {
            root.right.left = splay(root.right.left, key);
            if (root.right.left !== null) {
                root.right = rotateRight(root.right);
            }
        }
        return root.right === null ? root : rotateLeft(root);
    }
}

class SplayTree {
    constructor() {
        this.root = null;
    }

    /**
     * Поиск ключа в дереве.
     * Если ключ найден, он перемещается в корень.
     */
    search(key) {
        this.root = splay(this.root, key);
        return this.root && this.root.key === key ? this.root : null;
    }

    /**
     * Вставка нового ключа в Splay-дерево.
     */
    insert(key) {
        if (this.root === null) {
            this.root = new SplayTreeNode(key);
            return;
        }
        // Splay-им дерево по ключу
        this.root = splay(this.root, key);
        if (this.root.key === key) {
            console.log(`Ключ ${key} уже существует в дереве.`);
            return; // Дубликаты не разрешены
        }
        const newNode = new SplayTreeNode(key);
        if (key < this.root.key) {
            newNode.right = this.root;
            newNode.left = this.root.left;
            this.root.left = null;
        } else {
            newNode.left = this.root;
            newNode.right = this.root.right;
            this.root.right = null;
        }
        this.root = newNode;
    }

    /**
     * Удаление ключа из Splay-дерева.
     */
    delete(key) {
        if (this.root === null) return;
        // Splay-им дерево так, чтобы удаляемый ключ оказался в корне (если он есть)
        this.root = splay(this.root, key);
        if (this.root.key !== key) {
            console.log(`Ключ ${key} не найден в дереве.`);
            return;
        }
        // Удаляем корневой узел
        if (this.root.left === null) {
            this.root = this.root.right;
        } else {
            const temp = this.root.right;
            this.root = this.root.left;
            // Splay-им дерево по ключу, чтобы в корне оказался максимум левого поддерева
            this.root = splay(this.root, key);
            this.root.right = temp;
        }
    }
}

export default SplayTree;
