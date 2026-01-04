import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FlatList, StyleSheet, View } from 'react-native';



interface Activity {
  name: string;
  startTime: string;
  location: string;
}

interface DayActivities {
  day: string;
  activities: Activity[];
}

const weeklyActivities: DayActivities[] = [
  {
    day: 'Dimanche',
    activities: [
      { startTime: '19h', name: 'Pot d\'arrivée', location: 'Terrain de pétanque' },
    ],
  },
  {
    day: 'Lundi',
    activities: [
      { startTime: '10-12h', name: 'Club enfant', location: 'Terrain de pétanque' },
      { startTime: '21h', name: 'Soirée pré-ados', location: 'Tente de réception' },
      { startTime: '21h', name: 'Rencontre autour du cochonet', location: 'Terrain de pétanque' },
    ],
  },
  { day: 'Mardi', activities: [
      { startTime: '10-12h', name: 'Club enfant', location: 'Terrain de pétanque' },
      { startTime: '20h', name: 'Repas Aveyronnais', location: 'Tente de réception' },
    ],
  },
  {
    day: 'Mercredi',
    activities: [
      { startTime: '10-12h', name: 'Club enfant', location: 'Terrain de pétanque' },
      { startTime: '18h', name: 'Initiation au Disc-golf', location: 'Terrain de foot' },
      { startTime: '21h', name: 'Loto des chalets', location: 'Bar' },
    ],
  },
  {
    day: 'Jeudi',
    activities: [
      { startTime: '9h', name: 'Petit-déjeuner aux tripous', location: 'Bar' },
      { startTime: '10-12h', name: 'Club enfant', location: 'Terrain de pétanque' },
      { startTime: '19h30 à 21h', name: 'Soirée Gazonne', location: 'Bar' },
    ],
  },
  { day: 'Vendredi', activities: [
      { startTime: '10-12h', name: 'Club enfant', location: 'Terrain de pétanque' },
      { startTime: '18h à 22h', name: 'Marché gourmand nocturne de Sauveterre-de-Rouergue', location: 'Place des Arcades' },
      { startTime: '21h', name: 'Visite aux flambeaux', location: 'Place des Arcades' },
    ],
  },
];


export default function UserActivities() {
  const renderActivity = ({ item }: { item: Activity }) => (
    <ThemedView style={styles.activityContainer}>
      <ThemedText style={styles.activityName}>{item.name}</ThemedText>
      <ThemedText style={styles.activityDetails}>{item.startTime} - {item.location}</ThemedText>
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
      data={weeklyActivities}
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

