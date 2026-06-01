import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav>
            <Link to="/">Home</Link> |{" "}
            <Link to="/games">Jogos</Link> |{" "}
            <Link to="/login">Login</Link>
        </nav>
    );
}

export default Navbar;