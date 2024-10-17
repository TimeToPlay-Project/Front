
import React from "react";
import "./css/AdminContentBox.css"

function AdminContentBox({ title, description, imageUrl, id }) {



  const handleEdit= () =>{
    console.log(id);
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
          <button className="Admin-Update" onClick={handleEdit(id)} >Edit</button>
          <button className="Admin-Delete">Delete</button>
        </div>
      </div> 
      <div className="Content-title">{title}</div> 
    </div>
  );
}

export default AdminContentBox;
