import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/QuizEditPage.css";
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom';

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
    }, [id]);

    const generateRandomString = () => Math.random().toString(36).substring(2, 10);


    const handleImageUpload = (file, type, index = null, id) => {
        
        const newUrl = URL.createObjectURL(file);
        const randomFileName = generateRandomString();

        const updatedFile = new File([file], randomFileName + file.name.slice(file.name.lastIndexOf('.')), {
          type: file.type,
        });
        const updatedFileToQuizClass = new File([file], 'QuizClass' + file.name.slice(file.name.lastIndexOf('.')), {
            type: file.type,
        });


        if (type === "quizClass") {
            handleFieldChange(type, "imageUrl", newUrl);
            setQuizClassFile(updatedFileToQuizClass);
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
                    <div key={quiz.id} className="tournament-image-edit-box">
                        <div className="tournament-thumbnail-box">
                            <label
                                htmlFor={`tournament-image-input-${index}`}
                                className="tournament-image-label"
                                style={{
                                    backgroundImage: quiz.imageUrl 
                                        ? `url(${quiz.imageUrl.startsWith('blob') 
                                            ? quiz.imageUrl
                                            : `${process.env.REACT_APP_API_URL}/${quiz.imageUrl}`})` 
                                        : `url('/image.png')`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            >
                            </label>
                            <input
                                id={`tournament-image-input-${index}`}
                                className="tournament-file-input"
                                accept=".png, .jpeg, .jpg"
                                type="file"
                                onChange={(e) => {
                                    if (e.target.files[0]) {
                                        handleImageUpload(e.target.files[0], "quizzes", index, quiz.id);
                                    }
                                }}
                            />
                        </div>
                        <div className="tournament-text-input-box">
                            <span>정답</span>
                            <div>
                                <input
                                    className="tournament-text-input"
                                    type="text"
                                    value={quiz.answer || ''} 
                                    onChange={(e) => handleFieldChange('quizzes', 'answer', e.target.value, index)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="edit-button-box">
                <button type="button" onClick={() => handleEditSubmit()}>제출</button>
            </div>
        </div>
    );
}

export default QuizEditPage;
