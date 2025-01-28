import { useState } from "react";
import RedBlackTree from "./red-black-tree";

const NODE_RADIUS = 16;
const HORIZONTAL_GAP = 20;
const VERTICAL_LEVEL_GAP = 60;

function layoutRBTree(root) {
    const nodes = [];
    const edges = [];
    let globalId = 0;

    // Рекурсивная функция обхода (создаём фиктивные NIL-узлы вместо null)
    function traverse(node) {
        if (!node) {
            const id = globalId++;
            nodes.push({
                id,
                key: "NIL",
                color: "BLACK",
                x: 0,
                y: 0,
                leftId: null,
                rightId: null,
                isNullLeaf: true,
            });
            return id;
        }
        // Иначе реальный узел
        const id = globalId++;
        nodes.push({
            id,
            key: node.key,
            color: node.color,
            x: 0,
            y: 0,
            leftId: null,
            rightId: null,
            isNullLeaf: false,
        });
        const leftId = traverse(node.left);
        const rightId = traverse(node.right);

        // Записываем связи (рёбра) от узла к потомкам
        edges.push({ parentId: id, childId: leftId });
        nodes[id].leftId = leftId;

        edges.push({ parentId: id, childId: rightId });
        nodes[id].rightId = rightId;

        return id;
    }

    if (!root) {
        // Пустое дерево
        return { nodes: [], edges: [] };
    }

    // Обход от корня
    const rootId = traverse(root);

    // Функция для вычисления «ширины поддерева»
    function computeWidth(nodeId) {
        if (nodeId === null) return 0; // Теоретически не должно случиться
        const node = nodes[nodeId];
        // Для фиктивных NIL-узлов даём минимальную «ширину»
        if (node.isNullLeaf) {
            return 2 * NODE_RADIUS;
        }
        const leftW = computeWidth(node.leftId);
        const rightW = computeWidth(node.rightId);
        // Если нет детей (оба — NIL), ширина = диаметр
        if (node.isNullLeaf) {
            return 2 * NODE_RADIUS;
        }
        // Иначе сумма ширин + HORIZONTAL_GAP
        return leftW + rightW + HORIZONTAL_GAP;
    }

    // Расставляем координаты
    function setPositions(nodeId, depth, leftOffset) {
        if (nodeId === null) return;
        const node = nodes[nodeId];
        const leftW = node.isNullLeaf ? 0 : computeWidth(node.leftId);
        const rightW = node.isNullLeaf ? 0 : computeWidth(node.rightId);
        const subtreeW = Math.max(
            leftW + rightW + HORIZONTAL_GAP,
            2 * NODE_RADIUS
        );

        // x-координата = leftOffset + leftW + половина зазора
        const xCenter = leftOffset + leftW + HORIZONTAL_GAP / 2;
        node.x = xCenter;
        node.y = depth * VERTICAL_LEVEL_GAP + NODE_RADIUS;

        if (!node.isNullLeaf) {
            // Для реального узла рекурсивно расставляем детей
            setPositions(node.leftId, depth + 1, leftOffset);
            setPositions(node.rightId, depth + 1, leftOffset + leftW + HORIZONTAL_GAP);
        }
    }

    computeWidth(rootId); // Чтобы всё посчиталось корректно
    setPositions(rootId, 0, 0);

    return { nodes, edges };
}

function NodeComponent({ node, onClick }) {
    // Если это NIL-узел, можно нарисовать меньше радиус (например)
    const circleRadius = node.isNullLeaf ? NODE_RADIUS * 0.8 : NODE_RADIUS;

    // Выбираем цвет заливки
    const fillColor = node.isNullLeaf
        ? "#333" // или что-то другое для NIL
        : node.color === "RED"
            ? "#ff8888"
            : "#888"; // чёрный (по факту тёмно-серый)

    // Текст (NIL или ключ)
    const label = node.isNullLeaf ? "NIL" : String(node.key);

    return (
        <g onClick={onClick} style={{ cursor: "pointer" }}>
            <circle cx={node.x} cy={node.y} r={circleRadius} fill={fillColor} stroke="#333" />
            <text
                x={node.x}
                y={node.y + 4}
                textAnchor="middle"
                fontSize="12"
                fill="#fff"
                fontWeight="bold"
            >
                {label}
            </text>
        </g>
    );
}

export default function RedBlackTreeVisualizer() {
    const [inputKey, setInputKey] = useState("");
    const [history, setHistory] = useState([[]]);
    const [currentStep, setCurrentStep] = useState(0);

    // Текущий список ключей
    const currentKeys = history[currentStep];

    // Cтроим дерево для текущего набора ключей
    function buildTree(keys) {
        if (keys.length === 0) return null;
        const rbt = new RedBlackTree();
        for (let k of keys) {
            rbt.insert(k);
        }
        return rbt.root;
    }

    const root = buildTree(currentKeys);
    const { nodes, edges } = layoutRBTree(root);

    // Вставка ключа из текстового поля
    function handleAdd() {
        const k = parseInt(inputKey, 10);
        if (isNaN(k)) return;
        if (currentKeys.includes(k)) {
            alert(`Ключ ${k} уже существует.`);
            return;
        }
        const newKeys = [...currentKeys, k];
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
        setInputKey("");
    }

    // Вставка случайного ключа 1..1000
    function handleAddRandom() {
        const current = history[currentStep];
        let rand;
        do {
            rand = Math.floor(Math.random() * 1000) + 1;
        } while (current.includes(rand));

        const newKeys = [...current, rand];
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    }

    // Удаление узла по клику (если это не NIL)
    function handleNodeClick(node) {
        if (node.isNullLeaf) {
            console.log("Clicked NIL leaf.");
            return;
        }
        // Удаляем key из currentKeys
        const k = node.key;
        if (!currentKeys.includes(k)) {
            // Теоретически не должно случиться, но на всякий случай
            return;
        }
        const newKeys = currentKeys.filter((x) => x !== k);
        const newHistory = [...history.slice(0, currentStep + 1), newKeys];
        setHistory(newHistory);
        setCurrentStep(newHistory.length - 1);
    }

    // Кнопки истории
    function handlePrev() {
        setCurrentStep((s) => Math.max(s - 1, 0));
    }
    function handleNext() {
        setCurrentStep((s) => Math.min(s + 1, history.length - 1));
    }

    // Считаем границы для SVG
    let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
    nodes.forEach((n) => {
        if (n.x < minX) minX = n.x;
        if (n.x > maxX) maxX = n.x;
        if (n.y < minY) minY = n.y;
        if (n.y > maxY) maxY = n.y;
    });

    const padding = 50;
    const svgWidth = (maxX - minX || 0) + padding * 2;
    const svgHeight = (maxY - minY || 0) + padding * 2;

    return (
        <div style={{ margin: 20 }}>
            <h1>Красно-чёрное дерево (визуализация с NIL-листьями)</h1>
            <div style={{ marginBottom: 10 }}>
                <input
                    type="number"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    style={{ width: 80, marginRight: 10 }}
                />
                <button onClick={handleAdd}>Добавить</button>
                <button onClick={handleAddRandom} style={{ marginLeft: 10 }}>
                    Случайный ключ
                </button>
            </div>
            <div style={{ marginBottom: 10 }}>
                <button onClick={handlePrev} disabled={currentStep <= 0}>
                    Назад
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentStep >= history.length - 1}
                    style={{ marginLeft: 10 }}
                >
                    Вперёд
                </button>
                <span style={{ marginLeft: 20 }}>
          Шаг {currentStep + 1} / {history.length}
        </span>
            </div>
            <div style={{ border: "1px solid #ccc", display: "inline-block" }}>
                {nodes.length === 0 ? (
                    <div style={{ padding: 20 }}>Дерево пустое</div>
                ) : (
                    <svg
                        width={Math.max(svgWidth, 300)}
                        height={Math.max(svgHeight, 200)}
                        style={{ backgroundColor: "#fafafa" }}
                    >
                        {/* Линии (рёбра) */}
                        {edges.map((edge, i) => {
                            const parent = nodes[edge.parentId];
                            const child = nodes[edge.childId];
                            return (
                                <line
                                    key={i}
                                    x1={parent.x - minX + padding}
                                    y1={parent.y - minY + padding}
                                    x2={child.x - minX + padding}
                                    y2={child.y - minY + padding}
                                    stroke="#888"
                                    strokeWidth="2"
                                />
                            );
                        })}

                        {/* Узлы (включая NIL) */}
                        {nodes.map((node) => (
                            <NodeComponent
                                key={node.id}
                                node={{
                                    ...node,
                                    x: node.x - minX + padding,
                                    y: node.y - minY + padding,
                                }}
                                onClick={() => handleNodeClick(node)}
                            />
                        ))}
                    </svg>
                )}
            </div>
        </div>
    );
}
