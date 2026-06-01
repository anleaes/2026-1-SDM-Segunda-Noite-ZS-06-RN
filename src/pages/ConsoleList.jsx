import { useEffect, useState } from "react";
import api from "../services/api";

function ConsoleList() {
    const [consoles, setConsoles] = useState([]);

    useEffect(() => {
        api.get("/console/")
            .then((response) => {
                setConsoles(response.data);
            })
            .catch((error) => {
                console.error("Erro ao carregar consoles:", error);
            });
    }, []);

    return (
        <div>
            <h1>Consoles</h1>

            {consoles.map((console) => (
                <div key={console.id}>
                    <h2>{console.name}</h2>

                    <p>
                        Fabricante: {console.manufacturer}
                    </p>

                    <p>
                        Ano de lançamento: {console.release_year}
                    </p>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default ConsoleList;