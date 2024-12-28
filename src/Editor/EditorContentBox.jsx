import React from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from "sweetalert2";
import "./css/EditorContentBox.css"

function EditorContentBox({ title, id, description, imageUrl, type }) {
  const navigate = useNavigate();

  const handleEdit = (id) =>{
    navigate(`/editor/${type}/edit/${id}`);
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'info',
      title: '해당 콘텐츠를 삭제하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    });
    
    if (result.isConfirmed) {
      const response = await deleteContent(type, id);
      console.log(response);
      Swal.fire({
        icon: response.status === 200 ? 'success' : 'error',
        title: response.data
      });
    }
  };

  const deleteContent = async (type, id) => {
    switch (type) {
      case "quiz":
        break;

      case "test":
        break;

      case "tournament":
        const url = `${process.env.REACT_APP_API_URL}/api/editor/tournament/delete/${id}`;
        try {
          const response = await axios.get(url);
          return response;
        } catch (error) {
          console.error("error in deleteTournament: ", error);
          return {data: '잘못된 요청입니다.', status: 500};
        }
        

      default:
        return {data: '잘못된 요청입니다.', status: 500};
    }
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
          <button className="Editor-Delete" onClick={() => handleDelete(id)}>Delete</button>
        </div>
      </div> 
      <div className="Content-title">{title}</div> 
    </div>
  );
}

export default EditorContentBox;
