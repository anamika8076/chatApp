import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { useState } from 'react'
import { Box, Button, Stack, useToast ,Text} from '@chakra-ui/react'
import axios from 'axios'
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import { getSender } from './config/ChatLogics'
import GroupChatModal from './miscellaneous/GroupChatModal'



const MyChats = ({fetchAgain}) => {
  const [loggedUser,setLoggedUser]=useState()
  const {user,selectedChat,chats,setSelectedChat,setChats}=ChatState()
  const toast=useToast();
  const fetchChats=async()=>{
    try{
      const config={
        headers:{
          Authorization:`Bearer ${user.token}`,
        },
      }
    
      const {data}=await axios.get("/api/chat",config)
      // FILTER: Ensure every chat in the list has a unique ID
    const uniqueChats = data.filter((v, i, a) => 
        a.findIndex(t => (t._id === v._id)) === i
    );

    setChats(uniqueChats);
     
      
    }
    catch(error){
      toast({
        title: "error fetching chats",
        description: "failed to load the chats",
        status: "error",
        duration: 5000, isClosable: true, position: "bottom-left"
      })
    }
  }
  useEffect(()=>{
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  },[fetchAgain])
  return (
    <Box
    display={{base:selectedChat? "none":"flex",md:"flex"}}
    flexDir="column"
    
    p={3}
    bg="white"
    w={{base:"100%",md:"31%"}}
    borderRadius="lg"
    borderWidth="1px"
    >
    <Box 
    pb={3}
    px={3}
    fontSize={{base:"28px",md:"30px"}}
    fontFamily="Work sans"
    display="flex"
    w="100%"
    justifyContent="space-between"
    alignItems="center"
    
    >
        My Chats
        <GroupChatModal>
        <Button 
        
        display="flex"
        fontSize={{base:"17px",md:"10px",lg:"17px"}}
        
        rightIcon={<AddIcon/>}
        >
          new group chat
        </Button>
        </GroupChatModal>

    </Box>
    <Box display="flex"
    flexDir="column"
    p={3}
    bg="#F8F8F8"
    w="100%"
    h="100%"
    borderRadius="lg"
    overflowY="hidden"
      >
      {chats?(
        <Stack overflowY="scroll">
        {chats.map((chat)=>(
          <Box 
          onClick={()=>setSelectedChat(chat)}
          cursor="pointer"
          bg={selectedChat===chat? "#38B2AC":"#E8E8E8"}
          color={selectedChat===chat? "white":"black"}
          px={3}
          py={2}
          borderRadius="lg"
          key={chat._id}
          >
          <Text>
          {!chat.isgroupchat?(
            getSender(loggedUser,chat.users)
          ):
            chat.chatname}
          </Text>


          </Box>
        ))}

        </Stack>
      ):(<ChatLoading/>)}


    </Box>

    </Box>
  )
}

export default MyChats