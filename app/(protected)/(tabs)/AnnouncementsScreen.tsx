import { authContext } from '@/utils/AuthContext';
import { addDoc, collection, getFirestore, onSnapshot, orderBy, query, serverTimestamp } from '@react-native-firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, Text, TextInput, View } from 'react-native';

import styles from '@/styles/styles';
import { Message } from '@/types/types';


const AnnouncementsScreen = () => {
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
  }, []); // userId

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      content: newMessage,
      sender: authState.email,
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
    <View style={styles.container}>
      <FlatList
        style={styles.messageList}
        data={messages}
        renderItem={renderMessage}
        inverted />
      {authState.isAdmin && (
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          placeholder="Aa"></TextInput>
      )}
    </View>
  );
};

export default AnnouncementsScreen;