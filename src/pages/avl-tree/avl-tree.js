// Класс узла AVL-дерева
class AVLTreeNode {
    constructor(key) {
        this.key = key;
        this.left = null;
        this.right = null;
        this.height = 1; // высота узла (листьевая – 1)
    }
}

// Вспомогательные функции
function getHeight(node) {
    return node ? node.height : 0;
}

function updateHeight(node) {
    if (node) {
        node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    }
}

function getBalance(node) {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

// Правый поворот (rotateRight)
function rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Поворот: x становится корнем, y – правым ребенком x
    x.right = y;
    y.left = T2;

    // Обновляем высоты
    updateHeight(y);
    updateHeight(x);

    return x;
}

// Левый поворот (rotateLeft)
function rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Поворот: y становится корнем, x – левым ребенком y
    y.left = x;
    x.right = T2;

    // Обновляем высоты
    updateHeight(x);
    updateHeight(y);

    return y;
}

// Класс AVL-дерева
class AVLTree {
    constructor() {
        this.root = null;
    }

    /**
     * Вставка нового ключа в AVL-дерево.
     */
    insert(key) {
        this.root = this._insertRec(this.root, key);
    }

    _insertRec(node, key) {
        // Стандартная вставка в BST
        if (!node) {
            return new AVLTreeNode(key);
        }
        if (key < node.key) {
            node.left = this._insertRec(node.left, key);
        } else if (key > node.key) {
            node.right = this._insertRec(node.right, key);
        } else {
            // Дубликаты не разрешены
            console.log(`Ключ ${key} уже существует в дереве.`);
            return node;
        }

        // Обновляем высоту текущего узла
        updateHeight(node);

        // Получаем коэффициент баланса
        const balance = getBalance(node);

        // Левый левый случай
        if (balance > 1 && key < node.left.key) {
            return rotateRight(node);
        }
        // Правый правый случай
        if (balance < -1 && key > node.right.key) {
            return rotateLeft(node);
        }
        // Левый правый случай
        if (balance > 1 && key > node.left.key) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        // Правый левый случай
        if (balance < -1 && key < node.right.key) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }

        return node;
    }

    /**
     * Удаление ключа из AVL-дерева.
     */
    delete(key) {
        this.root = this._deleteRec(this.root, key);
    }

    _deleteRec(node, key) {
        if (!node) return node;

        // Ищем удаляемый ключ
        if (key < node.key) {
            node.left = this._deleteRec(node.left, key);
        } else if (key > node.key) {
            node.right = this._deleteRec(node.right, key);
        } else {
            // Нашли узел для удаления
            if (!node.left || !node.right) {
                // Случай: один или ноль детей
                const temp = node.left ? node.left : node.right;
                if (!temp) {
                    // Без детей
                    node = null;
                } else {
                    // Один ребенок
                    node = temp;
                }
            } else {
                // Узел с двумя детьми: находим inorder-предшественника/преемника
                const temp = this._minValueNode(node.right);
                node.key = temp.key;
                node.right = this._deleteRec(node.right, temp.key);
            }
        }

        // Если дерево имело только один узел
        if (!node) return node;

        // Обновляем высоту
        updateHeight(node);

        // Балансировка узла
        const balance = getBalance(node);

        // Левый левый случай
        if (balance > 1 && getBalance(node.left) >= 0) {
            return rotateRight(node);
        }
        // Левый правый случай
        if (balance > 1 && getBalance(node.left) < 0) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        // Правый правый случай
        if (balance < -1 && getBalance(node.right) <= 0) {
            return rotateLeft(node);
        }
        // Правый левый случай
        if (balance < -1 && getBalance(node.right) > 0) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }

        return node;
    }

    // Поиск минимального узла в поддереве
    _minValueNode(node) {
        let current = node;
        while (current.left) {
            current = current.left;
        }
        return current;
    }
}

export default AVLTree;
