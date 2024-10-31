import React, { useState } from "react";
import "./css/EditorNavigate.css";
import { useNavigate } from 'react-router-dom';

function EditorNavigate({ type }) {
  const navigate = useNavigate();
  const [hoveredMenu, setHoveredMenu] = useState(null); // 추가된 상태

  const handleMenuClick = (menu) => {
    navigate(`/editor/${menu}`)
  };

  const handleClickToMain = () => {
    navigate('/main');
  };

  const getMenuStyle = (menu) => ({
    color: type === menu ? 'black' : 'rgb(177, 177, 177)',
    backgroundColor: type === menu || hoveredMenu === menu ? 'rgb(224, 187, 242)' : 'transparent',
  });

  return (
    <div className="Top-navigate-Editor">
      <div className="Logo-Box-Editor">
        <img
          onClick={handleClickToMain}
          src={`${process.env.PUBLIC_URL}/Logo.PNG`}
          alt="Logo"
          className="Logo"
        />
      </div>
      <div className="menu-Box-Editor">
        {['quiz', 'tournament', 'test', 'M'].map((menu, index) => (
          <div
            key={index}
            className="menus-Editor"
            style={getMenuStyle(menu)}
            onClick={() => handleMenuClick(menu)}
            onMouseEnter={() => setHoveredMenu(menu)} 
            onMouseLeave={() => setHoveredMenu(null)} 
          >
            {menu === 'quiz' && 'AAAA'}
            {menu === 'tournament' && 'BBBB'}
            {menu === 'test' && 'CCCC'}
            {menu === 'M' && 'DDDD'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditorNavigate;
