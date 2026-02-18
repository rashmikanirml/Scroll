import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMovieDetails, getImageUrl } from '../api';

export default function MovieDetailScreen({ route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadMovie();
    checkWatchlist();
  }, []);

  const loadMovie = async () => {
    setLoading(true);
    const data = await getMovieDetails(movieId);
    setMovie(data);
    setLoading(false);
  };

  const checkWatchlist = async () => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      if (watchlist) {
        const list = JSON.parse(watchlist);
        setInWatchlist(list.some(item => item.id === movieId));
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    try {
      const watchlist = await AsyncStorage.getItem('watchlist');
      let list = watchlist ? JSON.parse(watchlist) : [];

      if (inWatchlist) {
        list = list.filter(item => item.id !== movieId);
      } else {
        list.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date,
        });
      }

      await AsyncStorage.setItem('watchlist', JSON.stringify(list));
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const openTrailer = () => {
    if (movie?.videos?.results?.length > 0) {
      const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        Linking.openURL(`https://www.youtube.com/watch?v=${trailer.key}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load movie details</Text>
      </View>
    );
  }

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = movie.credits?.crew?.find(person => person.job === 'Director');
  const cast = movie.credits?.cast?.slice(0, 6) || [];

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path || movie.poster_path) }}
        style={styles.backdrop}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            style={styles.poster}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.year}>
              {movie.release_date?.split('-')[0]} • {movie.runtime} min
            </Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#ffc107" />
              <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
              <Text style={styles.voteCount}>({movie.vote_count} votes)</Text>
            </View>
            <View style={styles.genres}>
              {movie.genres?.slice(0, 3).map(genre => (
                <View key={genre.id} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.watchlistButton]}
            onPress={toggleWatchlist}
          >
            <Ionicons
              name={inWatchlist ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>

          {trailer && (
            <TouchableOpacity
              style={[styles.button, styles.trailerButton]}
              onPress={openTrailer}
            >
              <Ionicons name="play-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Watch Trailer</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {director && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Director</Text>
            <Text style={styles.detail}>{director.name}</Text>
          </View>
        )}

        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cast.map(person => (
                <View key={person.id} style={styles.castCard}>
                  <Image
                    source={{ uri: getImageUrl(person.profile_path) }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName} numberOfLines={2}>
                    {person.name}
                  </Text>
                  <Text style={styles.castCharacter} numberOfLines={2}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {movie.budget > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget</Text>
            <Text style={styles.detail}>
              ${(movie.budget / 1000000).toFixed(1)}M
            </Text>
          </View>
        )}

        {movie.revenue > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <Text style={styles.detail}>
              ${(movie.revenue / 1000000).toFixed(1)}M
            </Text>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
  backdrop: {
    width: '100%',
    height: 220,
    backgroundColor: '#333',
  },
  content: {
    padding: 20,
    marginTop: -40,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: '#1a1a1a',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'flex-end',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  year: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    color: '#ffc107',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  voteCount: {
    color: '#666',
    fontSize: 12,
    marginLeft: 5,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },
  genreText: {
    color: '#fff',
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  watchlistButton: {
    backgroundColor: '#e50914',
  },
  trailerButton: {
    backgroundColor: '#333',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  overview: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  detail: {
    color: '#ccc',
    fontSize: 14,
  },
  castCard: {
    width: 100,
    marginRight: 12,
  },
  castImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  castName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  castCharacter: {
    color: '#999',
    fontSize: 11,
    textAlign: 'center',
  },
});
