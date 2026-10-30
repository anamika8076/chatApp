import { createContext, useContext ,useEffect,useState } from "react";

import { useHistory } from "react-router-dom";
const ChatContext=createContext();
const ChatProvider=({children})=>{
    const [user,setUser]=useState(()=>{
        try {
            return JSON.parse(localStorage.getItem("userInfo"));
        } catch {
            localStorage.removeItem("userInfo");
            return null;
        }
    });
    const [selectedChat,setSelectedChat]=useState();
    const [chats,setChats]=useState([]);
    const [notifications,setNotifications]=useState([]);
    const history=useHistory();
    useEffect(()=>{
        const userInfo=user;
        if(!userInfo){
            history.push("/")
            
        }

    },[history,user])


    return <ChatContext.Provider value={{ user, setUser,selectedChat,setSelectedChat,chats,setChats ,notifications,setNotifications}}>
    {children}
    </ChatContext.Provider>

}
export const ChatState=()=>{return useContext(ChatContext)}

export default ChatProvider;
