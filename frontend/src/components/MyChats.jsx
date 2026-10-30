import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, Button, Stack, useToast ,Text, Badge, HStack} from '@chakra-ui/react'
import axios from 'axios'
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import { getSender } from './config/ChatLogics'
import GroupChatModal from './miscellaneous/GroupChatModal'



const MyChats = ({fetchAgain}) => {
  const {user,selectedChat,chats,setSelectedChat,setChats,notifications}=ChatState()
  const toast=useToast();
  const unreadCountFor = (chat) => {
    const memberIds = chat.users.map((member) => String(member._id || member)).sort().join(":");
    return notifications.filter((notification) => {
      const notificationChat = notification.chat;
      const sameChat = String(notificationChat?._id || notificationChat) === String(chat._id);
      if (sameChat) return true;
      if (chat.isgroupchat || notificationChat?.isgroupchat) return false;
      const notificationMemberIds = notificationChat?.users
        ?.map((member) => String(member._id || member))
        .sort()
        .join(":");
      return Boolean(notificationMemberIds && notificationMemberIds === memberIds);
    }).length;
  };
  const fetchChats=async()=>{
    if (!user?.token) return;
    try{
      const config={
        headers:{
          Authorization:`Bearer ${user.token}`,
        },
      }
    
      const {data}=await axios.get("/api/chat",config)
      const seen = new Set();
      const uniqueChats = data.filter((chat) => {
        if (chat.isgroupchat) return true;
        const pair = chat.users.map((member) => member._id).sort().join(":");
        if (seen.has(pair)) return false;
        seen.add(pair);
        return true;
      });
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
    fetchChats();
  },[fetchAgain,user?.token])
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
        {chats.map((chat)=>{
          const unreadCount = unreadCountFor(chat);
          return (
          <Box 
          onClick={()=>setSelectedChat(chat)}
          cursor="pointer"
          bg={selectedChat?._id===chat._id? "#38B2AC":"#E8E8E8"}
          color={selectedChat?._id===chat._id? "white":"black"}
          px={3}
          py={2}
          borderRadius="lg"
          key={chat._id}
          >
          <HStack justify="space-between">
          <Text>
          {!chat.isgroupchat?(
            getSender(user,chat.users)
          ):
            chat.chatname}
          </Text>
          {unreadCount > 0 && (
            <Badge colorScheme="red" borderRadius="full" minW="22px" textAlign="center" aria-label={`${unreadCount} unread messages`}>
              {unreadCount}
            </Badge>
          )}
          </HStack>


          </Box>
          );
        })}

        </Stack>
      ):(<ChatLoading/>)}


    </Box>

    </Box>
  )
}

export default MyChats
