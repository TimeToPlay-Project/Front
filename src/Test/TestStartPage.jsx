import React, { useEffect, useState } from "react";
import Navigate from "../Navigate";
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: rgb(247, 247, 247);
`;

const MainContainer = styled.div`
  height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: rgb(247, 247, 247);
`;

const ContentCard = styled.div`
  width: 100%;
  max-width: 1000px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(104, 71, 141, 0.1);
  overflow: hidden;
  display: flex;
  height: 70vh;
  max-height: 500px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
    max-height: none;
    margin: 20px;
  }
`;

const ImageSection = styled.div`
  width: 45%;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
    padding: 10px;
  }
`;

const TestImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const ContentSection = styled.div`
  width: 55%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    width: 100%;
    padding: 20px;
  }
`;

const TestTitle = styled.h1`
  font-size: 2.2rem;
  color: #68478D;
  margin-bottom: 20px;
  font-weight: bold;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Description = styled.p`
  margin-top: 80px;
  font-size: 1.05rem;
  line-height: 1.6;
  color: #666;
  margin-bottom: 30px;
  flex-grow: 1;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const TestButton = styled.button`
  flex: 1;
  padding: 12px 20px;
  font-size: 1rem;
  color: white;
  background: linear-gradient(45deg, #68478D, #8B6BA4);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(104, 71, 141, 0.15);
  font-weight: 500;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(104, 71, 141, 0.2);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 10px 15px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  width: 100%;
  max-width: 600px;
  min-height: 400px;
  text-align: center;
  transform: translateY(-40px);
`;

const LoadingTitle = styled.h2`
  color: #68478D;
  font-size: 2.4rem;
  margin-bottom: 20px;
  font-weight: 600;
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const LoadingDescription = styled.p`
  color: #8B6BA4;
  font-size: 1.2rem;
  line-height: 1.6;
  margin-top: 15px;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.3s forwards;
`;

const BackButton = styled.button`
  padding: 12px 25px;
  margin-top: 30px;
  background: transparent;
  border: 2px solid #68478D;
  border-radius: 8px;
  color: #68478D;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 0.9s forwards;

  &:hover {
    background: #68478D;
    color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

function TestStartPage() {
    const [testData, setTestData] = useState('');
    const [non, setNon] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const handleClickToStart = (Number) => {
        navigate(`/test/${id}`, { state: { Number } });
    };

    useEffect(() => {
        const fetchTestClass = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/testClass/${id}`);
                if (!response.ok) {
                    throw new Error('테스트 데이터를 불러오는데 실패했습니다.');
                }
                const data = await response.json();
                console.log(data);
                if(!data.descriptionDetail) {
                    setNon(true);
                }
                setTestData(data);
            } catch (error) {
                console.log(error);
            }
        };
    
        fetchTestClass();
    }, [id]);

    return (
        <PageContainer>
            <Navigate />
            <MainContainer>
                {!non ? (
                    <ContentCard>
                        <ImageSection>
                            <TestImage
                                src={`${process.env.REACT_APP_API_URL}/${testData.imageUrl}`}
                                alt="Test Cover"
                            />
                        </ImageSection>
                        <ContentSection>
                            <div>
                                <TestTitle>{testData.title}</TestTitle>
                                <Description>
                                    {testData.descriptionDetail}
                                </Description>
                            </div>
                            <ButtonContainer>
                                <TestButton onClick={() => handleClickToStart(10)}>
                                    테스트 시작하기
                                </TestButton>
                            </ButtonContainer>
                        </ContentSection>
                    </ContentCard>
                ) : (
                    <LoadingContainer>
                        <LoadingTitle>준비중입니다</LoadingTitle>
                        <LoadingDescription>
                            새로운 테스트 콘텐츠를 준비하고 있습니다.<br />
                            조금만 기다려주세요!
                        </LoadingDescription>
                        <BackButton onClick={() => navigate(-1)}>
                            뒤로가기
                        </BackButton>
                    </LoadingContainer>
                )}
            </MainContainer>
        </PageContainer>
    );
}

export default TestStartPage;
