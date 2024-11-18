import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ route }) {
  const { id } = route.params || {}; // Obtener el ID de la URL
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://192.168.10.13:8000/api';

  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'No se proporcionó un ID válido para el parqueadero.');
      setLoading(false);
      return;
    }

    const fetchParking = async () => {
      try {
        const response = await axios.get(`${API_URL}/parking/${id}`);
        setParking(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo cargar la información del parqueadero.');
      } finally {
        setLoading(false);
      }
    };

    fetchParking();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );
  }

  if (!parking) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Parqueadero no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{parking.name}</Text>
      <Text style={styles.detail}>Representante Legal: {parking.legal_representative}</Text>
      <Text style={styles.detail}>Dirección: {parking.address}</Text>
      <Text style={styles.detail}>Niveles: {parking.levels}</Text>
      <Text style={styles.detail}>¿Cubierto?: {parking.is_covered ? 'Sí' : 'No'}</Text>
      <Text style={styles.detail}>Total de carros: {parking.total_cars}</Text>
      <Text style={styles.detail}>Total de motos: {parking.total_bikes}</Text>
      <Text style={styles.detail}>Total combinado: {parking.total_combined}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});
