import { useEffect, useState } from "react";
import api from "../services/api";

function GameList() {
    const [games, setGames] = useState([]);

    useEffect(() => {
        api.get("/jogos/game/")
            .then((response) => {
                console.log(response.data);
                setGames(response.data);
            })
            .catch((error) => {
                console.error("Erro ao carregar jogos:", error);
            });
    }, []);

    return (
        <div>
            <h1>Biblioteca de Jogos Antigos</h1>

            <ul>
                {games.map((game) => (
                    <li key={game.id}>
                        {game.title}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default GameList;