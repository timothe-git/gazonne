import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messageList: {
    flex: 1,
  },

  messageContainer: {
    marginVertical: 8,
    marginLeft: 16,
    alignItems: 'flex-start',
  },
  sender: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  messageBubble: {
    backgroundColor: '#d1e7dd',
    borderRadius: 20,
    padding: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageContent: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  input: {
    marginHorizontal: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  owner: {
    textAlign: 'right',
    backgroundColor: '#dcf8c6',
    marginBottom: 4,
    padding: 8
  },
  user: {
    textAlign: 'left',
    backgroundColor:
    '#f1f0f0',
    marginBottom: 4,
    padding: 8
  },
});