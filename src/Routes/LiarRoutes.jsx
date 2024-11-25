import React from "react";
import { useRoutes } from "react-router-dom";
import LiarMain from "../Together/Liar/LiarMain";
import GameRoom from "../Together/Liar/components/GameRoom";
import LiarGame from "../Together/Liar/components/LiarGame";



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
    {
      path: "/game/*",
      element: <LiarGame/>,
    },
   
    
  ]);

  return element;
};


export default LiarRoutes;
