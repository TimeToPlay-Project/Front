import React from "react";
import { useRoutes } from "react-router-dom";
import Test from "../Test/Test";
import TestStartPage from "../Test/TestStartPage";
import TestMain from "../Test/TestMain";
import TestResult from "../Test/TestResult";



const TestRoute = () => {
  let element = useRoutes([
    
    {
      path: "/",
      element: <Test />,
    },

    {
      path: "/start/:id",
      element: <TestStartPage />,
    },

    {
      path: "/:id",
      element: <TestMain />,
    },

    {
      path: "/result",
      element: <TestResult />,
    },
    

   

   
    
  ]);

  return element;
};


export default TestRoute;
