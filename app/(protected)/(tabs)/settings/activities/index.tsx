import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, SectionList, StyleSheet, TouchableOpacity } from 'react-native';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface ActivityWithId extends Activity {
  id: string;
}

interface SectionData {
  title: string;
  data: ActivityWithId[];
}

export default function ActivitiesScreen() {
  const router = useRouter();
  const db = getFirestore();

  const [activities, setActivities] = useState<ActivityWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'activities'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activitiesFromDB: ActivityWithId[] = [];
      querySnapshot.forEach((doc: any) => {
        activitiesFromDB.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setActivities(activitiesFromDB);
    });

    return () => unsubscribe();
  }, []);

  const handleNewActivity = () => {
    router.push('/settings/activities/form');
  };

  const handleEditActivity = (activityId: string) => {
    router.push({
      pathname: '/settings/activities/form',
      params: { activityId },
    });
  };

  const handleDeleteActivity = (activityId: string, activityName: string) => {
    Alert.alert(
      'Supprimer l\'activité',
      `Êtes-vous sûr de vouloir supprimer "${activityName}" ?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteDoc(doc(db, 'activities', activityId));
              Alert.alert('Succès', 'Activité supprimée');
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'activité');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Group activities by day of week
  const groupedActivities = (() => {
    const grouped: { [key: string]: ActivityWithId[] } = {};
    
    DAYS_OF_WEEK.forEach(day => {
      grouped[day] = [];
    });

    activities.forEach(activity => {
      if (grouped[activity.location] === undefined) {
        grouped[activity.location] = [];
      }
      grouped[activity.location].push(activity);
    });

    // Return sections with days in order
    return DAYS_OF_WEEK
      .map(day => ({
        title: day,
        data: grouped[day] || [],
      }))
      .filter(section => section.data.length > 0 || true); // Keep all sections even if empty
  })();

  const renderNewActivityButton = () => (
    <TouchableOpacity 
      style={styles.newActivityButton} 
      onPress={handleNewActivity}
      disabled={isLoading}
    >
      <ThemedText style={styles.newActivityButtonText}>+ Nouvelle activité</ThemedText>
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item }: { item: ActivityWithId }) => (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={() => handleEditActivity(item.id)}
      disabled={isLoading}
    >
      <ThemedView style={styles.activityContent}>
        <ThemedText style={styles.activityName}>{item.name}</ThemedText>
        <ThemedText style={styles.activityTime}>{item.duration}</ThemedText>
      </ThemedView>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteActivity(item.id, item.name)}
        disabled={isLoading}
      >
        <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title, data } }: { section: SectionData }) => (
    <ThemedView style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {data.length === 0 && (
        <ThemedText style={styles.noActivitiesText}>Aucune activité</ThemedText>
      )}
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <SectionList
        sections={groupedActivities}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderNewActivityButton()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucune activité. Créez-en une!</ThemedText>
          </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  newActivityButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  newActivityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  noActivitiesText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  activityContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    paddingRight: 0,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
