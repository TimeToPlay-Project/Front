import React from "react";
import { useNavigate } from 'react-router-dom';
import "./css/EditorContentBox.css"
import axios from "axios";
import Swal from 'sweetalert2'

function EditorContentBox({ title, id, description, imageUrl, type, setDeleteStatus }) {
  const navigate = useNavigate();

  const handleEdit = (id) =>{
    navigate(`/editor/${type}/edit/${id}`);
  }

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "삭제 하시겠습니까?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "삭제",
        cancelButtonText: "취소"
    });

      if (result.isConfirmed) {
        console.log(process.env.REACT_APP_API_URL);
          const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/editor/quiz/quizClass/delete/${id}`);
          if (response.status === 200) {
            Swal.fire({
                title: "삭제 되었습니다!",
                icon: "success"
            });
            setDeleteStatus(true);
          } else {
              Swal.fire({
                  title: "오류 발생",
                  text: "삭제 중 문제가 발생했습니다.",
                  icon: "error"
              });
          }
      }
      } catch (error) {
      Swal.fire({
          title: "오류 발생",
          text: "삭제 요청 중 문제가 발생했습니다.",
          icon: "error"
      });
      console.error("삭제 에러:", error);
      }
    };


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
