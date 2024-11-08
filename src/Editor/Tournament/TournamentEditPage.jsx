import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/TournamentEditPage.css";
import TournamentImageEditBox from "./TournamentImageEditBox";

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

    const getUniqueId = () => Math.random().toString(36).substring(2, 10);

    const handleImageUpload = (file, type, index = null) => {
        console.log(index);
        const randomFileName = `${getUniqueId()}${file.name.substring(file.name.lastIndexOf("."))}`;
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
        const url = id !== "new" ? `${process.env.REACT_APP_API_URL}/api/editor/tournament/update/${id}` 
                        : `${process.env.REACT_APP_API_URL}/api/editor/tournament/create`;

        console.log(`submit url: ${url}`);
        const formData = new FormData();
        const updatedTournamentData = {
            ...tournamentData,
            images: tournamentData.images.filter((image) => image.is_update === true),
        };
        formData.append('tournamentData', JSON.stringify(updatedTournamentData));
        formData.append('thumbnail', thumbnailFile);
        const imageFileMap = {}

        imageFiles.forEach((fileMap) => {
            if (fileMap) {
                imageFileMap[fileMap.id]= fileMap.file.name;
                formData.append(`images`, fileMap.file);
            }
        });

        formData.append('imageFileMap', JSON.stringify(imageFileMap));
        
        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    const handleAddImage = () => {
        const newImage = {
            id: getUniqueId(),
            image_name: '',
            image_url: `url('/image.png')`,
            win_count: 0,
            tournament_id: tournamentData.tournament.id,
            is_update: false
        };
        setTournamentData(prev => {
            const updatedImages = [...prev.images, newImage];
            return { ...prev, images: updatedImages};
        });
        setImageFiles(prev => {
            const updatedImageFiles = [...prev, null];
            return updatedImageFiles;
        })
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
                        accept=".png, .jpeg, .jpg, .webp"
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
                    <TournamentImageEditBox 
                        image={image} 
                        index={index}
                        handleImageUpload={handleImageUpload}
                        handleFieldChange={handleFieldChange}
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
                <button type="button" onClick={() => handleEditSubmit()}>제출</button>
            </div>
        </div>
    );
}

export default TournamentEditPage;
