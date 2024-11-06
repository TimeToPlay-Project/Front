import React, { useEffect, useState } from "react";
import "./css/QuizComponent.css";
import axios from 'axios';

function QuizEditPage(id) {
  const [quizData, setQuizData] = useState([]); 
  const [contentState, setContentState] = useState(false);
  const [contentIndex, setContentIndex] = useState(0);
  const [editorState, setEditorState] = useState(false);
  const [postImg, setPostImg] = useState([]);
  const [previewImg, setPreviewImg] = useState('');
  const [quizNum, setQuizNum] = useState(10);
  const [quizScript, setQuizScript] = useState([]);
    
  function handleFileUpload(e, index) {

    console.log("!!!!!!");

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
    setEditorState(true);
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
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/editor/quiz/AA`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data);
    } catch (error) {
        console.error('Axios error', error);
    }


};


  return (
    <div className="QuizCreate-Box">
        <div className="Main-Button-Box">
          <button className="QuizCreate-Main-button" onClick={handleClickCreateNon}>Main</button>
          <button className="QuizCreate-Submit-Button" onClick={handleClickCreateNon2}>Main2</button>
        </div>

        <div className="QuizCreate-Content-Box2">
              <div className="QuizItem">
                썸네일
                <label
                  className="input-Box"
                  style={{
                    backgroundImage: postImg[0] && postImg[0].file ? `url(${URL.createObjectURL(postImg[0].file)})` : `url('/image.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <input
                    className="input-image"
                    accept=".png, .jpeg, .jpg"
                    type="file"
                    onChange={(e) => handleFileUpload(e, 0)} 
                  />

                </label>
                
          
                <div className="Answer-Box">
                  
                  주제: &nbsp;
                  <input
                    className="answer"
                    type="text"
                    value={postImg[0]?.Topic || ''} 
                    onChange={(e) => {
                        const newPostImg = [...postImg];
                        newPostImg[0] = { ...newPostImg[0], Topic: e.target.value }; 
                        setPostImg(newPostImg);
                    }}
                  />
                </div>
                <div className="Answer-Box">
                  설명: &nbsp;
                  <input
                    className="answer"
                    type="text"
                    value={postImg[0]?.Description || ''} 
                    onChange={(e) => {
                        const newPostImg = [...postImg];
                        newPostImg[0] = { ...newPostImg[0], Description: e.target.value }; 
                        setPostImg(newPostImg);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="QuizCreateStart-Box">
          <div className="QuizCreateStart" onClick={() => handleClickQuiznumMinus()}>-</div>
          <div className="QuizCreateStart" onClick={() => handleClickQuiznumPlus()}>+</div>
        </div>

        <div className="QuizCreate-Content-ToTal-Box">
          {Array.from({ length: quizNum }).map((_, boxIndex) => (
            <div className="QuizCreate-Content-Box" key={boxIndex+1}>
              <div className="QuizItem">
                <label
                  className="input-Box"
                  style={{
                    backgroundImage: postImg[boxIndex+1] && postImg[boxIndex+1].file ? `url(${URL.createObjectURL(postImg[boxIndex+1].file)})` : `url('/image.png')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <input
                    className="input-image"
                    accept=".png, .jpeg, .jpg"
                    type="file"
                    onChange={(e) => handleFileUpload(e, boxIndex+1)} 
                  />
                </label>

                <div className="Answer-Box">
                  정답 {boxIndex+1}: &nbsp;
                  <input
                    className="answer"
                    type="text"
                    value={postImg[boxIndex+1]?.answer || ''} 
                    onChange={(e) => {
                        const newPostImg = [...postImg];
                        newPostImg[boxIndex+1] = { ...newPostImg[boxIndex+1], answer: e.target.value }; 
                        setPostImg(newPostImg);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default QuizEditPage;
