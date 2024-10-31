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

    const handleClickToAdmin = () =>{
        navigate("/editor/main");
    }

    const handleMenuClick = (menu, path) => {
        setSelectedMenu(menu);
        navigate(path);
    };

    return (
        <div>
            <div className="Top-navigate">
                <div className="Logo-Box"> 
                    <img 
                        onClick={handleClickToMain}
                        src={`${process.env.PUBLIC_URL}/Logo.PNG`} 
                        alt="Logo" 
                        className="Logo"
                        
                    />
                </div>
                <div className="menu-Box">
                    <div 
                        style={{marginLeft:'1px'}}
                        className={`menus ${selectedMenu === 'quiz' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('quiz', '/quiz')}
                    >
                        AAAA
                    </div>
                    <div 
                        className={`menus ${selectedMenu === 'To' ? 'active' : ''}`} 
                        onClick={() => handleMenuClick('tournament', '/tournament')}
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
                <div className="start-Box" onClick={handleClickToAdmin}>
                    <div className="start">시작하기</div>
                </div>  
            </div>
        </div>
    );
}

export default Navigate;
