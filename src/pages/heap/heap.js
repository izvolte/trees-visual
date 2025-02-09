// Класс кучи (Heap)
// Реализована минимальная куча (min‑heap), где родительский ключ меньше или равен ключам детей.
class Heap {
    constructor() {
        // Массив для хранения элементов кучи
        this.heap = [];
    }

    // Возвращает индекс родителя для узла с индексом i
    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    // Возвращает индекс левого ребенка для узла с индексом i
    leftChild(i) {
        return 2 * i + 1;
    }

    // Возвращает индекс правого ребенка для узла с индексом i
    rightChild(i) {
        return 2 * i + 2;
    }

    // Функция для обмена элементов в массиве
    swap(i, j) {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    /**
     * Вставка нового ключа в кучу.
     * Добавляем ключ в конец массива и поднимаем его вверх (heapifyUp),
     * пока не будет выполнено свойство кучи.
     */
    insert(key) {
        this.heap.push(key);
        this.heapifyUp(this.heap.length - 1);
    }

    // Поддержка свойства кучи при вставке: поднимаем элемент вверх, если он меньше родителя
    heapifyUp(index) {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = this.parent(currentIndex);
            if (this.heap[parentIndex] > this.heap[currentIndex]) {
                this.swap(parentIndex, currentIndex);
                currentIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    /**
     * Удаление ключа из кучи.
     * Находим индекс ключа, заменяем его последним элементом, удаляем последний элемент
     * и восстанавливаем свойство кучи (сначала опускаем вниз, затем, на всякий случай, поднимаем вверх).
     */
    delete(key) {
        const index = this.heap.indexOf(key);
        if (index === -1) {
            console.log(`Ключ ${key} не найден в куче.`);
            return;
        }
        const lastIndex = this.heap.length - 1;
        if (index !== lastIndex) {
            this.swap(index, lastIndex);
        }
        this.heap.pop();
        this.heapifyDown(index);
        this.heapifyUp(index);
    }

    // Восстанавливаем свойство кучи, опуская элемент вниз
    heapifyDown(index) {
        let currentIndex = index;
        const length = this.heap.length;
        while (true) {
            const left = this.leftChild(currentIndex);
            const right = this.rightChild(currentIndex);
            let smallest = currentIndex;
            if (left < length && this.heap[left] < this.heap[smallest]) {
                smallest = left;
            }
            if (right < length && this.heap[right] < this.heap[smallest]) {
                smallest = right;
            }
            if (smallest !== currentIndex) {
                this.swap(currentIndex, smallest);
                currentIndex = smallest;
            } else {
                break;
            }
        }
    }
}

export default Heap;
