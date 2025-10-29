import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const QrScannerScreen: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

	const router = useRouter();

  if (!permission) {
    return <Text style={styles.permissionText}>Checking camera permissions...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

	function handleBackButton() {
		router.replace({
      pathname: '/login',
      params: { chalet: '42' },
    });
	}

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
				facing='back'
				barcodeScannerSettings={
					{
						barcodeTypes: ["qr"],
					}
				}
				onBarcodeScanned={
					({ data }) => {
						console.log(data);
						router.replace('/login');
					}
				}
				>
        <View style={styles.overlay}>
					<TouchableOpacity style={styles.flipButton} onPress={() => router.replace('/login')}>
            <Text style={styles.flipText}>back</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

export default QrScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  flipButton: {
    backgroundColor: '#ffffffaa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  flipText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111',
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#00e0ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
