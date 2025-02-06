// AvlTreeVisualizer.jsx

import { useState } from "react";
import AVLTree from "./avl-tree.js";

// Константы для отрисовки
const NODE_RADIUS = 20;
const NODE_DIAMETER = NODE_RADIUS * 2;
const HORIZONTAL_GAP = 20;
const VERTICAL_GAP = 60;

// Для вычисления координат воспользуемся in-order обходом.
// Функция для назначения уникальных id узлам.
let globalId = 0;
function assignIds(node) {
    if (!node) return;
    node.id = globalId++;
    assignIds(node.left);
    assignIds(node.right);
}

// Функция для назначения координат узлам (in-order).
function assignPositions(node, depth, positions) {
    if (!node) return;
    assignPositions(node.left, depth + 1, positions);
    node.x = positions.counter * (NODE_DIAMETER + HORIZONTAL_GAP);
    node.y = depth * VERTICAL_GAP;
    positions.counter++;
    assignPositions(node.right, depth + 1, positions);
}

// Функция для сбора информации об узлах и рёбрах для отрисовки.
function layoutAVLTree(root) {
    if (!root) return { nodes: [], edges: [], totalWidth: 0 };

    globalId = 0;
    assignIds(root);

    // Назначаем координаты с помощью in-order обхода
    const positions = { counter: 0 };
    assignPositions(root, 0, positions);

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
            edges.push({
                parentId: node.id,
                childId: node.left.id,
            });
            traverse(node.left);
        }
        if (node.right) {
            edges.push({
                parentId: node.id,
                childId: node.right.id,
            });
            traverse(node.right);
        }
    }
    traverse(root);

    // Общая ширина вычисляется по количеству посещённых узлов
    const totalWidth = positions.counter * (NODE_DIAMETER + HORIZONTAL_GAP);
    return { nodes, edges, totalWidth };
}

// Компонент для отрисовки отдельного узла (в виде круга с текстом).
function AVLNodeComponent({ node, minX, onNodeClick }) {
    return (
        <g>
            <circle
                cx={node.x - minX + NODE_RADIUS}
                cy={node.y + NODE_RADIUS}
                r={NODE_RADIUS}
                fill="#fff"
                stroke="#333"
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

// Основной компонент визуализации AVL-дерева.
export default function AvlTreeVisualizer() {
    const [inputKey, setInputKey] = useState("");
    const [history, setHistory] = useState([[]]); // История состояний: массив массивов ключей
    const [currentStep, setCurrentStep] = useState(0);

    // Функция для построения AVL-дерева из массива ключей.
    function buildTree(keys) {
        if (keys.length === 0) return null;
        const avlTree = new AVLTree();
        for (let k of keys) {
            avlTree.insert(k);
        }
        return avlTree.root;
    }

    // Добавление нового ключа (из текстового поля)
    function handleAddKey() {
        if (inputKey === "") return;
        const k = parseInt(inputKey, 10);
        if (isNaN(k)) return;

        const currentKeys = history[currentStep];
        if (currentKeys.includes(k)) {
            alert(`Ключ ${k} уже существует в дереве.`);
            return;
        }
        // Можно не сортировать, так как AVL-дерево само определяет порядок
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

    // Построение дерева по текущему списку ключей
    const currentKeys = history[currentStep];
    const currentRoot = buildTree(currentKeys);

    // Выполняем layout для отрисовки
    const { nodes, edges, totalWidth } = layoutAVLTree(currentRoot);

    // Вычисляем габариты SVG
    let minX = 0,
        maxX = 0,
        maxY = 0;
    nodes.forEach((n) => {
        if (n.x < minX) minX = n.x;
        if (n.x + NODE_DIAMETER > maxX) maxX = n.x + NODE_DIAMETER;
        if (n.y + NODE_DIAMETER > maxY) maxY = n.y + NODE_DIAMETER;
    });
    const padding = 50;
    const width = totalWidth + padding * 2;
    const height = maxY + padding;

    return (
        <div style={{ margin: "20px" }}>
            <h1>AVL-дерево (визуализация)</h1>

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

            {/* Область визуализации */}
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
                {nodes.length > 0 ? (
                    <svg
                        width={Math.max(width, 300)}
                        height={Math.max(height, 200)}
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
                        {/* Рисуем сами узлы */}
                        {nodes.map((node) => (
                            <AVLNodeComponent
                                key={node.id}
                                node={node}
                                minX={minX}
                                onNodeClick={handleDeleteKey}
                            />
                        ))}
                    </svg>
                ) : (
                    <div style={{ padding: 20 }}>Дерево пусто</div>
                )}
            </div>
        </div>
    );
}
