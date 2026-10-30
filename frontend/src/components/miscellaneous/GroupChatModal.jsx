import React from 'react'
import { Box, FormControl, Input, useDisclosure } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { ChatState } from '../../Context/ChatProvider'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'

  

const GroupChatModal = ({children}) => {
      const { isOpen, onOpen, onClose } = useDisclosure()
      const [groupChatName,setGroupChatName]=useState();
      const [selectedUsers,setSelectedUsers]=useState([]);
      const [search,setSearch]=useState("");
      const [searchResult,setSearchResult]=useState([]);
      const [loading,setLoading]=useState(false);
      const [creating,setCreating]=useState(false);
      const toast=useToast();
      const {user,chats,setChats}=ChatState ()
      useEffect(()=>{
        const query=search.trim();
        if(!isOpen || !query){
          setSearchResult([]);
          setLoading(false);
          return undefined;
        }

        let cancelled=false;
        setLoading(true);
        const timer=setTimeout(async()=>{
          try{
            const config={headers:{Authorization:`Bearer ${user.token}`}};
            const {data}=await axios.get(`/api/user?search=${encodeURIComponent(query)}`,config);
            if(!cancelled) setSearchResult(data);
          }catch{
            if(!cancelled){
              setSearchResult([]);
              toast({
                title:"Couldn't search users",
                description:"Please check your connection and try again.",
                status:"error",
                duration:4000,
                isClosable:true,
                position:"bottom-left",
              });
            }
          }finally{
            if(!cancelled) setLoading(false);
          }
        },250);
        return ()=>{
          cancelled=true;
          clearTimeout(timer);
        };
      },[search,isOpen,user?.token,toast]);
      
      const handleGroup=(userToAdd)=>{
        if (selectedUsers.some((selected)=>selected._id===userToAdd._id)){
          toast({
            title: "user already added",
            status: "warning",
            duration: 5000, isClosable: true, position: "top"
        })
          return;
        }
        setSelectedUsers([...selectedUsers,userToAdd])
      }
      const handleDelete=(delUser)=>{
        setSelectedUsers(selectedUsers.filter((sel)=>sel._id!==delUser._id))
      }
      const handleSubmit=async()=>{
        if (!groupChatName?.trim()){
          toast({
            title: "Add a group name",
            description: "Choose a name before creating your group.",
            status: "warning",
            duration: 4000, isClosable: true, position: "top"
        })
          return;
        }
        if (selectedUsers.length < 2){
          toast({
            title: "Add one more person",
            description: "A group needs at least two people besides you. For a one-to-one chat, use Search Users.",
            status: "warning",
            duration: 5000, isClosable: true, position: "top"
          });
          return;
        }
        try{
            setCreating(true);
            const config={
            headers:{
                Authorization:`Bearer ${user.token}`,
            },
        }
        const {data}=await axios.post("/api/chat/group",{name:groupChatName.trim(),users:JSON.stringify(selectedUsers.map((u)=>u._id))},config)
        setChats((current)=>[data,...current.filter((chat)=>chat._id!==data._id)])
        onClose();
        toast({
          title: "new group chat created",
          status: "success",
          duration: 5000, isClosable: true, position: "bottom-left"
      })
        }
        catch(error){
          toast({
            title: "Couldn't create the group",
            description: error.response?.data?.message || "Please check the group details and try again.",
            status: "error",
            duration: 5000, isClosable: true, position: "bottom-left"
        })
        }finally{
          setCreating(false);
        }
    
      }
  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="35px" fontFamily="Work sans" d="flex" justifyContent="center">Create Group Chat     </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center"  >
          <FormControl>
            <Input placeholder='Group name' mb={3} value={groupChatName || ""} onChange={(e)=>setGroupChatName(e.target.value)}/>
          </FormControl>
          <FormControl>
            <Input placeholder='Add people (type a name or email)' mb={1} value={search} onChange={(e)=>setSearch(e.target.value)}/>
          </FormControl>
          <Box fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            >
          {selectedUsers.map((u)=>(
            <UserBadgeItem key={u._id} user={u} handleFunction={()=>handleDelete(u)}/>
          ))}
          </Box>

          {loading?(
            <div>Loading...</div>
          ):(
            searchResult?.slice(0,4).map((user)=><UserListItem key={user._id} user={user} handleFunction={()=>handleGroup(user)}/>)
          )
          }
          {!loading && search.trim() && !searchResult.length && (
            <Box color="gray.500" py={3}>No users found. Try another name or email.</Box>
          )}
            
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' onClick={handleSubmit} isLoading={creating} loadingText="Creating">
              Create group
            </Button>
            
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default GroupChatModal
