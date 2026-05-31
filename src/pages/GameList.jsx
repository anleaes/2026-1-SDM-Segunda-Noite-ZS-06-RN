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

            <div>
                {games.map((game) => (
                    <div key={game.id}>
                      <h2>{game.title}</h2>

                       <p>{game.description}</p>

                       <p>
                            Ano: {game.release_year}
                      </p>

                       <p>
                           Nota: {game.average_rating}
                       </p>

                       <img
                          src={game.cover_image}
                         alt={game.title}
                         width="200"
                     />
                 </div>
               ))}
            </div>
        </div>
    );
}

export default GameList;