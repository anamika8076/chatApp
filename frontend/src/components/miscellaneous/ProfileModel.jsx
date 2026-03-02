import { ViewIcon } from '@chakra-ui/icons'
import { Icon, IconButton, useDisclosure } from '@chakra-ui/react'
import React from 'react'
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,Image,Text } from '@chakra-ui/react'




const ProfileModel = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton d={{ base: "flex " }} icon={<ViewIcon />} onClick={onOpen} />
            )}
            <Modal size="lg" isCentered isOpen={isOpen} onClose={onClose} >
                <ModalOverlay />
                <ModalContent h="400px">
                    <ModalHeader
                        textAlign="center" fontSize="40px" fontFamily="Work sans"
                    >
                        {user.name}

                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        direction="column"
              align="center"
              justify="center"
              gap={4}
                    >
                        <Image
                            borderRadius="full"
                            boxSize="150px"
                            src={user.pic}
                            alt={user.name}

                        />
                        <Text fontSize={{ base: "28px", md: "30px" }} fontFamily="Work sans">
                            Email:{user.email}
                        </Text>


                    </ModalBody>

                    <ModalFooter justifyContent="center"> 
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ProfileModel