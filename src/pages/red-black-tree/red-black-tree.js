// red-black-tree.js

// Для удобства используем строки "RED" и "BLACK"
const RED = "RED";
const BLACK = "BLACK";

class RBNode {
    constructor(key) {
        this.key = key;
        this.color = RED; // Новый узел всегда изначально красный
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

export default class RedBlackTree {
    constructor() {
        this.root = null;
    }

    insert(key) {
        // 1. Обычная вставка в бинарное дерево поиска
        let newNode = new RBNode(key);
        if (this.root === null) {
            // Пустое дерево
            this.root = newNode;
        } else {
            let current = this.root;
            let parent = null;

            while (current !== null) {
                parent = current;
                if (key < current.key) {
                    current = current.left;
                } else if (key > current.key) {
                    current = current.right;
                } else {
                    // Если ключ уже есть, можно либо игнорировать,
                    // либо заменить, либо не вставлять дубликаты
                    return; // Для простоты не вставляем дубликат
                }
            }

            // Подвешиваем новый узел
            newNode.parent = parent;
            if (key < parent.key) {
                parent.left = newNode;
            } else {
                parent.right = newNode;
            }
        }

        // 2. Балансировка (fixup) после вставки
        this.fixInsert(newNode);
    }

    fixInsert(node) {
        // Пока родитель — красный, надо исправлять
        while (node !== this.root && node.parent.color === RED) {
            let parent = node.parent;
            let grandparent = parent.parent;

            if (parent === grandparent.left) {
                // Дядя (правый ребёнок grandparent)
                let uncle = grandparent.right;
                if (uncle && uncle.color === RED) {
                    // 1) Дядя красный - просто перекрашиваем
                    parent.color = BLACK;
                    uncle.color = BLACK;
                    grandparent.color = RED;
                    node = grandparent; // поднимаемся вверх
                } else {
                    // 2) Дядя чёрный
                    if (node === parent.right) {
                        // 2a) "Зиг-заг": поворот влево вокруг родителя
                        this.rotateLeft(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    // 2b) "Зиг-зиг": поворот вправо вокруг дедушки + перекраска
                    parent.color = BLACK;
                    grandparent.color = RED;
                    this.rotateRight(grandparent);
                }
            } else {
                // parent === grandparent.right
                let uncle = grandparent.left;
                if (uncle && uncle.color === RED) {
                    // 1) Дядя красный
                    parent.color = BLACK;
                    uncle.color = BLACK;
                    grandparent.color = RED;
                    node = grandparent;
                } else {
                    // 2) Дядя чёрный
                    if (node === parent.left) {
                        this.rotateRight(parent);
                        node = parent;
                        parent = node.parent;
                    }
                    parent.color = BLACK;
                    grandparent.color = RED;
                    this.rotateLeft(grandparent);
                }
            }
        }
        // Корень всегда чёрный
        this.root.color = BLACK;
    }

    // Поворот влево вокруг узла x
    rotateLeft(x) {
        let y = x.right;
        if (!y) return; // Защита от null

        // 1) "поднимаем" левое поддерево y
        x.right = y.left;
        if (y.left) {
            y.left.parent = x;
        }

        // 2) Связываем y с родителем x
        y.parent = x.parent;
        if (!x.parent) {
            // x был корнем
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }

        // 3) Делаем x левым дочерним узлом y
        y.left = x;
        x.parent = y;
    }

    // Поворот вправо вокруг узла x
    rotateRight(x) {
        let y = x.left;
        if (!y) return;

        x.left = y.right;
        if (y.right) {
            y.right.parent = x;
        }

        y.parent = x.parent;
        if (!x.parent) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }

        y.right = x;
        x.parent = y;
    }
}
