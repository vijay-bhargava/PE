import React from 'react'
import { useDispatch, useSelector } from "react-redux";
const AboutUs = () => {
const state = useSelector((state) => state);
console.log("State---", state);
  return (
    <div>
         {state.todo.data && state.todo.data.map((e) => <li>{e.title}</li>)}
         sdfsdf
    </div>
  )
}

export default AboutUs