import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import  ChatProvider  from '/Users/anamikaverma/chat_app/frontend/src/Context/ChatProvider.jsx'

createRoot(document.getElementById('root')).render(
  
  <BrowserRouter>
  <ChatProvider>
    <ChakraProvider>
      <App />
    </ChakraProvider>
     </ChatProvider>
  </BrowserRouter>

  
)
