import React from "react";
import { useRoutes } from "react-router-dom";
import Tournament from "../Tournament/Tournament";
import TournamentMain from "../Tournament/TournamentMain";
import TournamentRanking from "../Tournament/TournamentRanking";
import TournamentStartPage from "../Tournament/TournamentStartPage";



const TournamentRoute = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <Tournament/>,
    },

    {
      path: "/start/:id",
      element: <TournamentStartPage/>,
    },
    
    {
      path: "/:id/:selectedCount",
      element: <TournamentMain />,
    },

    {
      path: "ranking/:id",
      element: <TournamentRanking/>,
    }
    
  ]);

  return element;
};


export default TournamentRoute;
