import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ScrollView
} from "react-native";

import api from "../services/api";

interface Game {
  id: number;
  title: string;
  description: string;
  release_year: number;
  average_rating: number;
  cover_image: string;
}

const GamesScreen = () => {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    api.get("/jogos")
      .then((response) => {
        console.log(response.data);
        setGames(response.data);
      })
      .catch((error) => {
        console.error("Erro ao carregar jogos:", error);
      });
  }, []);

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Biblioteca de Jogos Antigos
      </Text>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Text style={styles.gameTitle}>
              {item.title}
            </Text>

            <Text>
              {item.description}
            </Text>

            <Text>
              Ano: {item.release_year}
            </Text>

            <Text>
              Nota: {item.average_rating}
            </Text>

            {item.cover_image ? (
              <Image
                source={{
                  uri: item.cover_image
                }}
                style={styles.image}
              />
            ) : null}

          </View>
        )}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15
  },

  card: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    borderRadius: 8
  },

  gameTitle: {
    fontSize: 18,
    fontWeight: "bold"
  },

  image: {
    width: 200,
    height: 300,
    marginTop: 10,
    resizeMode: "cover"
  }
});

export default GamesScreen;