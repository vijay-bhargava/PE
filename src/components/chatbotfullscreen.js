// components/ChatbotFullScreen.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { Send } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import { PE_CHATBOT_API, PE_CHATBOT_Web_API } from '../utils/common/utility';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

const ChatbotFullScreen = () => {
  const location = useLocation();
  const { pathname } = location;
  const [input, setInput] = useState('');
  const [inputtext, setInputtext] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Welcome to ProcurEngine! We simplify procurement processes, boost business profits and offer 3X adoption in various industry sectors. Ready to revolutionize your B2B experience?', sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const chatBodyRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('chatMessages', JSON.stringify(messages));
    }
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setInputtext(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInputtext('');
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: 'user' }]);
    setIsTyping(true); // Set typing indicator on user input
    const data = { input, history: messages };

    try {
      const response = await axios.post(
        pathname.includes("chatbotwebsite") ? `${PE_CHATBOT_Web_API}` : `${PE_CHATBOT_API}`,
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { answer } = response.data;

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: answer, sender: 'bot' },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Sorry, something went wrong.', sender: 'bot' },
      ]);
    } finally {
      setInput('');
      setIsTyping(false); // Stop typing indicator after response
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
        }}
      >
        <Paper
          elevation={3}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fff',
          }}
        >
          <Box className="chat-header">
            <div className='css-1hibz0x'>
              <Typography className='css-tveybr fw600'>Abby</Typography>
              <span className='css-1y79z6g'>online</span>
            </div>
          </Box>
          <Box
            ref={chatBodyRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '10px',
                }}
              >
                <Paper
                  elevation={1}
                  style={{
                    padding: '10px',
                    backgroundColor: message.sender === 'user' ? '#0d6efd' : '#f1f1f1',
                    color: message.sender === 'user' ? '#fff' : '#000',
                    borderRadius: '10px',
                    maxWidth: '70%',
                  }}
                >
                  <Typography variant="body1">
                    {typeof message.text === 'string' ? (
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    ) : (
                      message.text
                    )}
                  </Typography>
                </Paper>
              </Box>
            ))}
            {isTyping && (
              <Box style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={1}
                  style={{
                    padding: '10px',
                    backgroundColor: '#f1f1f1',
                    color: '#000',
                    borderRadius: '10px',
                    maxWidth: '70%',
                  }}
                >
                  <Typography variant="body1">Typing...</Typography>
                </Paper>
              </Box>
            )}
          </Box>
          <Box style={{ padding: '10px' }}>
            <Typography variant="caption" style={{ marginBottom: '5px', color: '#888',display: 'flex', justifyContent: 'flex-center' }}>
                This chatbot is powered by AI. Responses may not always be fully accurate.

            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={inputtext}
                onChange={handleInputChange}
                placeholder="Type your message..."
                style={{ marginRight: '10px', borderRadius: '20px' }}
              />
              <Button type="submit" variant="contained" style={{ backgroundColor: '#0d6efd' }} endIcon={<Send />}>
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ChatbotFullScreen;
