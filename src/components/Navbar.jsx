import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Home</Link> |{" "}
            <Link to="/games">Jogos</Link> |{" "}
            <Link to="/developers">Desenvolvedoras</Link> | {" "}
            <Link to="/genres">Gêneros</Link> | {" "}
            <Link to="/consoles">Consoles</Link> | {" "}
            <Link to="/tags">Tags</Link> | {" "}
            <Link to="/login">Login</Link>
        </nav>
    );
}

export default Navbar;