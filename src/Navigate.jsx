import React, { useEffect, useState } from "react";
import "./css/Navigate.css";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2'

function Navigate() {
    const navigate = useNavigate();
    const location = useLocation();  
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [user, setUser] = useState(null);


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

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/check-login`, { withCredentials: true });
                if (response.data.isLoggedIn) {
                    setIsLoggedIn(true);
                    setUser(response.data.user); 
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('로그인 상태 확인 중 오류 발생', error);
            }
        };

        console.log(isLoggedIn);
        checkLoginStatus(); 
    }, []);

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

    const handleClickToLogout = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/logout`);
            if (response.status === 200) {
                Swal.fire({
                    title: "로그아웃 되었습니다.",
                    icon: "success"
                });
                // 로그아웃 후 세션 삭제 및 쿠키 삭제
        
                navigate('/main');
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생', error);
        }
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
                {isLoggedIn ? (

                <div className="login-Box" onClick={handleClickToLogout}>
                    <div className="login">로그아웃</div>
                </div> 
                ) : (
                <>
                <div className="login-Box" onClick={handleClickToLogin}>
                    <div className="login">로그인</div>
                </div>  
                <div className="start-Box" onClick={handleClickToAdmin}>
                    <div className="start">시작하기</div>
                </div>  
                </>
             )}
                
            </div>
        </div>
    );
}

export default Navigate;
