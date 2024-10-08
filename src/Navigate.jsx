import React, { useEffect, useState } from "react";
import "./css/Navigate.css";
import { useNavigate, useLocation } from 'react-router-dom';

function Navigate() {
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

    const handleMenuClick = (menu, path) => {
        setSelectedMenu(menu);
        navigate(path);
    };

    return (
        <div>
            <div className="Top-navigate">
                <div style={{ marginLeft: "80px" }}> 
                    <img 
                        onClick={handleClickToMain}
                        src={`${process.env.PUBLIC_URL}/Logo.PNG`} 
                        alt="Logo" 
                        style={{ width: '200px', height: 'auto' }} 
                    />
                </div>
                <div className="menu-Box">
                    <div 
                        className={`menus ${selectedMenu === 'quiz' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('quiz', '/quiz')}
                    >
                        AAAA
                    </div>
                    <div 
                        className={`menus ${selectedMenu === 'To' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('To', '/To')}
                    >
                        BBBB
                    </div>
                    <div 
                        className={`menus ${selectedMenu === 'test' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('test', '/test')}
                    >
                        CCCC
                    </div>
                    <div 
                        className={`menus ${selectedMenu === 'M' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('M', '/M')}
                    >
                        DDDD
                    </div>
                </div>
                <div className="login-Box" onClick={handleClickToLogin}>
                    <div className="login">로그인</div>
                </div>  
                <div className="start-Box">
                    <div className="start">시작하기</div>
                </div>  
            </div>
        </div>
    );
}

export default Navigate;
