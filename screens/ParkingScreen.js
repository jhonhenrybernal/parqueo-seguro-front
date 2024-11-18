import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, ScrollView, Linking, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker'; // Importa el paquete para manejar imágenes
import axios from 'axios';

export default function ParkingScreen() {
  const [parkingType, setParkingType] = useState(null); // 'sotanos' o 'pisos'
  const [levels, setLevels] = useState(''); // Cantidad de niveles
  const [spaces, setSpaces] = useState([]); // Espacios dinámicos
  const [parkingName, setParkingName] = useState('');
  const [legalRepresentative, setLegalRepresentative] = useState('');
  const [address, setAddress] = useState('');
  const [isCovered, setIsCovered] = useState(null); // 'si' o 'no'
  const [totals, setTotals] = useState({ totalCars: 0, totalBikes: 0, totalCombined: 0 }); // Totales
  const [image, setImage] = useState(null); // Almacena la imagen seleccionada
  const API_URL = 'http://192.168.10.13:8000/api';
  const handleLevelsChange = (value) => {
    setLevels(value);
    const newSpaces = Array.from({ length: parseInt(value) || 0 }, (_, index) => ({
      level: index + 1,
      carSpaces: '',
      bikeSpaces: '',
    }));
    setSpaces(newSpaces);
  };

  const handleSpaceChange = (levelIndex, type, value) => {
    const updatedSpaces = spaces.map((space, index) =>
      index === levelIndex ? { ...space, [type]: value } : space
    );
    setSpaces(updatedSpaces);
  };

  useEffect(() => {
    const totalCars = spaces.reduce((sum, space) => sum + (parseInt(space.carSpaces) || 0), 0);
    const totalBikes = spaces.reduce((sum, space) => sum + (parseInt(space.bikeSpaces) || 0), 0);
    setTotals({
      totalCars,
      totalBikes,
      totalCombined: totalCars + totalBikes,
    });
  }, [spaces]);

  const handleVerifyAddress = async () => {
    if (!address) {
      Alert.alert('Error', 'Por favor ingresa una dirección.');
      return;
    }

    // Construir URL de búsqueda en Google Maps basada en la dirección
    const encodedAddress = encodeURIComponent(address); // Codifica la dirección para incluirla en la URL
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se pudo abrir Google Maps.');
    }
  };

  const handlePickImage = async () => {
    // Solicita permisos para acceder a la galería y la cámara
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1, // Alta calidad de la imagen
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Guarda la URI de la imagen seleccionada
    }
  };

  const handleSaveParking = async  () => {
    if (!parkingType || !levels || !spaces.length || !parkingName || !legalRepresentative || !address || isCovered === null || !image) {
      Alert.alert('Error', 'Todos los campos son obligatorios, incluida la imagen.');
      return;
    }

    if (spaces.some((space) => !space.carSpaces || !space.bikeSpaces)) {
      Alert.alert('Error', 'Por favor, llena todos los espacios de parqueo.');
      return;
    }

   const data = {
      parkingName,
      legalRepresentative,
      parkingType,
      levels,
      spaces,
      totals,
      address,
      isCovered,
      image,
    };

    console.log(data)
    try {
      // Enviar datos al backend
      const response = await axios.post(`${API_URL}/parking`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      console.log('Respuesta del servidor:', response.data); // Confirmar respuesta del servidor
  
      if (response.status === 200) {
        Alert.alert('Éxito', 'Parqueadero registrado exitosamente.');
      } else {
        Alert.alert('Error', 'Algo salió mal al registrar el parqueadero.');
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Nombre del Parqueadero</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese el nombre del parqueadero"
          value={parkingName}
          onChangeText={setParkingName}
        />

        <Text style={styles.label}>Representante Legal</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese el nombre del representante legal"
          value={legalRepresentative}
          onChangeText={setLegalRepresentative}
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese la dirección"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity style={styles.button} onPress={handleVerifyAddress}>
          <Text style={styles.buttonText}>Verificar por Maps</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Imagen del Sitio</Text>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Tipo de Parqueadero</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[styles.radioButton, parkingType === 'sotanos' && styles.radioButtonSelected]}
            onPress={() => setParkingType('sotanos')}
          >
            <Text style={styles.radioText}>Sótanos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, parkingType === 'pisos' && styles.radioButtonSelected]}
            onPress={() => setParkingType('pisos')}
          >
            <Text style={styles.radioText}>Pisos</Text>
          </TouchableOpacity>
        </View>

        {parkingType && (
          <View>
            <Text style={styles.label}>Cantidad de {parkingType === 'sotanos' ? 'Sótanos' : 'Pisos'}</Text>
            <Picker
              selectedValue={levels}
              style={styles.picker}
              onValueChange={(itemValue) => handleLevelsChange(itemValue)}
            >
              <Picker.Item label="Seleccione..." value="" />
              {Array.from({ length: parkingType === 'sotanos' ? 4 : 20 }, (_, i) => (
                <Picker.Item key={i} label={`${i + 1}`} value={`${i + 1}`} />
              ))}
            </Picker>
          </View>
        )}

        {spaces.length > 0 && (
          <View>
            <Text style={styles.label}>Espacios de Parqueo por Nivel</Text>
            {spaces.map((space, index) => (
              <View key={index} style={styles.levelContainer}>
                <Text style={styles.levelLabel}>Nivel {space.level}</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="Carros"
                  keyboardType="numeric"
                  value={space.carSpaces}
                  onChangeText={(value) => handleSpaceChange(index, 'carSpaces', value)}
                />
                <TextInput
                  style={styles.smallInput}
                  placeholder="Motos"
                  keyboardType="numeric"
                  value={space.bikeSpaces}
                  onChangeText={(value) => handleSpaceChange(index, 'bikeSpaces', value)}
                />
              </View>
            ))}

            <View style={styles.totalsContainer}>
              <Text style={styles.totalText}>Total Carros: {totals.totalCars}</Text>
              <Text style={styles.totalText}>Total Motos: {totals.totalBikes}</Text>
              <Text style={styles.totalText}>Total (Carros + Motos): {totals.totalCombined}</Text>
            </View>
          </View>
        )}

        <Text style={styles.label}>¿Parqueadero Cubierto?</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={[styles.radioButton, isCovered === 'si' && styles.radioButtonSelected]}
            onPress={() => setIsCovered('si')}
          >
            <Text style={styles.radioText}>Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, isCovered === 'no' && styles.radioButtonSelected]}
            onPress={() => setIsCovered('no')}
          >
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>

        {/* Botón al final del contenido desplazable */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveParking}>
          <Text style={styles.saveButtonText}>Guardar Parqueadero</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  radioContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  radioButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#ccc',
    borderColor: 'green',
  },
  radioText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  smallInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginLeft: 5,
    textAlign: 'center',
  },
  totalsContainer: {
    marginTop: 10,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
