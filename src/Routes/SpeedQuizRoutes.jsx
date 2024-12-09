import React from "react";
import { useRoutes } from "react-router-dom";
import SpeedQuizMain from "../Together/Speed/SpeedQuizMain";
import SpeedGameRoom from "../Together/Speed/components/SpeedGameRoom";
import SpeedGame from "../Together/Speed/components/SpeedGame";




const SpeedQuizRoutes = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <SpeedQuizMain/>,
    },

    {
      path: "/room/*",
      element: <SpeedGameRoom/>,
    },
    {
      path: "/game/*",
      element: <SpeedGame/>,
    },
   
    
  ]);

  return element;
};


export default SpeedQuizRoutes;
