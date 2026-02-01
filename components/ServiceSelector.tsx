import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ServiceSelectorProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
}

export default function ServiceSelector({ selectedService, onServiceChange }: ServiceSelectorProps) {
  return (
    <ThemedView style={styles.serviceContainer}>
      <ThemedText style={styles.serviceLabel}>Service :</ThemedText>
      <ThemedView style={styles.serviceButtonsWrapper}>
        <TouchableOpacity
          style={[styles.serviceButton, selectedService === 'Snack' && styles.serviceButtonActive]}
          onPress={() => onServiceChange('Snack')}
        >
          <ThemedText style={[styles.serviceButtonText, selectedService === 'Snack' && styles.serviceButtonTextActive]}>
            Snack
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.serviceButton, selectedService === 'Bar' && styles.serviceButtonActive]}
          onPress={() => onServiceChange('Bar')}
        >
          <ThemedText style={[styles.serviceButtonText, selectedService === 'Bar' && styles.serviceButtonTextActive]}>
            Bar
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  serviceContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceLabel: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
    minWidth: 70,
  },
  serviceButtonsWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  serviceButtonText: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
  },
  serviceButtonTextActive: {
    color: '#fff',
  },
});
