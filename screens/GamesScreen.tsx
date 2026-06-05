import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../src/services/api';

interface Game {
  id: number;
  title: string;
  release_year: number;
  cover_image: string | null;
  average_rating: string | null;
}

export default function GamesScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jogos/') 
      .then((response) => {
        setGames(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar jogos:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.cover_image ? (
              <Image source={{ uri: item.cover_image }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Sem Capa</Text>
              </View>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.gameName}>{item.title}</Text>
              <Text style={styles.gameYear}>Ano: {item.release_year}</Text>
              {item.average_rating && (
                <Text style={styles.gameRating}>Nota: {item.average_rating}</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { 
    flexDirection: 'row', 
    padding: 15, 
    marginHorizontal: 10,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2, 
  },
  coverImage: { 
    width: 60, 
    height: 80, 
    borderRadius: 4, 
    marginRight: 15 
  },
  placeholderImage: {
    width: 60,
    height: 80,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 10, color: '#666' },
  infoContainer: { flex: 1, justifyContent: 'center' },
  gameName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  gameYear: { fontSize: 14, color: '#666', marginTop: 4 },
  gameRating: { fontSize: 14, color: '#007BFF', marginTop: 4, fontWeight: '600' }
});