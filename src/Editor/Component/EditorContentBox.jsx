import React from "react";
import { useNavigate } from 'react-router-dom';
import "./css/EditorContentBox.css"

function EditorContentBox({ title, id, description, imageUrl, type }) {
  const navigate = useNavigate();

  const handleEdit = (id) =>{
    navigate(`/editor/${type}/edit/${id}`);
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
