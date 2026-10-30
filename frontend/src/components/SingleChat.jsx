import React from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "./config/ChatLogics";
import ProfileModel from "./miscellaneous/ProfileModel";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { useRef, useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";

import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";

const ENDPOINT = import.meta.env.VITE_BACKEND_URL?.trim() || window.location.origin;

const SingleChat = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const { user, selectedChat, setSelectedChat, setNotifications } = ChatState();
  const socketRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);
  selectedChatRef.current = selectedChat;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  }

  useEffect(() => {
    if (!user?._id) return undefined;
    const socket = io(ENDPOINT, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("setup", user);
      if (selectedChatRef.current?._id) socket.emit("join chat", selectedChatRef.current._id);
    });
    socket.on("connected", () => setSocketConnected(true));
    socket.on("group created", () => {
      setFetchAgain((current) => !current);
    });
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("message recieved", (incomingMessage) => {
      setFetchAgain((current) => !current);
      if (selectedChatRef.current?._id === incomingMessage.chat?._id) {
        setMessages((current) => current.some((message) => message._id === incomingMessage._id)
          ? current
          : [...current, incomingMessage]);
        axios.put(`/api/message/${incomingMessage.chat._id}/read`, {}, {
          headers: { Authorization: `Bearer ${user.token}` },
        }).then(() => setFetchAgain((current) => !current)).catch((error) => {
          console.error("Could not mark chat as read:", error.message);
        });
      } else {
        setNotifications((current) => current.some((message) => message._id === incomingMessage._id)
          ? current
          : [incomingMessage, ...current]);
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, setFetchAgain, setNotifications]);

  useEffect(() => {
    if (!selectedChat) return;
    setNotifications((current) => current.filter((message) => message.chat?._id !== selectedChat._id));
    fetchMesssages();
  }, [selectedChat?._id, user?._id]);

  

  const fetchMesssages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config,
      );

      setMessages(data);
      setFetchAgain((current) => !current);
      socketRef.current?.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error occured!",
        description: "failed to load the messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
        socketRef.current?.emit("stop typing",selectedChat._id)
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config,
        );
        console.log(data);
        socketRef.current?.emit("new message", data);

        setNewMessage("");
        setMessages((current) => [...current, data]);
        setFetchAgain((current) => !current);
      } catch (error) {
        toast({
          title: "error occured!",
          description: "failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };
   const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if(!socketConnected) return;

    if(!typing){
        setTyping(true)
        socketRef.current?.emit("typing",selectedChat._id)
    }
    let lastTypingTime=new Date().getTime()
    var timerLength=3000
    setTimeout(()=>{
        var timeNow=new Date().getTime()
        var timeDiff=timeNow-lastTypingTime
        if(timeDiff>=timerLength && typing){
            socketRef.current?.emit("stop typing",selectedChat._id)
            setTyping(false)
        }
    },timerLength)

  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            className="chat-header"
            fontSize={{ base: "28px", md: "30px" }}
            fontFamily="Work sans"
            pb={3}
            px={2}
            w="100%"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
            />
            {selectedChat &&
              (!selectedChat.isgroupchat ? (
                <>
                  {" "}
                  {getSender(user, selectedChat.users)}
                  <ProfileModel
                    user={getSenderFull(user, selectedChat.users)}
                  />{" "}
                </>
              ) : (
                <>
                  {selectedChat.chatname.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessages={fetchMessages}
                  />
                </>
              ))}
          </Text>
          <Box
            className="chat-conversation"
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
            {istyping ? <div>
                <Lottie
                options={defaultOptions}
                width={70}
                style={{ marginBottom: 15, marginLeft: 0 }}
                />
            </div> : <></>}
              <Input
                className="chat-composer"
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter a message..."
                onChange={typingHandler}
                value={newMessage}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
