import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, Alert, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [matricule, setMatricule] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const SERVER_URL = 'https://maggot-caucus-sprite.ngrok-free.dev';

  if (!permission) {
    return <View style={styles.centerContainer} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>We need camera permission to scan.</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const response = await fetch(`${SERVER_URL}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Room: data,                 
          OperatorId: matricule,      
          Timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        Alert.alert("Success!", `AC ${data} was successfully logged!`, [
          { 
            text: "Scan Next", 
            // We ONLY reset the scan state so the camera stays open!
            onPress: () => setScanned(false) 
          }
        ]);
      } else {
        Alert.alert("Problem", "Server rejected the data.", [
          { text: "Try Again", onPress: () => setScanned(false) }
        ]);
      }
    } catch (error) {
      Alert.alert("Connection error", "Please verify the server is running.", [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
    }
  };

  const startScan = () => {
    if (!matricule.trim()) {
      Alert.alert("Error", "Please enter your matricule before scanning.");
      return;
    }
    setScanned(false);
    setIsScanning(true);
  };

  // --- SCANNER SCREEN ---
  if (isScanning) {
    return (
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <Text style={styles.text}>Scan the air conditioner QR Code</Text>
            {/* Exit Button */}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsScanning(false)}>
              <Text style={styles.buttonText}>✖ End Scanning & Exit</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  // --- HOME PAGE ---
  return (
    <View style={styles.container}>
      <View style={styles.homeContainer}>
        
        {/* Hirschmann Logo */}
        <Image 
          source={require('../../assets/images/hirschmann_logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        <Text style={styles.title}>Hirschmann ClimeScanner</Text>
        
        <Text style={styles.label}>Enter Your Matricule:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: H12345"
          placeholderTextColor="#888"
          value={matricule}
          onChangeText={setMatricule}
        />
        
        <TouchableOpacity style={styles.scanButton} onPress={startScan}>
          <Text style={styles.buttonText}>START SCANNING</Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER: Signature & LinkedIn */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Done by Rim Jabal</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/rim-jabal-109a03250')}>
          <Text style={styles.linkText}>www.linkedin.com/in/rim-jabal-109a03250</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  homeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logo: { width: 220, height: 80, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#004A99', marginBottom: 40, textAlign: 'center' },
  label: { alignSelf: 'flex-start', fontSize: 16, color: '#333', marginBottom: 8, fontWeight: '500' },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', marginBottom: 30, color: '#000' },
  scanButton: { width: '100%', height: 55, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  cancelButton: { backgroundColor: '#FF3B30', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, marginTop: 'auto' },
  text: { fontSize: 18, color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 8, marginTop: 40 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  // Footer Styles
  footer: { padding: 20, alignItems: 'center', backgroundColor: '#F0F2F5', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  linkText: { color: '#0066CC', fontSize: 13, marginTop: 4, textDecorationLine: 'underline' }
});