import React from "react";
import { useRoutes } from "react-router-dom";
import EditorMain from "../Editor/EditorMain";
import EditPage from "../Editor/EditPage";



const EditorRoutes = () => {
  let element = useRoutes([
    {
      path: "/:type",
      element: <EditorMain/>,
    },

    {
      path: "/:type/edit/:id",
      element: <EditPage/>,
    }

    
  ]);

  return element;
};


export default EditorRoutes;
