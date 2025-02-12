import { useState } from "react";
import SplayTree from "./splay-tree.js";

// Константы для отрисовки узлов
const NODE_RADIUS = 20;
const NODE_DIAMETER = NODE_RADIUS * 2;
const HORIZONTAL_GAP = 20;
const VERTICAL_GAP = 60;

// Функции для вычисления координат узлов (in-order обход)
let globalId = 0;
function assignIds(node) {
    if (!node) return;
    node.id = globalId++;
    assignIds(node.left);
    assignIds(node.right);
}

function assignPositions(node, depth, positions) {
    if (!node) return;
    assignPositions(node.left, depth + 1, positions);
    node.x = positions.counter * (NODE_DIAMETER + HORIZONTAL_GAP);
    node.y = depth * VERTICAL_GAP;
    positions.counter++;
    assignPositions(node.right, depth + 1, positions);
}

function layoutSplayTree(root) {
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

// Компонент для отрисовки отдельного узла
function SplayNodeComponent({ node, minX, onNodeClick }) {
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

// Основной компонент визуализации Splay-дерева с добавленной строкой поиска
export default function SplayTreeVisualizer() {
    // Храним в состоянии текущее Splay-дерево
    const [tree, setTree] = useState(new SplayTree());
    const [addKey, setAddKey] = useState("");
    const [searchKey, setSearchKey] = useState("");
    // Счётчик для принудительного обновления (так как дерево меняется "на месте")
    const [version, setVersion] = useState(0);

    // Функция для принудительного обновления компонента
    function forceUpdate() {
        setVersion((v) => v + 1);
    }

    // Добавление нового ключа в дерево
    function handleAddKey() {
        if (addKey === "") return;
        const key = parseInt(addKey, 10);
        if (isNaN(key)) return;

        // Если ключ уже существует — выводим предупреждение
        const found = tree.search(key);
        if (found && found.key === key) {
            alert(`Ключ ${key} уже существует в дереве.`);
            setAddKey("");
            return;
        }
        tree.insert(key);
        setAddKey("");
        forceUpdate();
    }

    // Добавление случайного ключа от 1 до 1000
    function handleAddRandomKey() {
        let rand;
        // Подбираем случайное число, которого ещё нет в дереве
        do {
            rand = Math.floor(Math.random() * 1000) + 1;
            const found = tree.search(rand);
            if (found && found.key === rand) continue;
            break;
        } while (true);
        tree.insert(rand);
        forceUpdate();
    }

    // Поиск ключа — после вызова splay-операции искомый (или последний посещённый) узел перемещается в корень
    function handleSearch() {
        if (searchKey === "") return;
        const key = parseInt(searchKey, 10);
        if (isNaN(key)) return;
        const result = tree.search(key);
        if (!result || result.key !== key) {
            alert(
                `Ключ ${key} не найден. Последний посещённый узел перемещён в корень.`
            );
        }
        forceUpdate();
    }

    // Удаление ключа по клику на узел
    function handleDeleteKey(key) {
        tree.delete(key);
        forceUpdate();
    }

    // Получаем данные для отрисовки
    const { nodes, edges, totalWidth } = layoutSplayTree(tree.root);

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
            <h1>Splay-дерево (визуализация)</h1>

            {/* Панель для добавления ключей */}
            <div style={{ marginBottom: "10px" }}>
                <label>Новый ключ: </label>
                <input
                    type="number"
                    value={addKey}
                    onChange={(e) => setAddKey(e.target.value)}
                    style={{ width: 80, marginRight: 20 }}
                />
                <button onClick={handleAddKey}>Добавить</button>
                <button onClick={handleAddRandomKey} style={{ marginLeft: 10 }}>
                    Случайный ключ
                </button>
            </div>

            {/* Панель для поиска */}
            <div style={{ marginBottom: "10px" }}>
                <label>Поиск ключа: </label>
                <input
                    type="number"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    style={{ width: 80, marginRight: 20 }}
                />
                <button onClick={handleSearch}>Поиск</button>
            </div>

            <div style={{ fontStyle: "italic", marginBottom: "10px" }}>
                Нажмите на узел для удаления.
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
                        {/* Рисуем узлы */}
                        {nodes.map((node) => (
                            <SplayNodeComponent
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
