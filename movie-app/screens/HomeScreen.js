import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getTrendingMovies, getPopularMovies, getImageUrl } from '../api';

export default function HomeScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    const [trendingData, popularData] = await Promise.all([
      getTrendingMovies(),
      getPopularMovies(),
    ]);
    setTrending(trendingData);
    setPopular(popularData);
    setLoading(false);
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.poster}
      />
      <Text style={styles.movieTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>SCROLL</Text>
        <Text style={styles.tagline}>Discover Your Next Favorite Movie</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Trending This Week</Text>
        <FlatList
          data={trending}
          renderItem={renderMovie}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍿 Popular Movies</Text>
        <FlatList
          data={popular}
          renderItem={renderMovie}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 30,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e50914',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 15,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  movieCard: {
    width: 140,
    marginHorizontal: 5,
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  movieTitle: {
    color: '#fff',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
  ratingContainer: {
    marginTop: 4,
  },
  rating: {
    color: '#ffc107',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
