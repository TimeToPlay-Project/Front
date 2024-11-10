import React from "react";

function QuizImageEditBox({ quiz, index, handleImageUpload, handleFieldChange}) {
    return (
        
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
                
    );
}

export default QuizImageEditBox;
