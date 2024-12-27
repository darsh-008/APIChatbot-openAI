import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

// System message to define ChatGPT's behavior
const systemMessage = {
  role: 'system',
  content: '',
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm ChatGPT! Ask me anything!",
      direction: 'incoming',
      sentTime: 'just now',
      sender: 'ChatGPT',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // Prepare messages for the backend
    const apiRequestBody = {
      messages: [
        systemMessage, // Add system message
        ...chatMessages.map((messageObject) => ({
          role: messageObject.sender === 'ChatGPT' ? 'assistant' : 'user',
          content: messageObject.message,
        })),
      ],
    };

    // Call your backend endpoint
    await fetch('http://localhost:5001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.reply, // Adjust based on your backend response format
            direction: 'incoming',
            sender: 'ChatGPT',
          },
        ]);
        setIsTyping(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsTyping(false);
      });
  }

  return (
    <div className="App">
      <div style={{ position: 'relative', height: '800px', width: '700px' }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
            >
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
