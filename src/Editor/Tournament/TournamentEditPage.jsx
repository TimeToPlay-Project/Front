import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/TournamentEditPage.css";

function TournamentEditPage({ id }) {
    const [tournamentData, setTournamentData] = useState({
        tournament: { title: '', description: '', thumbnail: '', is_update: false },
        images: [],
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id !== "new") {
            fetch(`${process.env.REACT_APP_API_URL}/api/editor/tournament/${id}`)
                .then(response => response.json())
                .then(data => {
                    setTournamentData(data);
                    setImageFiles(new Array(data.images.length).fill(null));
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

    console.log("tournamentData: ", tournamentData);
    console.log("imageFiles: ", imageFiles);

    const getRandomFileName = () => Math.random().toString(36).substring(2, 10);

    const handleImageUpload = (file, type, index = null) => {
        console.log(index);
        const randomFileName = `${getRandomFileName()}${file.name.substring(file.name.lastIndexOf("."))}`;
        const renamedFile = new File([file], randomFileName, { type: file.type });
        const newUrl = URL.createObjectURL(renamedFile);
        console.log(newUrl);
        if (type === "tournament") {
            handleFieldChange(type, "thumbnail", newUrl);
            setThumbnailFile(renamedFile);
        } else if (type === "image" && index !== null) {
            handleFieldChange(type, "image_url", newUrl, index);
            setImageFiles((prev) => {
                const updatedImageFiles = [...prev];
                updatedImageFiles[index] = {id: tournamentData.images[index].id, file: renamedFile};
                return updatedImageFiles;
            });
        }
        console.log(imageFiles);
    };

    const handleFieldChange = (type, field, value, index = null) => {
        if (type === "tournament") {
            setTournamentData(prev => ({
                ...prev,
                tournament: {
                    ...prev.tournament,
                    [field]: value,
                    is_update: true,
                }
            }))
        } else if (type === "image" && index !== null) {
            setTournamentData(prev => {
                const updatedImages = [...prev.images];
                updatedImages[index] = {
                    ...updatedImages[index],
                    [field]: value,
                    is_update: true,
                };
                return { ...prev, images: updatedImages};
            });
        }
    }

    const handleEditSubmit = async() => {
        const formData = new FormData();
        const updatedTournamentData = {
            ...tournamentData,
            images: tournamentData.images.filter((image) => image.is_update === true),
        };
        formData.append('tournamentData', JSON.stringify(updatedTournamentData));
        formData.append('thumbnail', thumbnailFile);
        const imageFileMap = []

        imageFiles.forEach((fileMap) => {
            if (fileMap) {
                imageFileMap.push({id: fileMap.id, fileName: fileMap.file.name})
                formData.append(`images`, fileMap.file);
            }
        });

        formData.append('imageFileMap', JSON.stringify(imageFileMap));
        
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/editor/tournament/submit/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

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
                            backgroundImage: tournamentData?.tournament?.thumbnail 
                                ? `url(${tournamentData.tournament.thumbnail.startsWith('blob') 
                                    ? tournamentData.tournament.thumbnail 
                                    : `${process.env.REACT_APP_API_URL}/${tournamentData.tournament.thumbnail}`})` 
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
                                handleImageUpload(e.target.files[0], "tournament");
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
                            value={tournamentData?.tournament?.title || ''} 
                            onChange={(e) => handleFieldChange('tournament', 'title', e.target.value)}
                        />
                    </div>
                </div>
                <div className="tournament-text-input-box">
                    <span>설명</span>
                    <div>
                        <input
                            className="tournament-text-input"
                            type="text"
                            value={tournamentData?.tournament?.description || ''} 
                            onChange={(e) => handleFieldChange('tournament', 'description', e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="tournament-image-edit-container">
                {tournamentData.images.map((image, index) => (
                    <div key={image.id} className="tournament-image-edit-box">
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
                ))}
            </div>
            <div className="edit-button-box">
                <button type="button" onClick={() => handleEditSubmit()}>제출</button>
            </div>
        </div>
    );
}

export default TournamentEditPage;
