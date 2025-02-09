import { useState } from "react";
import Heap from "./heap.js";

// Константы для отрисовки узлов
const NODE_RADIUS = 20;
const NODE_DIAMETER = NODE_RADIUS * 2;
const HORIZONTAL_GAP = 20;
const VERTICAL_GAP = 60;

// ================================
// Функции для позиционирования узлов дерева
// ================================

/**
 * Вычисляет глубину дерева.
 */
function getTreeDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right));
}

/**
 * Рекурсивно назначает координаты узлам так, чтобы дети располагались прямо под родителем.
 * @param {object} node – текущий узел
 * @param {number} x – координата x родительского узла
 * @param {number} y – координата y родительского узла
 * @param {number} offset – смещение для детей по оси x
 */
function assignPositionsDirect(node, x, y, offset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    // Рекурсивно назначаем координаты левому и правому детям:
    assignPositionsDirect(node.left, x - offset, y + VERTICAL_GAP, offset / 2);
    assignPositionsDirect(node.right, x + offset, y + VERTICAL_GAP, offset / 2);
}

/**
 * Функция для назначения уникальных id узлам (обход в глубину).
 */
let globalId = 0;
function assignIds(node) {
    if (!node) return;
    node.id = globalId++;
    assignIds(node.left);
    assignIds(node.right);
}

/**
 * Функция для сбора информации об узлах и рёбрах дерева для отрисовки.
 * Здесь используется алгоритм, где корень располагается по центру, а дети — прямо под родителем.
 */
function layoutHeapTree(root) {
    if (!root) return { nodes: [], edges: [], totalWidth: 0 };

    globalId = 0;
    assignIds(root);

    const maxDepth = getTreeDepth(root);
    // Вычисляем общую ширину нижнего уровня
    const totalWidth = Math.pow(2, maxDepth - 1) * (NODE_DIAMETER + HORIZONTAL_GAP);
    // Корень располагается по центру общей ширины
    const rootX = totalWidth / 2;
    // Начальное смещение для детей — половина ширины нижнего уровня
    const initialOffset = maxDepth > 1 ? totalWidth / 4 : 0;
    assignPositionsDirect(root, rootX, 0, initialOffset);

    const nodes = [];
    const edges = [];

    function traverse(node) {
        if (!node) return;
        nodes.push({
            id: node.id,
            x: node.x,
            y: node.y,
            key: node.key,
        });
        if (node.left) {
            edges.push({ parentId: node.id, childId: node.left.id });
            traverse(node.left);
        }
        if (node.right) {
            edges.push({ parentId: node.id, childId: node.right.id });
            traverse(node.right);
        }
    }
    traverse(root);
    return { nodes, edges, totalWidth };
}

// ================================
// Функция для вычисления позиций элементов массива (визуализация кучи как массива)
// ================================
function layoutHeapArray(arr) {
    const nodes = [];
    const gap = NODE_DIAMETER + HORIZONTAL_GAP;
    arr.forEach((key, index) => {
        nodes.push({
            index,
            key,
            x: index * gap,
            y: 0,
        });
    });
    const totalWidth = arr.length * gap;
    return { nodes, totalWidth };
}

// ================================
// Компонент для отрисовки узла дерева кучи
// ================================
function HeapNodeComponent({ node, minX, onNodeClick, hoveredKey }) {
    const isHighlighted = node.key === hoveredKey;
    return (
        <g>
            <circle
                cx={node.x - minX + NODE_RADIUS}
                cy={node.y + NODE_RADIUS}
                r={NODE_RADIUS}
                fill={isHighlighted ? "#ffeb3b" : "#fff"}
                stroke={isHighlighted ? "#f44336" : "#333"}
                onClick={() => onNodeClick?.(node.key)}
                style={{ cursor: "pointer" }}
            />
            <text
                x={node.x - minX + NODE_RADIUS}
                y={node.y + NODE_RADIUS + 5}
                textAnchor="middle"
                fontSize="14"
                fill="#333"
                onClick={() => onNodeClick?.(node.key)}
                style={{ cursor: "pointer" }}
            >
                {node.key}
            </text>
        </g>
    );
}

// ================================
// Основной компонент визуализации кучи (Heap)
// ================================
export default function HeapVisualizer() {
    const [inputKey, setInputKey] = useState("");
    const [history, setHistory] = useState([[]]); // История состояний: массив массивов ключей
    const [currentStep, setCurrentStep] = useState(0);
    // Состояния для хранения подсвеченного узла (при наведении на элемент массива)
    const [hoveredKey, setHoveredKey] = useState(null);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    // Функция для построения кучи из массива ключей.
    // Ключи вставляются по одному, после чего куча хранится как массив внутри объекта Heap.
    function buildHeap(keys) {
        const heap = new Heap();
        keys.forEach((k) => heap.insert(k));
        return heap;
    }

    // Добавление нового ключа (из текстового поля)
    function handleAddKey() {
        if (inputKey === "") return;
        const k = parseInt(inputKey, 10);
        if (isNaN(k)) return;

        const currentKeys = history[currentStep];
        if (currentKeys.includes(k)) {
            alert(`Ключ ${k} уже существует в куче.`);
            return;
        }
        const newKeys = [...currentKeys, k];
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
        setInputKey("");
    }

    // Добавление случайного ключа от 1 до 1000
    function handleAddRandomKey() {
        const currentKeys = history[currentStep];
        let rand;
        do {
            rand = Math.floor(Math.random() * 1000) + 1;
        } while (currentKeys.includes(rand));

        const newKeys = [...currentKeys, rand];
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    }

    // Удаление ключа по клику на узел
    function handleDeleteKey(k) {
        const currentKeys = history[currentStep];
        if (!currentKeys.includes(k)) return;
        const newKeys = currentKeys.filter((key) => key !== k);
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    }

    // Управление историей: кнопки "Назад" и "Вперед"
    function handlePrev() {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
    function handleNext() {
        setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
    }

    // Построение кучи и получение как представления дерева, так и массива.
    const currentKeys = history[currentStep];
    const heapObj = buildHeap(currentKeys);
    // Получаем массив кучи (heap.heap) и дерево (для визуализации)
    const currentHeapArray = heapObj.heap;
    // Построение дерева из массива (индексы: левый = 2*i+1, правый = 2*i+2)
    function buildTreeFromArray(arr, index) {
        if (index >= arr.length) return null;
        const node = { key: arr[index] };
        node.left = buildTreeFromArray(arr, 2 * index + 1);
        node.right = buildTreeFromArray(arr, 2 * index + 2);
        return node;
    }
    const currentRoot = buildTreeFromArray(currentHeapArray, 0);

    // Выполняем layout для отрисовки дерева
    const { nodes, edges, totalWidth } = layoutHeapTree(currentRoot);

    // Вычисляем габариты SVG для дерева
    let minX = 0,
        maxX = 0,
        maxY = 0;
    nodes.forEach((n) => {
        if (n.x < minX) minX = n.x;
        if (n.x + NODE_DIAMETER > maxX) maxX = n.x + NODE_DIAMETER;
        if (n.y + NODE_DIAMETER > maxY) maxY = n.y + NODE_DIAMETER;
    });
    const padding = 50;
    const treeWidth = totalWidth + padding * 2;
    const treeHeight = maxY + padding;

    // Выполняем layout для массива (визуализация кучи как массива)
    const { nodes: arrayNodes, totalWidth: arrayTotalWidth } =
        layoutHeapArray(currentHeapArray);
    const arrayPadding = 20;
    // Увеличиваем высоту SVG для отображения индексов под элементами
    const arraySVGWidth = Math.max(arrayTotalWidth + arrayPadding * 2, 300);
    const arraySVGHeight = 120;

    return (
        <div style={{ margin: "20px" }}>
            <h1>Куча (Heap) (визуализация)</h1>

            {/* Панель ввода и управления */}
            <div style={{ marginBottom: "10px" }}>
                <label>Новый ключ: </label>
                <input
                    type="number"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    style={{ width: 80, marginRight: 20 }}
                />
                <button onClick={handleAddKey}>Добавить</button>
                <button onClick={handleAddRandomKey} style={{ marginLeft: 10 }}>
                    Случайный ключ
                </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <button onClick={handlePrev} disabled={currentStep <= 0}>
                    Назад
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentStep >= history.length - 1}
                    style={{ marginLeft: 10 }}
                >
                    Вперед
                </button>
                <span style={{ marginLeft: 20 }}>
          Шаг {currentStep + 1} / {history.length}
        </span>
            </div>

            {/* Область визуализации дерева */}
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
                {nodes.length > 0 ? (
                    <svg
                        width={Math.max(treeWidth, 300)}
                        height={Math.max(treeHeight, 200)}
                        style={{ background: "#fafafa" }}
                    >
                        {/* Рисуем линии между узлами */}
                        {edges.map((edge, i) => {
                            const parent = nodes.find((n) => n.id === edge.parentId);
                            const child = nodes.find((n) => n.id === edge.childId);
                            const x1 = parent.x - minX + NODE_RADIUS;
                            const y1 = parent.y + NODE_RADIUS;
                            const x2 = child.x - minX + NODE_RADIUS;
                            const y2 = child.y + NODE_RADIUS;
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="#888"
                                    strokeWidth={2}
                                />
                            );
                        })}
                        {/* Рисуем сами узлы дерева */}
                        {nodes.map((node) => (
                            <HeapNodeComponent
                                key={node.id}
                                node={node}
                                minX={minX}
                                onNodeClick={handleDeleteKey}
                                hoveredKey={hoveredKey}
                            />
                        ))}
                    </svg>
                ) : (
                    <div style={{ padding: 20 }}>Куча пуста</div>
                )}
            </div>

            {/* Отступ между визуализациями */}
            <div style={{ margin: "30px 0" }} />

            {/* Область визуализации массива и панели формул */}
            <h2>Представление кучи как массива</h2>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                {/* SVG для массива */}
                <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
                    <svg
                        width={arraySVGWidth}
                        height={arraySVGHeight}
                        style={{ background: "#fafafa" }}
                    >
                        {arrayNodes.map((an) => (
                            <g
                                key={an.index}
                                transform={`translate(${an.x + arrayPadding}, ${
                                    an.y + arrayPadding
                                })`}
                                onMouseEnter={() => {
                                    setHoveredKey(an.key);
                                    setHoveredIndex(an.index);
                                }}
                                onMouseLeave={() => {
                                    setHoveredKey(null);
                                    setHoveredIndex(null);
                                }}
                                style={{ cursor: "pointer" }}
                            >
                                <circle
                                    r={NODE_RADIUS}
                                    fill={hoveredIndex === an.index ? "#ffeb3b" : "#fff"}
                                    stroke="#333"
                                />
                                <text
                                    x={0}
                                    y={5}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fill="#333"
                                >
                                    {an.key}
                                </text>
                                {/* Вывод индекса под элементом */}
                                <text
                                    x={0}
                                    y={NODE_DIAMETER + 15}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#555"
                                >
                                    {an.index}
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>

                {/* Панель формул */}
                <div
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        background: "#fafafa",
                        minWidth: "180px",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>Формулы</h3>
                    {hoveredIndex !== null ? (
                        <div>
                            <div>
                                Для <strong>i = {hoveredIndex}</strong>
                            </div>
                            <div>
                                Левый потомок: 2*{hoveredIndex} + 1 ={" "}
                                {2 * hoveredIndex + 1}
                            </div>
                            <div>
                                Правый потомок: 2*{hoveredIndex} + 2 ={" "}
                                {2 * hoveredIndex + 2}
                            </div>
                            <div>
                                Родитель:{" "}
                                {hoveredIndex === 0
                                    ? "—"
                                    : `floor((${hoveredIndex} - 1) / 2) = ${Math.floor(
                                        (hoveredIndex - 1) / 2
                                    )}`}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div>Левый потомок: 2*i + 1</div>
                            <div>Правый потомок: 2*i + 2</div>
                            <div>Родитель: floor((i - 1) / 2)</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
