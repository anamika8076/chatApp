import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Drawer, useDisclosure, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, HStack, useToast, Spinner } from '@chakra-ui/react';
import React, { Profiler } from 'react'
import { useState } from 'react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../config/ChatLogics';
import { Badge } from "@chakra-ui/react";


const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    const { user,setSelectedChat, chats,setChats, notifications, setNotifications } = ChatState()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const history = useHistory();
    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push("/")
    }
    const Toast = useToast();
    const handleSearch = async () => {
        if (!search) {
            Toast({
                title: "please enter something in search",
                status: "warning",
                duration: 5000, isClosable: true, position: "top-left"
            })
            return
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }
            const { data } = await axios.get(`/api/user?search=${search}`, config)
            setLoading(false);
            setSearchResult(data);
        }
        catch (error) {
            Toast({
                title: "error occured",
                description: "failed to load search results",
                status: "error",
                duration: 5000, isClosable: true, position: "bottom-left"
            })

        }

    }
    const accessChat= async (userId)=>{
        try{
            setLoadingChat(true)
            const config = {
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            }
            const {data}=await axios.post("/api/chat",{userId},config)
     // 1. Update the list without duplicates
        setChats((prevChats) => {
            const exists = prevChats.find((c) => c._id === data._id);
            if (!exists) return [data, ...prevChats];
            
            // Move existing to top
            const filtered = prevChats.filter((c) => c._id !== data._id);
            return [data, ...filtered];
        });
            Toast({
                title: "chat accessed",
                status: "success",
                duration: 5000, isClosable: true, position: "bottom-left"
            })

        }
        catch(error){
            
            Toast({
                title: "error fetching the chat",
                description: error.message,
                status: "error",
                duration: 5000, isClosable: true, position: "bottom-left"
            })

        }

    }


    return (
        <Box
            display="flex"
            alignItems="center"
            bg="white"
            w="100%"
            px={4}
            py={2}
            borderWidth="1px"
        >

            {/* LEFT */}
            <Tooltip label="search user to chat" hasArrow placement="bottom-end">
                <Button variant="ghost" onClick={onOpen}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <Text display={{ base: "none", md: "flex" }} px={4}>
                        search user
                    </Text>
                </Button>
            </Tooltip>

            {/* CENTER */}
            <Text
                fontSize="2xl"
                fontFamily="Work sans"
                position="absolute"
                left="50%"
                transform="translateX(-50%)"
            >
                Talk-A-Tive
            </Text>

            {/* RIGHT */}
            <Box ml="auto" display="flex" alignItems="center" gap={3}>
                <Menu>
                    <MenuButton p={1}>
                    <Badge
  colorScheme="red"
  borderRadius="full"
  px="2"
>
  {notifications.length}
</Badge>
                        <BellIcon fontSize="2xl" />
                    </MenuButton>
                    <MenuList pl={2}>
                        {!notifications.length && "No new messages"}
                        {notifications.map((notif) => (
                            <MenuItem key={notif._id} onClick={()=>{
                                setSelectedChat(notif.chat)
                                setNotifications(notifications.filter((n)=> n!==notif))
                            }}>
                            {notif.chat.isgroupchat
                            ? `New message in ${notif.chat.chatname}`
                            : `New message from ${getSender(user, notif.chat.users)}`}

                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>

                <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                        <Avatar
                            size="sm"
                            cursor="pointer"
                            name={user?.name}
                            src={user?.pic}
                        />
                    </MenuButton>

                    <MenuList>
                        <ProfileModel user={user}>
                            <MenuItem>My Profile</MenuItem>
                        </ProfileModel>

                        <MenuDivider />
                        <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                    </MenuList>
                </Menu>
            </Box>
            <Box>
                <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                    <DrawerOverlay />
                    <DrawerContent>
                        <DrawerHeader borderBottomWidth="1px">
                            Search Users
                        </DrawerHeader>
                        <DrawerBody>
                            <Box p={3}>
                                <HStack>
                                    <Input
                                        placeholder="Search by name or email"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <Button onClick={handleSearch}>
                                        Go
                                    </Button>
                                </HStack>
                            </Box>
                            {loading ?
                                <ChatLoading />

                                : (
                                    searchResult?.map(user => (
                                        <UserListItem
                                            key={user._id}
                                            user={user}
                                            handleFunction={() => accessChat(user._id)}
                                        />
                                    ))
                                )
                            }
                            {loadingChat && <Spinner ml="auto" display="flex" />}
                        </DrawerBody>

                    </DrawerContent>


                </Drawer>
            </Box>


        </Box>
    )
}

export default SideDrawer