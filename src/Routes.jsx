import React from "react";
import { useRoutes } from "react-router-dom";
import StartPage from "./StartPage";
import MainPage from "./MainPage";
import Login from "./Login";
import Join from "./Join";
import Passwordfind from "./password-find";
import Quiz from "./Quiz/Quiz";
import QuizMain from "./Quiz/QuizMain";



const Routes = () => {
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
      path: "/quiz",
      element: <Quiz />,
    },

    {
      path: "/quiz_",
      element: <QuizMain />,
    },
   
    
  ]);

  return element;
};


export default Routes;
