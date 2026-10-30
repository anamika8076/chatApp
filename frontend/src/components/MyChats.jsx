import React, { useEffect } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Avatar, Box, Button, Stack, useToast ,Text, Badge, HStack, VStack} from '@chakra-ui/react'
import axios from 'axios'
import { AddIcon } from '@chakra-ui/icons'
import ChatLoading from './ChatLoading'
import { getSender } from './config/ChatLogics'
import GroupChatModal from './miscellaneous/GroupChatModal'



const MyChats = ({fetchAgain}) => {
  const {user,selectedChat,chats,setSelectedChat,setChats,notifications}=ChatState()
  const toast=useToast();
  const liveUnreadCountFor = (chat) => {
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
  const unreadCountFor = (chat) => {
    const storedUnreadCount = Number(
      chat.unreadCounts?.[user._id] ?? chat.unreadCounts?.get?.(user._id) ?? 0
    );
    return Math.max(storedUnreadCount, liveUnreadCountFor(chat));
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
    if (!user?.token) return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") fetchChats();
    };
    const refreshTimer = window.setInterval(refreshWhenVisible, 15000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  },[fetchAgain,user?.token])
  return (
    <Box
    className="chat-list-panel"
    display={{base:selectedChat? "none":"flex",md:"flex"}}
    flexDir="column"
    
    p={3}
    bg="white"
    w={{base:"100%",md:"31%"}}
    borderRadius="lg"
    borderWidth="1px"
    >
    <Box 
    className="chat-list-title"
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
        colorScheme="purple"
        display="flex"
        fontSize={{base:"13px",md:"12px",lg:"14px"}}
        
        rightIcon={<AddIcon/>}
        >
          new group chat
        </Button>
        </GroupChatModal>

    </Box>
    <Box className="chat-list-inner" display="flex"
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
          className={`chat-row${selectedChat?._id===chat._id ? " chat-row-selected" : ""}`}
          onClick={()=>setSelectedChat(chat)}
          cursor="pointer"
          bg="transparent"
          color="inherit"
          px={3}
          py={2}
          borderRadius="lg"
          key={chat._id}
          >
          <HStack justify="space-between">
          <HStack minW={0} spacing={3}>
          <Avatar
            size="sm"
            name={!chat.isgroupchat ? getSender(user, chat.users) : chat.chatname}
            src={!chat.isgroupchat ? chat.users.find((member) => member._id !== user._id)?.pic : undefined}
            bg="purple.100"
            color="purple.700"
          />
          <VStack align="start" spacing={0} minW={0}>
          <Text>
          {!chat.isgroupchat?(
            getSender(user,chat.users)
          ):
            chat.chatname}
          </Text>
          {chat.latestMessage?.content && (
            <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="220px">
              {chat.latestMessage.content}
            </Text>
          )}
          </VStack>
          </HStack>
          {unreadCount > 0 && (
            <Badge colorScheme="green" borderRadius="full" minW="22px" textAlign="center" aria-label={`${unreadCount} unread messages`}>
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
