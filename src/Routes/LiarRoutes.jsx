import React from "react";
import { useRoutes } from "react-router-dom";
import LiarMain from "../Together/Liar/LiarMain";



const LiarRoutes = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <LiarMain/>,
    },
   
    
  ]);

  return element;
};


export default LiarRoutes;
