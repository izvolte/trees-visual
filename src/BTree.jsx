// BTree.js

class BTreeNode {
    constructor(maxKeys, isLeaf = true) {
        this.maxKeys = maxKeys;
        this.keys = [];
        this.children = [];
        this.isLeaf = isLeaf;
    }

    // Метод для вставки ключа в узел, который не полон
    insertNonFull(key) {
        let i = this.keys.length - 1;

        if (this.isLeaf) {
            // Вставка ключа в листовом узле
            // Проверка на дубликаты
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            if (i >= 0 && this.keys[i] === key) {
                console.log(`Ключ ${key} уже существует в дереве.`);
                return;
            }
            this.keys.splice(i + 1, 0, key);
        } else {
            // Найти дочерний узел, в который нужно вставить ключ
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            i++;
            if (this.children[i].keys.length === this.maxKeys) {
                this.splitChild(i);
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

    // Метод для разделения дочернего узла
    splitChild(index) {
        const child = this.children[index];
        const newNode = new BTreeNode(child.maxKeys, child.isLeaf);
        const midIndex = Math.floor(child.maxKeys / 2);

        // Перенос ключей из child в newNode
        newNode.keys = child.keys.splice(midIndex + 1);
        const upKey = child.keys.splice(midIndex, 1)[0]; // Средний ключ поднимается вверх

        // Перенос дочерних узлов, если child не лист
        if (!child.isLeaf) {
            newNode.children = child.children.splice(midIndex + 1);
        }

        // Вставка среднего ключа и нового дочернего узла в текущий узел
        this.keys.splice(index, 0, upKey);
        this.children.splice(index + 1, 0, newNode);
    }
}

export default class BTree {
    constructor(maxKeys) {
        if (maxKeys < 3) {
            throw new Error("Максимальное количество ключей должно быть не меньше 3");
        }
        this.maxKeys = maxKeys;
        this.root = new BTreeNode(this.maxKeys, true);
    }

    insert(key) {
        const root = this.root;
        if (root.keys.length === this.maxKeys) {
            const newRoot = new BTreeNode(this.maxKeys, false);
            newRoot.children.push(root);
            newRoot.splitChild(0);
            this.root = newRoot;
            this.root.insertNonFull(key);
        } else {
            this.root.insertNonFull(key);
        }
    }
}
