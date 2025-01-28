class BTreeNode {
    constructor(maxKeys, isLeaf = true) {
        this.maxKeys = maxKeys;       // Максимальное количество ключей в узле
        this.isLeaf = isLeaf;         // Показывает, является ли узел листом
        this.keys = [];               // Список ключей в узле
        this.children = [];           // Список дочерних узлов

        // Минимальная степень (T).
        // Узел может содержать максимум 'maxKeys' ключей, и мы устанавливаем:
        //   T = Math.floor((maxKeys + 1) / 2).
        // Пример: если maxKeys = 3, T = 2 => каждый узел (кроме корня) должен содержать от 1 до 3 ключей.
        this.minDegree = Math.floor((this.maxKeys + 1) / 2);
    }

    // ==========================
    //      Методы вставки
    // ==========================

    /**
     * Вставляет новый ключ в узел, предполагая что узел НЕ заполнен до максимума.
     */
    insertNonFull(key) {
        let i = this.keys.length - 1;

        if (this.isLeaf) {
            // Вставка в листовой узел
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            // Проверяем на дубликаты
            if (i >= 0 && this.keys[i] === key) {
                console.log(`Ключ ${key} уже существует в дереве.`);
                return;
            }
            // Вставляем ключ на освободившуюся позицию
            this.keys.splice(i + 1, 0, key);
        } else {
            // Ищем подходящего ребёнка, в который надо рекурсивно вставлять ключ
            while (i >= 0 && key < this.keys[i]) {
                i--;
            }
            i++;
            // Если выбранный ребёнок заполнен, сначала разбиваем (split)
            if (this.children[i].keys.length === this.maxKeys) {
                this.splitChild(i);
                // После разбиения решаем, в какой из двух узлов идти дальше
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

    /**
     * Разбивает заполненный дочерний узел (по индексу 'index').
     */
    splitChild(index) {
        const child = this.children[index];
        const newNode = new BTreeNode(child.maxKeys, child.isLeaf);

        // Серединный индекс (для maxKeys = 2T - 1, это будет T - 1)
        // Мы используем: midIndex = Math.floor(child.maxKeys / 2)
        const midIndex = Math.floor(child.maxKeys / 2);

        // Забираем все ключи правее середины в новый узел
        newNode.keys = child.keys.splice(midIndex + 1);

        // Ключ, который "поднимается" в родителя
        const upKey = child.keys.splice(midIndex, 1)[0];

        // Если дочерний узел не лист, то часть детей тоже переносим в newNode
        if (!child.isLeaf) {
            newNode.children = child.children.splice(midIndex + 1);
        }

        // Поднимаем upKey в текущий узел
        this.keys.splice(index, 0, upKey);
        // Вставляем указатель на новый узел
        this.children.splice(index + 1, 0, newNode);
    }

    // ==========================
    //      Методы удаления
    // ==========================

    /**
     * Рекурсивно удаляет ключ 'key' в поддереве, корнем которого является данный узел.
     */
    deleteKey(key) {
        const idx = this.findKey(key);

        // Случай A: ключ находится в массиве keys[] данного узла
        if (idx < this.keys.length && this.keys[idx] === key) {
            if (this.isLeaf) {
                // A1: ключ в листовом узле - удаляем прямо здесь
                this.removeFromLeaf(idx);
            } else {
                // A2: ключ во внутреннем узле
                this.removeFromNonLeaf(idx);
            }
        } else {
            // Случай B: ключ не находится в данном узле
            if (this.isLeaf) {
                // Если узел лист, то значит ключа в дереве нет, ничего не делаем
                return;
            }

            // Иначе ключ должен быть в одном из потомков
            const childIndex = idx; // Ребёнок, в котором должен находиться ключ
            // Убеждаемся, что у ребёнка достаточно ключей (>= minDegree), иначе - fill
            if (this.children[childIndex].keys.length < this.minDegree) {
                this.fill(childIndex);
            }

            // Теперь у ребёнка достаточно ключей, рекурсивно удаляем
            this.children[childIndex].deleteKey(key);
        }
    }

    /**
     * Возвращает индекс первого ключа, который >= key,
     * или this.keys.length, если таких ключей нет.
     */
    findKey(key) {
        let idx = 0;
        while (idx < this.keys.length && this.keys[idx] < key) {
            idx++;
        }
        return idx;
    }

    /**
     * Удаляет ключ по индексу 'idx' из листового узла.
     */
    removeFromLeaf(idx) {
        this.keys.splice(idx, 1);
    }

    /**
     * Удаляет ключ по индексу 'idx' из внутреннего узла:
     *   - Если левый ребёнок имеет >= minDegree ключей, заменяем ключ его предшественником
     *   - Иначе если правый ребёнок имеет >= minDegree ключей, заменяем ключ его преемником
     *   - Иначе сливаем (merge) два ребёнка вокруг удаляемого ключа и удаляем из слитого узла
     */
    removeFromNonLeaf(idx) {
        const key = this.keys[idx];
        const leftChild = this.children[idx];
        const rightChild = this.children[idx + 1];

        if (leftChild.keys.length >= this.minDegree) {
            // Заменяем ключ предшественником (из левого поддерева)
            const pred = this.getPredecessor(idx);
            this.keys[idx] = pred;
            leftChild.deleteKey(pred);
        } else if (rightChild.keys.length >= this.minDegree) {
            // Заменяем ключ преемником (из правого поддерева)
            const succ = this.getSuccessor(idx);
            this.keys[idx] = succ;
            rightChild.deleteKey(succ);
        } else {
            // Сливаем два ребёнка
            this.merge(idx);
            // После слияния ключ, который хотели удалить, находится в leftChild
            leftChild.deleteKey(key);
        }
    }

    /**
     * Находит предшественник для keys[idx]:
     *   - Переходим в левого ребёнка и идём по цепочке правых детей до листа.
     */
    getPredecessor(idx) {
        let current = this.children[idx];
        while (!current.isLeaf) {
            current = current.children[current.children.length - 1];
        }
        return current.keys[current.keys.length - 1];
    }

    /**
     * Находит преемника для keys[idx]:
     *   - Переходим в правого ребёнка и идём по цепочке левых детей до листа.
     */
    getSuccessor(idx) {
        let current = this.children[idx + 1];
        while (!current.isLeaf) {
            current = current.children[0];
        }
        return current.keys[0];
    }

    /**
     * Убеждается, что у дочернего узла children[idx] есть как минимум (minDegree - 1) ключей.
     * Если их меньше, пытаемся занять (borrow) из соседних узлов или сливаем (merge).
     */
    fill(idx) {
        // Пытаемся взять ключ у предыдущего брата?
        if (idx > 0 && this.children[idx - 1].keys.length >= this.minDegree) {
            this.borrowFromPrev(idx);
        }
        // Или у следующего брата?
        else if (
            idx < this.children.length - 1 &&
            this.children[idx + 1].keys.length >= this.minDegree
        ) {
            this.borrowFromNext(idx);
        } else {
            // Иначе сливаем с братом
            if (idx < this.children.length - 1) {
                this.merge(idx);
            } else {
                this.merge(idx - 1);
            }
        }
    }

    /**
     * "Одолжить" один ключ у children[idx-1] и переместить его в children[idx].
     */
    borrowFromPrev(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx - 1];

        // Последний ключ из sibling "поднимается" в родителя
        // Ключ из родителя (this.keys[idx - 1]) идёт в child
        child.keys.unshift(this.keys[idx - 1]);
        this.keys[idx - 1] = sibling.keys.pop();

        // Если узел не лист, переносим и "лишнего" ребёнка
        if (!child.isLeaf) {
            child.children.unshift(sibling.children.pop());
        }
    }

    /**
     * "Одолжить" один ключ у children[idx+1] и переместить его в children[idx].
     */
    borrowFromNext(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx + 1];

        // Первый ключ из sibling "поднимается" в родителя
        // Ключ родителя (this.keys[idx]) опускается в child
        child.keys.push(this.keys[idx]);
        this.keys[idx] = sibling.keys.shift();

        // Если узел не лист, переносим первый дочерний узел sibling
        if (!child.isLeaf) {
            child.children.push(sibling.children.shift());
        }
    }

    /**
     * Сливает (merge) children[idx] и children[idx+1].
     * Ключ this.keys[idx] опускается внутрь объединённого узла.
     */
    merge(idx) {
        const child = this.children[idx];
        const sibling = this.children[idx + 1];
        const mergeKey = this.keys[idx];

        // Добавляем mergeKey в список ключей child
        child.keys.push(mergeKey);

        // Добавляем ключи из sibling в child
        for (let k of sibling.keys) {
            child.keys.push(k);
        }

        // Если узлы не листовые, подключаем детей sibling
        if (!child.isLeaf) {
            for (let c of sibling.children) {
                child.children.push(c);
            }
        }

        // Удаляем ключ и указатель на sibling из текущего узла
        this.keys.splice(idx, 1);
        this.children.splice(idx + 1, 1);
    }
}

export default class BTree {
    constructor(maxKeys) {
        if (maxKeys < 3) {
            throw new Error("Максимальное количество ключей должно быть не меньше 3");
        }
        this.maxKeys = maxKeys;
        // Корень поначалу листовой
        this.root = new BTreeNode(this.maxKeys, true);
    }

    /**
     * Вставить ключ 'key' в B-дерево.
     */
    insert(key) {
        const root = this.root;
        // Если корень заполнен, нужно его разделить
        if (root.keys.length === this.maxKeys) {
            const newRoot = new BTreeNode(this.maxKeys, false);
            // Старый корень становится дочерним
            newRoot.children.push(root);
            newRoot.splitChild(0);
            this.root = newRoot;
            this.root.insertNonFull(key);
        } else {
            // Иначе просто вставляем в неполный узел
            root.insertNonFull(key);
        }
    }

    /**
     * Удалить ключ 'key' из B-дерева (если существует).
     */
    delete(key) {
        if (!this.root) return; // Пустое дерево

        this.root.deleteKey(key);

        // Если в корне не осталось ключей и он не лист, делаем его ребёнка новым корнем
        if (this.root.keys.length === 0 && !this.root.isLeaf) {
            this.root = this.root.children[0];
        }

        // Если корень пуст и листовой, значит дерево стало пустым
        if (this.root && this.root.keys.length === 0 && this.root.isLeaf) {
            this.root = null;
        }
    }
}
