import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity, DayActivities } from '@/types/types';
import { collection, getFirestore, onSnapshot, query } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

interface ActivityWithId extends Activity {
  id: string;
}


export default function ActivitiesScreen() {
  const db = getFirestore();
  const [activities, setActivities] = useState<ActivityWithId[]>([]);

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

  // Group activities by day (location field)
  const groupActivitiesByDay = (): DayActivities[] => {
    const grouped: { [key: string]: Activity[] } = {};
    
    DAYS_OF_WEEK.forEach(day => {
      grouped[day] = [];
    });

    activities.forEach(activity => {
      if (grouped[activity.location] === undefined) {
        grouped[activity.location] = [];
      }
      grouped[activity.location].push(activity);
    });

    return DAYS_OF_WEEK
      .map(day => ({
        day,
        activities: grouped[day] || [],
      }));
  };

  const displayActivities = groupActivitiesByDay();

  const renderActivity = ({ item }: { item: Activity }) => (
    <ThemedView style={styles.activityContainer}>
      <ThemedText style={styles.activityName}>{item.name}</ThemedText>
      <ThemedText style={styles.activityDetails}>{item.duration} - {item.location}</ThemedText>
    </ThemedView>
  );

  const renderDayActivities = ({ item }: { item: DayActivities }) => (
    <ThemedView style={styles.dayContainer}>
      <ThemedText style={styles.dayTitle}>{item.day}</ThemedText>
      {item.activities.length > 0 ? (
        <FlatList
          data={item.activities}
          renderItem={renderActivity}
          keyExtractor={(activity) => activity.name}
          ItemSeparatorComponent={hlineSeparator}
        />
      ) : (
        <ThemedText style={styles.noActivities}>Pas d'activités prévues</ThemedText>
      )}
    </ThemedView>
  );

  const spaceSeparator = () => {
    return <View style={styles.sep}></View>;
  };

  const hlineSeparator = () => {
    return <View style={styles.separator} />;
  }

  return (
    <FlatList
      data={displayActivities}
      renderItem={renderDayActivities}
      keyExtractor={(day) => day.day}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={spaceSeparator}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  dayContainer: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTitle: {
    color: 'green',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityContainer: {
    paddingVertical: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  activityDetails: {
    fontSize: 14,
    color: '#666',
  },
  noActivities: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  sep: {
    height: 16,
  },
  separator: {
    height: 1, // Height of the line
    backgroundColor: '#e0e0e0', // Color of the line
    width: '100%', // Make the line full width
  }
});

