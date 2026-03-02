import { FormControl, FormLabel, Input, InputGroup, VStack, InputRightElement, Button } from '@chakra-ui/react'
import React from 'react'
import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const SignUp = () => {
    const [show, setShow] = useState(false);
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [pic, setPic] = useState();
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const history=useHistory();

    const handleClick = () => setShow(!show);

    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: "please selct an image",
                status: "warning",
                duration: 5000, isClosable: true, position: "bottom"
            })
            return;
        }
        console.log(pics);
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "dtqjpu2b1");
            fetch("https://api.cloudinary.com/v1_1/dtqjpu2b1/image/upload",{
                method: "post",
                body: data,
            })
            .then((res) => res.json())
            .then((data) => {
                setPic(data.url.toString());
                console.log(data.url);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            })


        }else{
            toast({
                title: "please selct an image",
                status: "warning",
                duration: 5000, isClosable: true, position: "bottom"
            }) 
            setLoading(false);
            return;
        }
    }

    const submitHandler = async () => {
        setLoading(true);
        if (!name ||!email||!password||!confirmPassword){
            toast({
                title: "please fill all the fields",
                status: "warning",
                duration: 5000, isClosable: true, position: "bottom"
            })
            setLoading(false);
            return;
        }
        if (password !== confirmPassword){
            toast({
                title: "password do not match",
                status: "warning",
                duration: 5000, isClosable: true, position: "bottom"
            })
             
            return;
        

        }

        try {
            const config={
                headers:{
                    "content-type":"application/json",
                },
            }
            const {data}=await axios.post("/api/user",{name,email,password,pic},config)
            toast({
            title: "registration successful",
            status: "success",
            duration: 5000, isClosable: true, position: "bottom"
        })
         localStorage.setItem("userInfo",JSON.stringify(data))
        setLoading(false);
        history.push("/chats")

        }
        
       
        catch(error){
            toast({
                title: "error occured",
                description:error.response.data.message,
                status: "error",
                duration: 5000, isClosable: true, position: "bottom"
            })
             setLoading(false);
             

        }
    }
        

        return (
            <VStack spacing={"5px"}  >
                <FormControl id="first-name" isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                        placeholder="Enter Your Name"
                        onChange={(e) => setName(e.target.value)}
                    />

                </FormControl>

                <FormControl id="email" isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                        placeholder="Enter Your email"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                </FormControl>

                <FormControl id="passsword" isRequired>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : 'password'}
                            placeholder="Enter Your password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <InputRightElement width={"4.5rem"}>
                            <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
                                {show ? "Hide" : "Show"}
                            </Button>
                        </InputRightElement>

                    </InputGroup>

                </FormControl>
                <FormControl id="passsword" isRequired>
                    <FormLabel> confirm Password</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : 'password'}
                            placeholder="confirm password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <InputRightElement width={"4.5rem"}>
                            <Button h={"1.75rem"} size={"sm"} onClick={handleClick}>
                                {show ? "Hide" : "Show"}
                            </Button>
                        </InputRightElement>

                    </InputGroup>

                </FormControl>

                <FormControl id="pic" isRequired>
                    <FormLabel>upload your picture</FormLabel>
                    <Input
                        type="file"
                        p={1.5}
                        accept="image/*"
                        onChange={(e) => postDetails(e.target.files[0])}
                    />

                </FormControl>
                <Button colorScheme={"blue"} width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>
                    Sign Up
                </Button>

            </VStack>
        )
    
}
export default SignUp