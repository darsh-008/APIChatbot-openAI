import { useState, useRef, useEffect } from 'react';
import './App.css';
import img2 from './assets/img2.jpg';

function App() {
  const [messages, setMessages] = useState([
    {
      text: "Hello, I'm ChatGPT! You can ask me anything or upload a photo.",
      sender: 'ChatGPT',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null);
  const messageContainerRef = useRef(null);

  const handleSend = async () => {
    if (!inputValue.trim() && !uploadedImage) return;

    const newMessage = {
      text: inputValue.trim(),
      image: uploadedImage,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue('');
    setUploadedImage(null);

    setIsTyping(true);
    await processMessage(newMessage);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage({ file, preview: imageUrl });
      event.target.value = '';
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage({ file, preview: imageUrl });
    }
  };

  const processMessage = async (message) => {
    try {
      if (message.image) {
        const formData = new FormData();
        formData.append('file', message.image.file);
        formData.append('text', message.text);

        const response = await fetch('https://apichatbot-openai-asgj.onrender.com/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.reply, sender: 'ChatGPT' },
          { image: { url: data.imageUrl }, sender: 'ChatGPT' },
        ]);
      } else {
        const response = await fetch('https://apichatbot-openai-asgj.onrender.com/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message.text }],
          }),
        });

        const data = await response.json();

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.reply, sender: 'ChatGPT' },
        ]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setZoomedImage(imageUrl);
  };

  const handleCloseZoom = () => {
    setZoomedImage(null);
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div
      className="App"
      style={{
        height: '100vh',
        maxHeight: '90vh',
        width: '100vw',
        maxWidth: '90vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Blurred Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(/assests/img2.jpg) no-repeat center center/cover', // Replace with your preferred background image
          filter: 'blur(10px)',
          zIndex: 0,
        }}
      ></div>

      {/* Chat Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '500px',
          height: '90vh',
          margin: 'auto',
          borderRadius: '10px',
          backgroundColor: '#2e2e2e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <header
          style={{
            background: 'linear-gradient(90deg, #007bff, #0056b3)',
            padding: '15px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
          }}
        >
          ChatGPT
        </header>

        {/* Messages Container */}
        <div
          ref={messageContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.sender === 'user' ? '#007bff' : '#444',
                color: '#fff',
                padding: '10px',
                borderRadius: '10px',
                maxWidth: '80%',
                wordWrap: 'break-word',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              }}
            >
              {message.text && <div>{message.text}</div>}
              {message.image?.preview && (
                <img
                  src={message.image.preview}
                  alt="Uploaded Preview"
                  style={{
                    marginTop: '10px',
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '8px',
                  }}
                  onClick={() => handleImageClick(message.image.preview)}
                />
              )}
              {message.image?.url && (
                <img
                  src={message.image.url}
                  alt="Generated Image"
                  style={{
                    marginTop: '10px',
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '8px',
                  }}
                  onClick={() => handleImageClick(message.image.url)}
                />
              )}
            </div>
          ))}
          {isTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                fontStyle: 'italic',
                color: '#888',
              }}
            >
              ChatGPT is typing...
            </div>
          )}
        </div>

        {/* Input Section */}
        <div
          style={{
            padding: '10px',
            borderTop: '1px solid #444',
            backgroundColor: '#333',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {isDragging && (
            <div
              style={{
                border: '2px dashed #28a745',
                padding: '10px',
                textAlign: 'center',
                borderRadius: '10px',
                backgroundColor: '#333',
                color: '#28a745',
              }}
            >
              Drop the file here...
            </div>
          )}
          {!isDragging && uploadedImage && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <img
                src={uploadedImage.preview}
                alt="Preview"
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  borderRadius: '5px',
                  marginBottom: '10px',
                }}
              />
              <button
                onClick={() => setUploadedImage(null)}
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #555',
                borderRadius: '5px',
                backgroundColor: '#444',
                color: '#fff',
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Upload
            </label>
            <button
              onClick={handleSend}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={handleCloseZoom}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
