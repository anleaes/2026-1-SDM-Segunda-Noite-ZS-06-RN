import { useEffect, useState } from "react";
import api from "../services/api";

function GenreList() {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        api.get("/genre/")
            .then((response) => {
                setGenres(response.data);
            })
            .catch((error) => {
                console.error("Erro ao carregar gêneros:", error);
            });
    }, []);

    return (
        <div>
            <h1>Gêneros</h1>

            {genres.map((genre) => (
                <div key={genre.id}>
                    <h2>{genre.name}</h2>

                    <p>
                        {genre.description}
                    </p>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default GenreList;