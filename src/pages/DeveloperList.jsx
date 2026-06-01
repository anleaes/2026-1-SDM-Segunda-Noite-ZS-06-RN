import { useEffect, useState } from "react";
import api from "../services/api";

function DeveloperList() {
    const [developers, setDevelopers] = useState([]);

    useEffect(() => {
        api.get("/developer/")
            .then((response) => {
                setDevelopers(response.data);
            })
            .catch((error) => {
                console.error("Erro ao carregar desenvolvedoras:", error);
            });
    }, []);

    return (
        <div>
            <h1>Desenvolvedoras</h1>

            {developers.map((developer) => (
                <div key={developer.id}>
                    <h2>{developer.name}</h2>

                    <p>
                        País: {developer.country}
                    </p>

                    <p>
                        Fundação: {developer.foundation_year}
                    </p>

                    <p>
                        {developer.description}
                    </p>

                    <hr />
                </div>
            ))}
        </div>
    );
}

export default DeveloperList;