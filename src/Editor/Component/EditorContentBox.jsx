
import React from "react";
import "./css/EditorContentBox.css"

function EditorContentBox({ title, setEditorState, imageUrl, id, setContentIndex }) {




  const handleEdit = (id) =>{
    setContentIndex(id);
    setEditorState(true);
  }


  return (
    <div className="ContentBox">
      <div>
        <img 
          src={imageUrl} 
          alt="Quiz" 
        />
      </div>
      <div className="hover-text">
        <div className="Quiz-Descript">
          <button className="Editor-Update" onClick={() => handleEdit(id)} >Edit</button>
          <button className="Editor-Delete">Delete</button>
        </div>
      </div> 
      <div className="Content-title">{title}</div> 
    </div>
  );
}

export default EditorContentBox;
