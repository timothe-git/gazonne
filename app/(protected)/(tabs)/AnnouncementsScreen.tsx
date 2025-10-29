import { authContext } from '@/utils/AuthContext';
import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, serverTimestamp } from '@react-native-firebase/firestore';
import React, { useContext, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import styles from '@/styles/styles';
import { Message } from '@/types/types';
import { Image } from 'expo-image';


const AnnouncementsScreen = ({ userId, isOwner }: { userId: string; isOwner: boolean }) => {
  const [messages, setMessages] = useState<Message []>([]);
  const [newMessage, setNewMessage] = useState('');
	const db = getFirestore();

  const authState = useContext(authContext);


  useEffect(() => {
		
		const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
			const announcements: Message[] = [];
			querySnapshot.forEach((doc: any) => {
					announcements.push({
            id: doc.id,
            ...doc.data(),
          });
			});
      setMessages(announcements);
		});

    return () => unsubscribe();
  }, [userId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      sender: isOwner ? 'owner' : 'user',
      createdAt: serverTimestamp(),
    };


		try {
			const docRef = await addDoc(collection(db, "announcements"), messageData);
			console.log("Document written with ID: ", docRef.id);
		} catch (e) {
			console.error("Error adding document: ", e);
		}

    setNewMessage('');
  };

  const handleDelete = async (id: string) => {
    return;
  };

  const displayMenu = (id: string) => {
    console.log(id);
    
  }

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => handleDelete(id) },
    ]);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.sender}>{item.sender}</Text>
      <Pressable onLongPress={() => displayMenu(item.id)} style={styles.messageBubble}>
        <Text style={styles.messageContent}>{item.content}</Text>
      </Pressable>
      {item.createdAt && (
        <Text style={styles.timestamp}>
          {item.createdAt.toDate().toLocaleString()}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView>
      <ThemedView>
        <ThemedText
          type="title">
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" >
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ScrollView>
  );
};

export default AnnouncementsScreen;
