import React, { useState } from "react";
import "./css/AdminNavigate.css";
import { useNavigate } from 'react-router-dom';

function AdminNavigate({ setActiveComponent }) {
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState('main');
  const [hoveredMenu, setHoveredMenu] = useState(null); // 추가된 상태

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setActiveComponent(menu);  
  };

  const handleClickToMain = () => {
    navigate('/main');
  };

  const getMenuStyle = (menu) => ({
    color: selectedMenu === menu ? 'black' : 'rgb(177, 177, 177)',
    backgroundColor: selectedMenu === menu || hoveredMenu === menu ? 'rgb(224, 187, 242)' : 'transparent',
  });

  return (
    <div className="Top-navigate-Admin">
      <div className="Logo-Box-Admin">
        <img
          onClick={handleClickToMain}
          src={`${process.env.PUBLIC_URL}/Logo.PNG`}
          alt="Logo"
          className="Logo"
        />
      </div>
      <div className="menu-Box-Admin">
        {['quiz', 'tournament', 'test', 'M'].map((menu, index) => (
          <div
            key={index}
            className="menus-admin"
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

export default AdminNavigate;
