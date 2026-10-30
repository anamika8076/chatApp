import React from 'react'
import { useState } from 'react';

import { ChatState } from '../Context/ChatProvider';
import { Box } from '@chakra-ui/react';

import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
    const {user}=ChatState()
    const [fetchAgain,setFetchAgain]=useState(false);
    
    return <div className="chat-page">
    {user &&  <SideDrawer/>}
    <Box
    className="chat-workspace"
    display="flex"
    justifyContent="space-between"
    w="100%"
    p="10px"
    >
    {user &&  <MyChats fetchAgain={fetchAgain} />}
    {user &&  <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}

    </Box>
    

    </div>
}

export default ChatPage
