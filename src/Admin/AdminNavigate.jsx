import React, { useEffect, useState } from "react";
import "./css/AdminNavigate.css";
import { useNavigate, useLocation } from 'react-router-dom';

function AdminNavigate() {
    const navigate = useNavigate();
    const location = useLocation();  
    const [selectedMenu, setSelectedMenu] = useState(null);


    useEffect(() => {
        if (location.pathname === '/quiz') {
            setSelectedMenu('quiz');
        } else if (location.pathname === '/To') {
            setSelectedMenu('To');
        } else if (location.pathname === '/test') {
            setSelectedMenu('test');
        } else if (location.pathname === '/M') {
            setSelectedMenu('M');
        }
    }, [location.pathname]);  

    const handleClickToLogin = () => {
        navigate('/login');
    };

    const handleClickToMain = () => {
        navigate('/main');
    };

    const handleClickToAdmin = () =>{
        navigate("/admin");
    }

    const handleMenuClick = (menu, path) => {
        setSelectedMenu(menu);
        navigate(path);
    };

    return (
        <div>
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
                    <div 
                        className={`menus-admin ${selectedMenu === 'quiz' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('quiz', '/quiz')}
                    >
                        AAAA
                    </div>
                    <div 
                        className={`menus-admin  ${selectedMenu === 'To' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('tournament', '/tournament')}
                    >
                        BBBB
                    </div>
                    <div 
                        className={`menus-admin  ${selectedMenu === 'test' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('test', '/test')}
                    >
                        CCCC
                    </div>
                    <div 
                        className={`menus-admin  ${selectedMenu === 'M' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('M', '/M')}
                    >
                        DDDD
                    </div>
                </div>
                
                <div className="Logout-Box" onClick={handleClickToAdmin}>
                    <div className="Logout">로그아웃</div>
                </div>  
            </div>
        </div>
    );
}

export default AdminNavigate;
