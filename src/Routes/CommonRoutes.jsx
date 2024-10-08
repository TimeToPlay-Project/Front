import React from "react";
import { useRoutes } from "react-router-dom";
import StartPage from "../StartPage";
import MainPage from "../MainPage";
import Login from "../Login";
import Join from "../Join";
import Passwordfind from "../password-find";
import Quiz from "../Quiz/Quiz";
import Test from "../Test/Test";




const CommonRoutes  = () => {
  let element = useRoutes([
    { path: "/", element: <StartPage /> },

    {
      path: "/main", 
      element: <MainPage />,
    },

    {
      path: "/login",
      element: <Login />,
    },

    {
      path: "/join",
      element: <Join />,
    },

    {
      path: "/pw-find",
      element: <Passwordfind />,
    },

    {
      path: "/To",
      element: <Quiz />,
    },

    {
      path: "/Test",
      element: <Test />,
    },

    {
      path: "/M",
      element: <Quiz />,
    },

    {
      path: "/quiz",
      element: <Quiz />,
    },


    

   
    
  ]);

  return element;
};


export default CommonRoutes ;
