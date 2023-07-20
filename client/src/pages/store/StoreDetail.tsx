import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BiArrowBack } from 'react-icons/bi';
import ProductCard from '../../components/ProductCard/ProductCard';
import axiosInstance from '../../api/apis';
import { StoreDetailInfo } from '../../assets/interface/Store.interface';
import Chat from '../Chat/Chat';
import {
  StoreProductSection,
  ProductListTitle,
  StoreDetails,
  StoreDetailSection,
  DetailInfo,
  DetailTitle,
  DetailWrapper,
} from './StoreDetail.style';
function StoreDetail() {
  const [data, setData] = useState<StoreDetailInfo | null>(null);
  const { storeId } = useParams<{ storeId: string }>();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const url = `/store/${storeId}`;
      const response = await axiosInstance.get(url);
      const data = response.data;
      setData(data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  };

  if (!data) {
    return <div>입점을 준비 중입니다!</div>;
  }
  return (
    <>
      <StoreDetailSection>
        <Chat storeId={storeId} storeName={data.storeName} />
        <Link to="/store">
          <BiArrowBack
            style={{
              fontSize: '40px',
              color: 'var(--dark-purple)',
              marginTop: '11rem',
              position: 'absolute',
              left: '11rem',
              cursor: 'pointer',
            }}
          />
        </Link>
        <StoreDetails>
          <div
            style={{
              backgroundImage: `url('${data.storeImage}')`,
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              backgroundSize: 'cover',
            }}
          ></div>
          <DetailWrapper>
            <h3
              style={{
                fontWeight: '600',
                fontSize: '18px',
                color: 'var(--bright-black)',
                marginBottom: '2rem',
              }}
            >
              {data.storeName}
            </h3>
            <DetailTitle>소개</DetailTitle>
            <DetailInfo style={{whiteSpace: "pre-wrap", lineHeight:'1.2'}}>{data.storeIntroduction}</DetailInfo>
            <DetailTitle>주소</DetailTitle>
            <Link
              to="/map"
              state={{ lat: data.storeLatitude, lng: data.storeLongitude, id: data.storeId }}
            >
              <span style={{ color: 'var(--light-gray)', fontSize: '13px' }}>[지도보기]</span>
            </Link>
            <DetailInfo>{data.storeAddress}</DetailInfo>
            <DetailTitle>전화번호</DetailTitle>
            <p style={{ color: 'var(--bright-black)', fontWeight: '500', fontSize: '13px', marginTop:'5px' }}>
              {data.storePhoneNumber}
            </p>
          </DetailWrapper>
        </StoreDetails>
      </StoreDetailSection>
      <StoreProductSection>
        <div style={{ width: '70%' }}>
          <ProductListTitle>Custom</ProductListTitle>
          <ProductCard
            data={data.customProductInfoList}
            storeId={data.storeId}
            storeName={data.storeName}
          />
          <ProductListTitle>We Made It</ProductListTitle>
          <ProductCard
            data={data.standardProductInfoList}
            storeId={data.storeId}
            storeName={data.storeName}
          />
        </div>
      </StoreProductSection>
    </>
  );
}

export default StoreDetail;
