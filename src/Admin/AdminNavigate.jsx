import React, { useState } from "react";
import "./css/AdminNavigate.css";

function AdminNavigate({ setActiveComponent }) {
  const [selectedMenu, setSelectedMenu] = useState('main');  

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setActiveComponent(menu);  
  };

  const getMenuStyle = (menu) => ({
    color: selectedMenu === menu ? 'black' : 'rgb(177, 177, 177)',
    backgroundColor: selectedMenu === menu ? 'rgb(224, 187, 242)' : 'transparent',
  });

  return (
    <div className="Top-navigate-Admin">
      <div className="Logo-Box-Admin">
        <img
          src={`${process.env.PUBLIC_URL}/Logo.PNG`}
          alt="Logo"
          className="Logo"
        />
      </div>
      <div className="menu-Box-Admin">
        <div
          className="menus-admin"
          style={getMenuStyle('quiz')}
          onClick={() => handleMenuClick('quiz')}
        >
          AAAA
        </div>
        <div
          className="menus-admin"
          style={getMenuStyle('tournament')}
          onClick={() => handleMenuClick('tournament')}
        >
          BBBB
        </div>
        <div
          className="menus-admin"
          style={getMenuStyle('test')}
          onClick={() => handleMenuClick('test')}
        >
          CCCC
        </div>
        <div
          className="menus-admin"
          style={getMenuStyle('M')}
          onClick={() => handleMenuClick('M')}
        >
          DDDD
        </div>
      </div>
    </div>
  );
}

export default AdminNavigate;
