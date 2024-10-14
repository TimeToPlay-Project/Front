<<<<<<< HEAD
import React from "react";
import { useRoutes } from "react-router-dom";
import Quiz from "../Quiz/Quiz";
import QuizMain from "../Quiz/QuizMain";
import QuizStartPage from "../Quiz/QuizStartPage"
import QuizResult from "../Quiz/QuizResult"




const QuizRoutes = () => {
  let element = useRoutes([
   
    {
      path: "/",
      element: <Quiz />,
    },

    {
      path: "/start/:id",
      element: <QuizStartPage />,
    },

    {
      path: "/:id",
      element: <QuizMain />,
    },

    {
      path: "/result/:id",
      element: <QuizResult />,
    },

    
   

   
    
  ]);

  return element;
};


export default QuizRoutes;
=======
import React from "react";
import { useRoutes } from "react-router-dom";
import Quiz from "../Quiz/Quiz";
import QuizMain from "../Quiz/QuizMain";
import QuizStartPage from "../Quiz/QuizStartPage"
import QuizResult from "../Quiz/QuizResult"




const QuizRoutes = () => {
  let element = useRoutes([
   
    {
      path: "/",
      element: <Quiz />,
    },

    {
      path: "/start/:id",
      element: <QuizStartPage />,
    },

    {
      path: "/:id",
      element: <QuizMain />,
    },

    {
      path: "/result/:id",
      element: <QuizResult />,
    },

    
   

   
    
  ]);

  return element;
};


export default QuizRoutes;
>>>>>>> 1db3dfa4f2ddfde8fee81c4d870dfc338aa90978
