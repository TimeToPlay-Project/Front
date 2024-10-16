import React from "react";
import { useRoutes } from "react-router-dom";
import AdminMain from "../Admin/AdminMain";



const AdminRoutes = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <AdminMain/>,
    },
   
    
  ]);

  return element;
};


export default AdminRoutes;
