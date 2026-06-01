import { useEffect, useState } from "react";
import api from "../services/api";

function TagList() {
    const [tags, setTags] = useState([]);

    useEffect(() => {
        api.get("/tag/")
            .then((response) => {
                setTags(response.data);
            })
            .catch((error) => {
                console.error("Erro ao carregar tags:", error);
            });
    }, []);

    return (
        <div>
            <h1>Tags</h1>

            {tags.map((tag) => (
                <div key={tag.id}>
                    <h2>{tag.name}</h2>

                    <p>
                        Categoria: {tag.category}
                    </p>

                    <p>
                        Ativa: {tag.is_active ? "Sim" : "Não"}
                    </p>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default TagList;