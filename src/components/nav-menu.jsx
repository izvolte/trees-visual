import { Link } from "react-router-dom";

const NavMenu = () => {
    const navStyle = {
        display: "flex",
        gap: "20px",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        borderBottom: "1px solid #ccc",
    };

    return (
        <nav style={navStyle}>
            {/* Ссылки на различные страницы */}
            <Link to="/">Главная</Link>
            <Link to="/b-tree">Binary Tree</Link>
            <Link to="/red-black-tree">Red Black Tree</Link>
            <Link to="/avl-tree">AVL tree</Link>
        </nav>
    );
};

export default NavMenu;
