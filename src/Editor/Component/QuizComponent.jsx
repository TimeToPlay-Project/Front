import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./css/QuizComponent.css";
import axios from 'axios';


import EditorContentBox from "./EditorContentBox";

function QuizComponent() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]); 
  const [contentState, setContentState] = useState(false);
  const [contentIndex, setContentIndex] = useState(0);
  const [editorState, setEditorState] = useState(false);
  const [postImg, setPostImg] = useState([]);
  const [previewImg, setPreviewImg] = useState('');
  const [quizNum, setQuizNum] = useState(10);
  const [quizScript, setQuizScript] = useState([]);
    
  function handleFileUpload(e, index) {
    const fileArr = e.target.files;
    //const newPostImg = {file: fileArr[0], Topic, Description};
    setPostImg(prev =>{ 
      const updatedPostImg = [...prev];
      updatedPostImg[index] = { file: fileArr[0], answer: updatedPostImg[index]?.answer || '' }; 
      return updatedPostImg;
    });
    setQuizScript()

    if (fileArr[0]) {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        setPreviewImg(fileReader.result);
      };
      fileReader.readAsDataURL(fileArr[0]);
    } else {
      setPreviewImg('');
    }
  }

  const handleClickToQuiz = () => {
    // Quiz 클릭 처리 로직 추가
  }

  const handleClickCreate = () => {
    navigate(`/editor/quiz/edit/new`);
  }

  const handleClickCreateNon = () => {
    setEditorState(false);
  }

  const handleClickQuiznumPlus = () =>{
    setQuizNum(quizNum+1);
  }

  const handleClickQuiznumMinus = () =>{
    setQuizNum(quizNum-1);
  }

  const handleClickCreateNon2 = async () => {
    const formData = new FormData();
    postImg.forEach((item) => {
        if (item.file) {
            formData.append('postImg', item.file);
        }
    });

    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/quiz/AA`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data);
    } catch (error) {
        console.error('Axios error', error);
    }


};




  useEffect(() => {

    fetch(`${process.env.REACT_APP_API_URL}/api/quizClass/all`)
      .then(response => response.json())
      .then(data => setQuizData(data))  
      .catch(error => console.error('데이터 가져오기 실패:', error));

  }, [contentState]);



  return (
    <div className="QuizCreate-Box">
        <div className="Editor-Create-Button-Box">
          <button className="Editor-Create-Button" onClick={handleClickCreate}>Create</button>
        </div>
        
        <div className="QuizComponent-Main-Box">
          <div className="QuizComponent-Total-Box">
            {quizData.map((item, index) => (
              <div className="QuizComponent-Box" key={index} onClick={() => handleClickToQuiz(item.id)}>
                <EditorContentBox
                  title={item.title} 
                  id={index}
                  description={item.description}  
                  setEditorState={setEditorState}
                  setContentIndex={setContentIndex}
                  imageUrl={`http://localhost:4000/${item.imageUrl}`}  
                />
              </div>
            ))}
          </div>
        </div>
  </div>
  );
}

export default QuizComponent;
