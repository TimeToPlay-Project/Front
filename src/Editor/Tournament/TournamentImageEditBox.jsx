import React from "react";

function TournamentImageEditBox({ image, index, handleImageUpload, handleFieldChange, handleDeleteImage}) {
    return (
        <div key={image.id} className="tournament-image-edit-box">
            <button
                className="edit-box-delete-button"
                onClick={() => handleDeleteImage(image.id, index)}
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
            >
                &times;
            </button>
            <div className="tournament-thumbnail-box">
                <label
                    htmlFor={`tournament-image-input-${index}`}
                    className="tournament-image-label"
                    style={{
                        backgroundImage: image.image_url 
                            ? `url(${image.image_url.startsWith('blob') 
                                ? image.image_url
                                : `${process.env.REACT_APP_API_URL}/${image.image_url}`})` 
                            : `url('/image.png')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                </label>
                <input
                    id={`tournament-image-input-${index}`}
                    className="tournament-file-input"
                    accept=".png, .jpeg, .jpg, .webp"
                    type="file"
                    onChange={(e) => {
                        if (e.target.files[0]) {
                            handleImageUpload(e.target.files[0], "image", index);
                        }
                    }}
                />
            </div>
            <div className="tournament-text-input-box">
                <span>이름</span>
                <div>
                    <input
                        className="tournament-text-input"
                        type="text"
                        value={image.image_name || ''} 
                        onChange={(e) => handleFieldChange('image', 'image_name', e.target.value, index)}
                    />
                </div>
            </div>
        </div>
    );
}

export default TournamentImageEditBox;