// BTreeVisualizer.jsx

import { useState, useEffect } from "react";
import BTree from "./BTree";

const POINTER_SIZE = 10;
const KEY_WIDTH = 30;
const BOX_HEIGHT = 24;
const GAP = 4;
const VERTICAL_LEVEL_GAP = 60;
const HORIZONTAL_NODE_GAP = 20;

function computeNodeWidth(numKeys) {
    return (
        (numKeys + 1) * POINTER_SIZE +
        numKeys * KEY_WIDTH +
        (2 * numKeys + 1) * GAP
    );
}

let globalId = 0;

function layoutBTree(root) {
    if (!root) return { nodes: [], edges: [] };

    globalId = 0;
    const nodes = [];
    const edges = [];

    function traverse(node, depth) {
        const nodeId = globalId++;
        const width = computeNodeWidth(node.keys.length);
        nodes[nodeId] = {
            id: nodeId,
            x: 0,
            y: 0,
            width,
            keys: [...node.keys],
            isLeaf: node.isLeaf,
            pointers: []
        };
        if (!node.isLeaf) {
            for (let i = 0; i < node.children.length; i++) {
                const childId = traverse(node.children[i], depth + 1);
                nodes[nodeId].pointers.push(childId);
                edges.push({
                    parentId: nodeId,
                    pointerIndex: i,
                    childId
                });
            }
        }
        return nodeId;
    }

    const rootId = traverse(root, 0);

    function computeSubtreeWidth(nodeId) {
        const n = nodes[nodeId];
        if (n.isLeaf || n.pointers.length === 0) return n.width;
        let sum = 0;
        for (let pid of n.pointers) {
            sum += computeSubtreeWidth(pid) + HORIZONTAL_NODE_GAP;
        }
        sum -= HORIZONTAL_NODE_GAP;
        return Math.max(n.width, sum);
    }

    function setPositions(nodeId, depth, leftOffset) {
        const subtreeW = computeSubtreeWidth(nodeId);
        const n = nodes[nodeId];
        const xCenter = leftOffset + subtreeW / 2;
        n.x = xCenter - n.width / 2;
        n.y = depth * VERTICAL_LEVEL_GAP;

        if (!n.isLeaf && n.pointers.length > 0) {
            let currentX = leftOffset;
            for (let pid of n.pointers) {
                const w = computeSubtreeWidth(pid);
                setPositions(pid, depth + 1, currentX);
                currentX += w + HORIZONTAL_NODE_GAP;
            }
        }
    }

    const totalWidth = computeSubtreeWidth(rootId);
    setPositions(rootId, 0, 0);
    return { nodes, edges, totalWidth };
}

function NodeComponent({ node, minX }) {
    const { x, y, keys } = node;
    const numKeys = keys.length;
    const elements = [];
    let currentX = x;

    function renderPointer(i) {
        elements.push(
            <rect
                key={`ptr-${node.id}-${i}`}
                x={currentX - minX}
                y={y}
                width={POINTER_SIZE}
                height={BOX_HEIGHT}
                fill="#eee"
                stroke="#333"
            />
        );
        currentX += POINTER_SIZE + GAP;
    }

    function renderKey(k, i) {
        elements.push(
            <rect
                key={`krect-${node.id}-${i}`}
                x={currentX - minX}
                y={y}
                width={KEY_WIDTH}
                height={BOX_HEIGHT}
                fill="#fff"
                stroke="#333"
            />
        );
        elements.push(
            <text
                key={`ktext-${node.id}-${i}`}
                x={currentX - minX + KEY_WIDTH / 2}
                y={y + BOX_HEIGHT / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fill="#333"
            >
                {k}
            </text>
        );
        currentX += KEY_WIDTH + GAP;
    }

    for (let i = 0; i < numKeys; i++) {
        renderPointer(i);
        renderKey(keys[i], i);
    }
    renderPointer(numKeys);

    return <g>{elements}</g>;
}

export default function BTreeVisualizer() {
    const [maxKeys, setMaxKeys] = useState(3);
    const [inputKey, setInputKey] = useState("");
    const [history, setHistory] = useState([[]]); // Инициализируем историей с пустым массивом ключей
    const [currentStep, setCurrentStep] = useState(0);

    // Функция для построения дерева до текущего шага
    function buildTree(keys) {
        const btree = new BTree(maxKeys);
        for (let k of keys) {
            btree.insert(k);
        }
        return btree.root;
    }

    // Обработчик изменения максимального числа ключей
    function handleChangeMaxKeys(e) {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= 3) { // Минимум 3 ключа
            setMaxKeys(val);
            // Сброс истории при изменении maxKeys
            setHistory([[]]);
            setCurrentStep(0);
        }
    }

    // Обработчик добавления нового ключа
    function handleAddKey() {
        if (inputKey === "") return;
        const k = parseInt(inputKey, 10);
        if (isNaN(k)) return;

        const currentKeys = history[currentStep];
        if (currentKeys.includes(k)) {
            alert(`Ключ ${k} уже существует в дереве.`);
            return;
        }

        const newKeys = [...currentKeys, k];
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
        setInputKey("");
    }

    // Обработчики навигации по истории
    function handlePrev() {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }

    function handleNext() {
        setCurrentStep((prev) => Math.min(prev + 1, history.length - 1));
    }

    // Получаем ключи до текущего шага
    const currentKeys = history[currentStep];
    // Строим дерево
    const currentRoot = buildTree(currentKeys);
    // Лэйаут дерева
    const { nodes, edges } = layoutBTree(currentRoot);
    let minX = 0,
        maxX = 0,
        maxY = 0;

    nodes.forEach((n) => {
        if (n.x < minX) minX = n.x;
        const r = n.x + n.width;
        if (r > maxX) maxX = r;
        const b = n.y + BOX_HEIGHT;
        if (b > maxY) maxY = b;
    });

    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY + padding;

    return (
        <div style={{ margin: "20px" }}>
            <h1>B-дерево (визуализация)</h1>
            <div style={{ marginBottom: "10px" }}>
                <label>Макс. число ключей в узле: </label>
                <input
                    type="number"
                    value={maxKeys}
                    onChange={handleChangeMaxKeys}
                    style={{ width: 60, marginRight: 20 }}
                    min={3}
                />
                <label>Новый ключ: </label>
                <input
                    type="number"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    style={{ width: 80, marginRight: 20 }}
                />
                <button onClick={handleAddKey}>Добавить</button>
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
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
                {nodes.length > 0 ? (
                    <svg
                        width={Math.max(width, 300)}
                        height={Math.max(height, 200)}
                        style={{ background: "#fafafa" }}
                    >
                        <defs>
                            <marker
                                id="arrow"
                                markerWidth="10"
                                markerHeight="10"
                                refX="5"
                                refY="5"
                                orient="auto"
                            >
                                <path d="M0,0 L0,10 L10,5 z" fill="#888" />
                            </marker>
                        </defs>
                        {edges.map((edge, i) => {
                            const parent = nodes[edge.parentId];
                            const child = nodes[edge.childId];
                            let px = parent.x;
                            for (let idx = 0; idx < edge.pointerIndex; idx++) {
                                px += POINTER_SIZE + GAP;
                                px += KEY_WIDTH + GAP;
                            }
                            px += POINTER_SIZE / 2;
                            const py = parent.y + BOX_HEIGHT / 2;
                            const childX = child.x + child.width / 2;
                            const childY = child.y;
                            return (
                                <line
                                    key={i}
                                    x1={px - minX}
                                    y1={py}
                                    x2={childX - minX}
                                    y2={childY}
                                    stroke="#888"
                                    strokeWidth={2}
                                    markerEnd="url(#arrow)"
                                />
                            );
                        })}
                        {nodes.map((node) => (
                            <g key={node.id}>
                                <NodeComponent node={node} minX={minX} />
                            </g>
                        ))}
                    </svg>
                ) : (
                    <div style={{ padding: 20 }}>Дерево пусто</div>
                )}
            </div>
        </div>
    );
}
