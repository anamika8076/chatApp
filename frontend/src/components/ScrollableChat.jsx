import React from 'react'
import ScrollableFeed from 'react-scrollable-feed'
import { ChatState } from '../Context/ChatProvider'
import { isLastMessage, isSameSender, isSameSenderMargin } from './config/ChatLogics'
import { Avatar, Tooltip } from '@chakra-ui/react'

const ScrollableChat = ({messages}) => {
    
    const {user}=ChatState()
  return (
    
   <ScrollableFeed>
   {messages 
   && messages.map((m,i) => {
    console.log("Message sender:", m.sender._id);
    console.log("Logged user:", user._id);
    return(
    
    <div className={`message-line ${m.sender._id === user._id ? "message-line-outgoing" : "message-line-incoming"}`} style={{
    display: "flex",
    justifyContent:
      m.sender._id === user._id
        ? "flex-end"
        : "flex-start",
        width: "100%",
  }}
  key={m._id}>
  
      
    {(isSameSender(messages,m,i,user._id) ||
    isLastMessage(messages,i,user._id)) && (
    <Tooltip
    label={m.sender.name}
    placement="bottom-start"
    hasArrow>
    <Avatar
        mt="7px"
        mr={1}
        size="sm"
        cursor="pointer"
        name={m.sender.name}
        src={m.sender.pic}
    />

    </Tooltip>
    )}
    <span
    className={`message-bubble ${m.sender._id === user._id ? "message-bubble-outgoing" : "message-bubble-incoming"}`}
    style={{ marginLeft:isSameSenderMargin(messages,m,i,user._id) }}>
        {m.content}
    </span>

    </div>)
   })}

   </ScrollableFeed>
   )
  
}

export default ScrollableChat
