import React from "react";
import { useRoutes } from "react-router-dom";
import TournamentMain from "../Tournament/TournamentMain";



const TournamentRoute = () => {
  let element = useRoutes([
    
    {
      path: "/",
      element: <TournamentMain />,
    },
    
  ]);

  return element;
};


export default TournamentRoute;
