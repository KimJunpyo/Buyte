import styled from 'styled-components';
import { BsFillGearFill } from 'react-icons/bs';
import  { useState, useEffect } from 'react';
import axiosInstance from '../../api/apis';
import MypageOrderTab from './MypageOrderTab';
import MypageOrderList from './MypageOrderList';
import EditableNickname from './EditableNickname';


//페이지네이션(5개 이상의 리스트가 들어올 시 다음 페이지로)
//엥 근데 이거 Auth로 받은 이름은 어떻게 처리함? 
 interface Product {
    cartId: number;
    productId: number;
    productName: string;
    productImagePath: string;
    productPrice: number;
    productCount: number;
  }
  
  interface OrderData {
    orderId: number;
    orderProducts: Product[];
    totalPrice: number;
    orderTimestamp: string;
    deliveryStatus: string;
  }
  
  interface PageInfo {
    page: number;
    size: number;
    totalElement: number;
    totalPage: number;
  }
  
  interface Data {
    orderdata: OrderData[];
    pageInfo: PageInfo;
  }

function Mypage() {
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const fetchData = async () => {  
    try {
      const url = `/members`;
      const response = await axiosInstance.get(url);      
      const data = response.data;    
      setNickname(data.memberName)
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  };
useEffect(() => {
    fetchData();
  }, []);

  const handleNicknameChange = async (newNickname: string) => {
    const formData = {
      memberName: newNickname
    }
    if (newNickname.trim() !== '') {
      try {
        const response = await axiosInstance.patch('/members', formData);
        setNickname(response.data.memberName);
        console.log("patch성공!")
      } catch (error) {
        console.error('Error updating nickname:', error);
      }
    }
  };

  const data: Data = {
    orderdata: [
      {
        orderId: 1,
        orderProducts: [
          {
            cartId: 1,
            productId: 1,
            productName: "맛집도넛",
            productImagePath: "~",
            productPrice: 3333,
            productCount: 1,
          },
          {
            cartId: 2,
            productId: 2,
            productName: "도너츠링",
            productImagePath: "~",
            productPrice: 2222,
            productCount: 1,
          },
        ],
        totalPrice: 5555,
        orderTimestamp: "2022.08.03",
        deliveryStatus: "배송완료",
      },
      {
        orderId: 2,
        orderProducts: [
          {
            cartId: 3,
            productId: 3,
            productName: "맛난빵",
            productImagePath: "~",
            productPrice: 100,
            productCount: 1,
          },
          {
            cartId: 4,
            productId: 4,
            productName: "딜리샤스",
            productImagePath: "~",
            productPrice: 300,
            productCount: 2,
          },
          {
            cartId: 5,
            productId: 5,
            productName: "슈크링",
            productImagePath: "~",
            productPrice: 500,
            productCount: 3,
          },
        ],
        totalPrice: 9999,
        orderTimestamp: "2022.08.05",
        deliveryStatus: "배송중",
      },
    ],
    pageInfo: {
      page: 1,
      size: 20,
      totalElement: 2,
      totalPage: 1,
    },
  };
  return <div style={{ marginTop: '160px', display: 'flex', justifyContent:'center' }}>
    <MyPageWrapper>
      <WelcomeText>안녕하세요, <span style={{color: 'var(--purple)'}}>{nickname}</span>님!</WelcomeText>
      <section style={{borderTop:"2px solid var(--light-purple)", margin:"20px", padding:"30px"}}>
        <MyInfoSection>
          <img src="../../../src/assets/images/profile.png" style={{width: '200px', paddingRight:'10px'}}/>
          <MyInfoDetail>
         {editMode ? (
          <EditableNickname
            nickname={nickname}
            onNicknameChange={handleNicknameChange}
            onEditModeToggle={() => setEditMode(!editMode)}
          />
        ) : (
          <>
            <h3>{nickname}</h3>
            <span
              style={{ fontSize: '14px', color: 'var(--purple)', cursor: 'pointer'}}
              onClick={() => setEditMode(!editMode)}
            >
              회원 정보 수정
            </span>
          </>
        )}
            </MyInfoDetail>
        </MyInfoSection>
      </section>
      <MyOrderSection>
        <h2>나의 주문</h2>
       <MyOrderLists>
       <MypageOrderTab />
        {data.orderdata.length===0 ?
        <>
          <BsFillGearFill style={{fontSize:'30px', color: 'var(--dark-gray)', margin: '15px'}}/>
          <p style={{color: 'var(--dark-gray)', fontWeight:'800'}}>주문내역이 없습니다.</p>
          </>
        :(
          data.orderdata.map((order) => (
            <MypageOrderList key={order.orderId} products={order} />
          ))
        )}
      </MyOrderLists>
      </MyOrderSection>
    </MyPageWrapper>
  </div>;
}
export default Mypage;

const MyPageWrapper = styled.section`
  width: 70%;
  margin-bottom: 80px;
`
const WelcomeText = styled.p`
   font-weight:800;
   color: var(--dark-gray);
   text-align:center; 
   margin-bottom:30px; 
   font-size:18px;
`
const MyInfoSection = styled.section`
  width: 100%;
  display: flex;
  padding: 1rem; 
`
const MyInfoDetail = styled.section`
  margin-left: 2rem;
  margin-top: 3.3rem;
  min-width: 300px;
  h3 {
    color: var(--light-gray);
    margin-bottom: 2.3rem;
    font-size: 18px;
    font-weight: 800;
  }
  @media (max-width: 780px) {
    margin-left: 0.5rem;
}
`
const MyOrderSection= styled.section`
  padding: 3rem 1rem;
  border: 1px solid var(--light-purple);
  border-radius: 10px;
  h2 {
  font-weight:800;
  font-size:18px; 
  color:var(--light-gray);
  margin-bottom:10px; 
  margin-left: 20px
  }
`
const MyOrderLists= styled.section`
padding: 1rem;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
div{
  width: 100%;
}
`