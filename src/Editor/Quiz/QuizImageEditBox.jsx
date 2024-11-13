import React from "react";

function QuizImageEditBox({ quiz, index, handleImageUpload, handleFieldChange, handleDelete}) {
    return (
        
                    <div key={quiz.id} className="tournament-image-edit-box">

<button
                className="edit-box-delete-button"
                // onClick={() => handleDeleteImage(index)}
                style={{
                    position: "absolute",
                    top: "-12px",
                    right: "-12px",
                    background: "rgba(255, 30, 30, 0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    cursor: "pointer",
                    fontSize: "1.5em"
                }}
            > & </button>
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
                        <div className="delete-button">
                            <img src="/X.png" style={{width: "45px", height: "auto"}}
                                onClick={()=>handleDelete(quiz.id)}
                            ></img>
                            
                            
                        </div>
                    </div>
                
    );
}

export default QuizImageEditBox;
