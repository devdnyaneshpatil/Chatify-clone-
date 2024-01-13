import React, { useEffect } from 'react'
import axios from 'axios'

export default function Chatpage() {
   
    const fetchChat=async ()=>{
         const {data} = await axios.get('https://jsonplaceholder.typicode.com/todos/1')
         console.log(data);
    }
   useEffect(()=>{
      fetchChat();
   },[])


  return (
    <div>Chatpage</div>
  )
}
