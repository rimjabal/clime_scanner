import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, Alert, TouchableOpacity, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@offline_scans';

export default function App() {
  const [matricule, setMatricule] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  const SERVER_URL = 'https://maggot-caucus-sprite.ngrok-free.dev';

  useEffect(() => {
    checkOfflineScans();
  }, []);

  const checkOfflineScans = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const scans = JSON.parse(stored);
        setOfflineCount(scans.length);
        // Ila l9ina l-internet wla l-serveur, n-jarrbo nsiftohom automatic
        if (scans.length > 0) {
          syncOfflineScans(scans);
        }
      }
    } catch (e) {
      console.log("Error reading offline storage", e);
    }
  };

  const syncOfflineScans = async (scansToSync?: any[]) => {
    try {
      const stored = scansToSync || JSON.parse(await AsyncStorage.getItem(STORAGE_KEY) || '[]');
      if (stored.length === 0) return;

      // N-jarrbo nsifto w7da b w7da awla kamlin
      let remainingScans = [...stored];
      
      for (const item of stored) {
        try {
          const response = await fetch(`${SERVER_URL}/api/logs`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': '69420'
            },
            body: JSON.stringify(item),
          });

          if (response.ok) {
            // Ila dazet mzyan, n-7ydiwha mn l-liste
            remainingScans = remainingScans.filter((s: any) => s.Timestamp !== item.Timestamp);
          } else {
            break; // Ila rfedha l-serveur, n-7bso l-boucle
          }
        } catch (err) {
          break; // Ila mcha l-internet, n-7bso
        }
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remainingScans));
      setOfflineCount(remainingScans.length);
      if (remainingScans.length < stored.length) {
        console.log("Synced offline scans successfully!");
      }
    } catch (e) {
      console.log("Sync error", e);
    }
  };

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

    const logData = {
      Room: data,                    
      OperatorId: matricule,      
      Timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(`${SERVER_URL}/api/logs`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(logData),
      });

      if (response.ok) {
        Alert.alert("Success!", `AC ${data} was successfully logged!`, [
          { text: "Scan Next", onPress: () => setScanned(false) }
        ]);
      } else {
        // Server tafi awla rfedha -> N-khbbiwha offline
        await saveOffline(logData);
      }
    } catch (error) {
      // Net t9te3 awla l-PC tafi -> N-khbbiwha offline
      await saveOffline(logData);
    }
  };

  const saveOffline = async (logData: any) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const scans = stored ? JSON.parse(stored) : [];
      scans.push(logData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
      setOfflineCount(scans.length);

      Alert.alert("Saved Offline 📴", `Server unreachable. Scan saved locally (${scans.length} pending).`, [
        { text: "OK", onPress: () => setScanned(false) }
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not save scan locally.", [
        { text: "Try Again", onPress: () => setScanned(false) }
      ]);
    }
  };

  const startScan = () => {
    if (!matricule.trim()) {
      Alert.alert("Error", "Please enter your matricule before scanning.");
      return;
    }
    syncOfflineScans();
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
            
            {offlineCount > 0 && (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineBadgeText}>📴 Pending Offline: {offlineCount}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => { setIsScanning(false); checkOfflineScans(); }}>
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

        {offlineCount > 0 && (
          <TouchableOpacity style={styles.syncButton} onPress={() => syncOfflineScans()}>
            <Text style={styles.syncButtonText}>🔄 Sync Offline Scans ({offlineCount})</Text>
          </TouchableOpacity>
        )}
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
  syncButton: { width: '100%', height: 45, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 15 },
  syncButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  cancelButton: { backgroundColor: '#FF3B30', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, marginTop: 'auto' },
  text: { fontSize: 18, color: '#fff', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 8, marginTop: 40 },
  offlineBadge: { backgroundColor: 'rgba(245, 158, 11, 0.9)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginTop: 10 },
  offlineBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  footer: { padding: 20, alignItems: 'center', backgroundColor: '#F0F2F5', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  linkText: { color: '#0066CC', fontSize: 13, marginTop: 4, textDecorationLine: 'underline' }
});