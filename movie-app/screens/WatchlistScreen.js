import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrl } from '../api';

export default function WatchlistScreen({ navigation }) {
  const [watchlist, setWatchlist] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadWatchlist();
    }, [])
  );

  const loadWatchlist = async () => {
    try {
      const data = await AsyncStorage.getItem('watchlist');
      if (data) {
        setWatchlist(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const removeFromWatchlist = async (movieId) => {
    try {
      const newWatchlist = watchlist.filter(item => item.id !== movieId);
      await AsyncStorage.setItem('watchlist', JSON.stringify(newWatchlist));
      setWatchlist(newWatchlist);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const renderMovie = ({ item }) => (
    <View style={styles.movieCard}>
      <TouchableOpacity
        style={styles.movieContent}
        onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
      >
        <Image
          source={{ uri: getImageUrl(item.poster_path) }}
          style={styles.poster}
        />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.year}>
            {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
          </Text>
          <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromWatchlist(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#e50914" />
      </TouchableOpacity>
    </View>
  );

  if (watchlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={80} color="#333" />
        <Text style={styles.emptyText}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtext}>
          Add movies to watch them later
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Movies</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        <Text style={styles.count}>{watchlist.length} movies</Text>
      </View>
      <FlatList
        data={watchlist}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  count: {
    color: '#999',
    fontSize: 14,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#e50914',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 15,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  movieContent: {
    flex: 1,
    flexDirection: 'row',
  },
  poster: {
    width: 80,
    height: 120,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  year: {
    color: '#999',
    fontSize: 13,
    marginBottom: 5,
  },
  rating: {
    color: '#ffc107',
    fontSize: 13,
    fontWeight: 'bold',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
