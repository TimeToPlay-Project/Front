import React from "react";
import { useRoutes } from "react-router-dom";
import LiarMain from "../Together/Liar/LiarMain";
import GameRoom from "../Together/Liar/components/GameRoom";



const LiarRoutes = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <LiarMain/>,
    },

    {
      path: "/room/*",
      element: <GameRoom/>,
    },
   
    
  ]);

  return element;
};


export default LiarRoutes;
