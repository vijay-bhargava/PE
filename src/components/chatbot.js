import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import { ChatBubbleOutline, Close, Send } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FaComments } from 'react-icons/fa6';
import chatbotlogo from "../assets/images/chatbotlogo.png";

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
    fontFamily: '"Inter", "Roboto", "Segoe UI", system-ui, -apple-system, sans-serif',
  },
});

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [input, setInput] = useState('');
  const [inputtext, setInputtext] = useState('');
  const [messages, setMessages] = useState(() => {
    return [{ text: 'Welcome to ProcurEngine! We simplify procurement processes, boost business profits and offer 3X adoption in various industry sectors. Ready to revolutionize your B2B experience? ', sender: 'bot' }]

  });
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
    const data = { input, history: messages };

    try {
      const response = await axios.post('https://pechatbot-hjfbccdvd5c6dhbj.centralindia-01.azurewebsites.net/askweb/', data, { // Replace with your external API endpoint
        headers: { 'Content-Type': 'application/json' },
      });

      const { answer } = response.data;

      setMessages([
        ...messages,
        { text: input, sender: 'user' },
        { text: answer, sender: 'bot' },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...messages, { text: input, sender: 'user' }, { text: 'Sorry, something went wrong.', sender: 'bot' }]);
    }

    setInput('');
  };

  return (
    <>
      {/* Chatbot Window */}
      {isOpen && (

        <ThemeProvider theme={theme}>
          <Box>
            <Paper
              elevation={3}
              className={`chat-container ZoomIn ${isOpen ? 'open' : ''}`}
              sx={{
                display: isOpen ? 'flex' : 'none',
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                width: '400px',
                minHeight: '500px',
                maxHeight: '600px',
                zIndex: 10000,
                borderRadius: '16px',
                flexDirection: 'column'
              }}
            >
              <Box className="chat-header">
                <div className='css-1hibz0x'>
                  <Typography className='css-tveybr fw600'>Abby</Typography>
                  <span className='css-1y79z6g '>online</span>
                </div>

                <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ bgColor:"#eaeaea" }}>
                  <Close />
                </IconButton>
              </Box>
              <Box ref={chatBodyRef} className="chat-body">
                {messages?.map((message, index) => (
                  <Box key={index} ref={index === messages.length - 1 ? lastMessageRef : null} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                    <Paper elevation={1} className={`message-text ${message.sender === 'user' ? 'user-message-text' : 'bot-message-text'}`}>
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
              </Box>
              <Box component="form" onSubmit={handleSubmit} className="chat-input">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={inputtext}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  sx={{ marginRight: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <Button type="submit" variant="contained" style={{ backgroundColor: '#1976d2', borderRadius: '8px', textTransform: 'none', fontWeight: 500, fontSize: '13px' }} endIcon={<Send />}>Send</Button>
              </Box>
            </Paper>
          </Box>
        </ThemeProvider>
      )}
    </>
  );
};

export default Chatbot;




