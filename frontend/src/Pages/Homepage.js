import React from 'react'
import {Container,Box,Text,Tabs,TabList,Tab,TabPanels,TabPanel} from '@chakra-ui/react'
import Login from '../Components/Authentication/Login'
import SignUp from '../Components/Authentication/SignUp'

export default function Homepage() {
  return (
    <Container maxW='xl' centerContent>
       <Box
       d='flex'
       justifyContent='center'
       p={3}
       bg={"white"}
       w='100%'
       m='40px 0 15px 0'
       borderRadius='lg'
       borderWidth='1px'
       textAlign='center'
       >
         <Text fontSize='4xl'fontFamily='Work sans' color='black'>
            Talk-A-Tive
         </Text>
       </Box>
       <Box 
       bg='white' 
       w='100%' 
       p={4}
       borderRadius='lg'
       borderWidth='1px'
       color='black' >
           <Tabs variant='soft-rounded' >
  <TabList mb='1em'>
    <Tab width='50%'>Login</Tab>
    <Tab width='50%'>SignUp</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>
      {<Login></Login>}
    </TabPanel>
    <TabPanel>
      {<SignUp></SignUp>}
    </TabPanel>
  </TabPanels>
</Tabs>
       </Box>
    </Container>
  )
}
