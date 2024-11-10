import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/QuizEditPage.css";
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom';
import QuizImageEditBox from "./QuizImageEditBox";

function QuizEditPage({ id }) {

    const navigate = useNavigate();
    const [quizData, setQuizData] = useState({
        quizClass: { title: '', description: '', imageUrl: '', is_update: false, is_fileUpload: false },
        quizzes: [],
    });
    const [quizClassFile, setQuizClassFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [quizzesIdInfo, setQuizzesIdInfo] = useState([]);
    const [deleteStauts, setDeleteStatus] = useState(false);



    useEffect(() => {
        if (id !== "new") {
            fetch(`${process.env.REACT_APP_API_URL}/api/editor/quiz/${id}`)
                .then(response => response.json())
                .then(data => {
                  setQuizData({
                    quizClass: {
                        ...data.quizClass,
                        is_update: data.quizClass.is_update || false,
                        is_fileUpload: data.quizClass.is_fileUpload || false,
                    },
                    quizzes: data.quizzes.map(quiz => ({
                      ...quiz,
                      is_update: quiz.is_update || false,
                      is_fileUpload: quiz.is_fileUpload || false,
                      
                    }))
                    
                });

                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching tournamentEditData:', error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
        setDeleteStatus(false);
    }, [id,deleteStauts]);

    const generateRandomString = () => Math.random().toString(36).substring(2, 10);


    const handleImageUpload = (file, type, index = null, id) => {
        
        const newUrl = URL.createObjectURL(file);
        const randomFileName = generateRandomString();

        const updatedFile = new File([file], randomFileName + file.name.slice(file.name.lastIndexOf('.')), {
          type: file.type,
        });
 


        if (type === "quizClass") {
            handleFieldChange(type, "imageUrl", newUrl);
            setQuizClassFile(updatedFile);
            setQuizData(prev => ({
              ...prev,
              quizClass: {
                  ...prev.quizClass,
                  is_fileUpload: true,
                  
              }
          }))
        } else if (type === "quizzes" && index !== null) {
            handleFieldChange(type, "imageUrl", newUrl, index);
            setImageFiles((prev) => {
                const updatedImageFiles = [...prev];
                updatedImageFiles[index] = {updatedFile, id};
                return updatedImageFiles;
            });
            setQuizData(prev => {
              const updatedImages = [...prev.quizzes];
              updatedImages[index] = {
                  ...updatedImages[index],
                  is_fileUpload: true,
                  
              };
              return { ...prev, quizzes: updatedImages};
          });
            
           
        }
    };


    const handleDelete = async (quizId) => {
        
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
                const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/editor/quiz/delete/${id}/${quizId}`);

                console.log("response.data : ",response.data);
                console.log("response.status  :", response.status);

                
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
    
    

    const handleFieldChange = (type, field, value, index = null) => {
        if (type === "quizClass") {
            setQuizData(prev => ({
                ...prev,
                quizClass: {
                    ...prev.quizClass,
                    [field]: value,
                    is_update: true,
                    
                }
            }))
        } else if (type === "quizzes" && index !== null) {
            setQuizData(prev => {
                const updatedImages = [...prev.quizzes];
                updatedImages[index] = {
                    ...updatedImages[index],
                    [field]: value,
                    is_update: true,
                    
                };
                return { ...prev, quizzes: updatedImages};
            });
        }
    }

    const handleAddImage = () => {
        const newImage = {
            id: 'new',
            answer: '',
            quizClassId: quizData.quizClass.id,
            is_update: false
        };
        setQuizData(prev => {
            const updatedImages = [...prev.quizzes, newImage];
            return { ...prev, quizzes: updatedImages};
        });
        setImageFiles(prev => {
            const updatedImageFiles = [...prev, null];
            return updatedImageFiles;
        })
    }


    const handleAddContent = async() =>{

        // if(quizData.quizzes.length != imageFiles.length){
        //     Swal.fire({
        //         title: "데이터를 모두 입력해주세요",
        //         icon: "error"
        //     });
        // }
        // if(quizData.quizClass.length != quizClassFile.length){
        //     Swal.fire({
        //         title: "데이터를 모두 입력해주세요",
        //         icon: "error"
        //     });
        // }

    const formData = new FormData();
      formData.append('quizData', JSON.stringify(quizData));  
      formData.append('quizClass', quizClassFile);
  
      const newQuizzesIdInfo = [];  

    imageFiles.forEach((fileObj) => {
        if (fileObj) {
            const fileData = {
                fileName: fileObj.updatedFile.name,
                id: fileObj.id
            };
            newQuizzesIdInfo.push(fileData);  
           
            
            formData.append('quizzes', fileObj.updatedFile);
        }



    });
        

    try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/editor/quiz/create`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          if(response.status === 200){
            setImageFiles([]);
            setQuizClassFile([]);
            Swal.fire({
                icon: "success",
                title: "생성 되었습니다.",
            }).then((result) => {
                if (result.isConfirmed) {
                 
                    navigate("/editor/quiz");
                }
            });
          }
      } catch (error) {
          console.error(error);
      }
  };

    const handleEditSubmit = async() => {

      
      const updatedQuizClass = quizData.quizClass.is_update ? quizData.quizClass : null;

      const updatedQuizzes = quizData.quizzes.filter(quiz => quiz.is_update === true);

      let newResQuizData = {
          quizClass: updatedQuizClass,
          quizzes: updatedQuizzes,
     };


      const formData = new FormData();
      formData.append('quizData', JSON.stringify(newResQuizData));  
      formData.append('quizClass', quizClassFile);
  
      const newQuizzesIdInfo = [];  

    imageFiles.forEach((fileObj) => {
        if (fileObj) {
            const fileData = {
                fileName: fileObj.updatedFile.name,
                id: fileObj.id
            };
            newQuizzesIdInfo.push(fileData);  
           
            
            formData.append('quizzes', fileObj.updatedFile);
        }
    });

    setQuizzesIdInfo((prev) => [...prev, ...newQuizzesIdInfo]);  
    formData.append('quizzesIdInfo', JSON.stringify(newQuizzesIdInfo));
  
      try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/editor/quiz/submit/${id}`, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          console.log("%%%%%%% : ",response);
          if(response.data === 'success'){
            setImageFiles([]);
            setQuizClassFile([]);
            newResQuizData={};
            Swal.fire({
                icon: "success",
                title: "변경 되었습니다.",
            }).then((result) => {
                if (result.isConfirmed) {
                 
                    navigate("/editor/quiz");
                }
            });
          }
      } catch (error) {
          console.error(error);
      }
  };

    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return (
        <div className="tournament-edit-container">
            <div className="tournament-edit-box">
                <span>썸네일</span>
                <div className="tournament-thumbnail-box">
                    <label
                        htmlFor="tournament-thumbnail-input"
                        className="tournament-thumbnail-label"
                        style={{
                            backgroundImage: quizData?.quizClass?.imageUrl 
                                ? `url(${quizData.quizClass.imageUrl.startsWith('blob') 
                                    ? quizData.quizClass.imageUrl 
                                    : `${process.env.REACT_APP_API_URL}/${quizData.quizClass.imageUrl}`})` 
                                : `url('/image.png')`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                    </label>
                    <input
                        id="tournament-thumbnail-input"
                        className="tournament-file-input"
                        accept=".png, .jpeg, .jpg"
                        type="file"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                handleImageUpload(e.target.files[0], "quizClass");
                            }
                        }}
                    />
                </div>
            
                <div className="tournament-text-input-box">
                    <span>제목</span>
                    <div>
                        <input
                            className="tournament-text-input"
                            type="text"
                            value={quizData?.quizClass?.title || ''} 
                            onChange={(e) => handleFieldChange('quizClass', 'title', e.target.value)}
                        />
                    </div>
                </div>
                <div className="tournament-text-input-box">
                    <span>설명</span>
                    <div>
                        <input
                            className="tournament-text-input"
                            type="text"
                            value={quizData?.quizClass?.description || ''} 
                            onChange={(e) => handleFieldChange('quizClass', 'description', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="tournament-image-edit-container">
                {quizData.quizzes.map((quiz, index) => (
                    <QuizImageEditBox 
                        quiz={quiz} 
                        index={index}
                        handleImageUpload={handleImageUpload}
                        handleFieldChange={handleFieldChange}
                        handleDelete = {handleDelete}
                    />
                ))}
                <div 
                    className="tournament-image-add-box"
                    onClick={() => handleAddImage()}
                >
                    <div className="tournament-image-add-icon-box">
                        <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path clip-rule="evenodd" fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="edit-button-box">
                {id === 'new'? 
                <button type="button" onClick={() => handleAddContent()}>생성</button>
                : <button type="button" onClick={() => handleEditSubmit()}>수정</button>
                }   
            </div>
        </div>
    );
}

export default QuizEditPage;
