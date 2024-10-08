<<<<<<< HEAD
import React from "react";
import "./css/ContentBox.css"

function ContentBox({ title, description, imageUrl }) {
  return (
    <div className="QuizBox">
      <div>
        <img 
          src={imageUrl} 
          alt="Quiz" 
        />
      </div>
      <div className="hover-text"><div className="Quiz-Descript">{description}</div></div> 
      <div className="Quiz-title">{title}</div> 
    </div>
  );
}

export default ContentBox;
=======
import React from "react";
import "./css/ContentBox.css"

function ContentBox({ title, description, imageUrl }) {
  return (
    <div className="QuizBox">
      <div>
        <img 
          src={imageUrl} 
          alt="Quiz" 
        />
      </div>
      <div className="hover-text"><div className="Quiz-Descript">{description}</div></div> 
      <div className="Quiz-title">{title}</div> 
    </div>
  );
}

export default ContentBox;
>>>>>>> 1db3dfa4f2ddfde8fee81c4d870dfc338aa90978
