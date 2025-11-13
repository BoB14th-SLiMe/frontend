import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, LinearProgress, Button } from '@mui/material';

// 1. 기존 아이콘 + 이미지에 표시된 아이콘 추가
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import PriorityHighOutlinedIcon from '@mui/icons-material/PriorityHighOutlined'; // 경고 (삼각형)
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'; // 바 차트
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined'; // 와이파이
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'; // 알림 벨
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'; // 체크

import { useBannerConfig } from '../../hooks/BannerConfigContext';

// 공통 카드 높이
const CARD_HEIGHT = 170;

// ===============================
// 1️⃣ ModernGaugeBox (⭐️ 원래 코드로 복원)
// ===============================
const ModernGaugeBox = ({ score }) => {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const arcRatio = 210 / 360;
  const totalArc = circumference * arcRatio;
  const startRotation = 165;
  
  // ⭐️ 2. 점수에 따른 진행률 (0~totalArc)
  const progressArc = (score / 100) * totalArc;

  // ⭐️ 2. 점수 기반 색상 및 상태 텍스트 계산
  let gaugeColor = '#4CAF50'; // 1. ~30% (Green)
  let statusText = '안전';
  if (score > 80) { // 3. 81~100% (Red)
    gaugeColor = '#F44336';
    statusText = '위험';
  } else if (score > 30) { // 2. 31~80% (Blue)
    gaugeColor = '#2196F3';
    statusText = '경고';
  }

  return (
    <Box
      sx={{
        flex: 2, // 유연하게 너비 조절
        minWidth: 0, // 무한히 작아질 수 있도록 설정
        height: CARD_HEIGHT,
        p: 1.5,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 140,
          height: 140,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* 회색 배경 아크 */}
        <svg
          width="100%"
          height="100%"
          viewBox="-5 -5 110 110"
          style={{ transform: `rotate(${startRotation}deg)` }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${totalArc} ${circumference - totalArc}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
        </svg>

        {/* ⭐️ 컬러 아크 (왼쪽부터 채워지도록 로직 수정) */}
        <svg
          width="100%"
          height="100%"
          viewBox="-5 -5 110 110"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `rotate(${startRotation}deg)`,
          }}
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={gaugeColor} // ⭐️ 2. 점수 기반 단색 적용
            strokeWidth={strokeWidth}
            // ⭐️ 2. (progressArc)만큼 그리고, (circumference - progressArc)만큼 쉰다
            strokeDasharray={`${progressArc} ${circumference - progressArc}`}
            strokeDashoffset="0" // ⭐️ 2. 처음부터 그리기 시작
            strokeLinecap="round"
            style={{
              transition: 'stroke-dasharray 0.6s ease-in-out',
            }}
          />
        </svg>

        {/* 중앙 텍스트 + 버튼 */}
        <Box
          sx={{
            position: 'absolute',
            textAlign: 'center',
            top: '35%',
            left: 0,
            right: 0,
          }}
        >
          <Typography sx={{ fontSize: 24, fontWeight: 700, color: '#212121' }}>
            {score} / 100
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#757575', mt: 0.3 }}>
            위협 점수
          </Typography>

          <Button
            variant="contained"
            disableElevation
            sx={{
              mt: 0.8,
              backgroundColor: gaugeColor,
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 10,
              textTransform: 'none',
              minWidth: 70,
              height: 26,
              '&:hover': { backgroundColor: gaugeColor },
            }}
          >
            {statusText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// ===============================
// 2️⃣ StatCard (⭐️ 이미지 스타일: 하단 태그형 레이블)
// ===============================
const StatCard = ({ icon: Icon, number, title, color }) => (
  <Box
    sx={{
      flex: 2, // 유연하게 너비 조절
      minWidth: 120, // 최소 너비
      height: CARD_HEIGHT,
      borderRadius: 2,
      backgroundColor: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // 상단(아이콘+숫자) / 하단(태그) 분리
      alignItems: 'center', // 가운데 정렬
    }}
  >
    {/* 상단: 아이콘 + 숫자 */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4, 
        mt: 3, // 상단 여백
      }}
    >
      <Icon sx={{ fontSize: 60, color: color || '#212121' }} />
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{
          color: '#212121',
          fontSize: 40, // ⭐️ 3. 숫자 크기를 34에서 40으로 늘렸습니다.
        }}
      >
        {number}
      </Typography>
    </Box>

    {/* 하단: 태그형 레이블 */}
    <Box
      sx={{
        backgroundColor: '#f0f0f0',
        color: '#555',
        fontSize: '1.1rem', //16px
        fontWeight: 500,
        borderRadius: 1.5,
        px: 1.5,
        py: 0.5,
        textTransform: 'none',
      }}
    >
      {title}
    </Box>
  </Box>
);


// ===============================
// 3️⃣ ResourceUsageCard (⭐️ 1개 카드로 통합)
// ===============================
const ResourceUsageCard = ({ items }) => {
  // 값에 따른 색상 결정: 0-50(파랑), 51-80(초록), 81+(빨강)
  const getColor = (value) => {
    if (value > 80) return '#F44336'; // 빨강
    if (value > 50) return '#4CAF50'; // 초록
    return '#2196F3'; // 파랑 (0-50)
  };

  return (
    <Box
      sx={{
        flex: '3', // 유연하게 너비 조절
        minWidth: 200, // 최소 너비
        height: CARD_HEIGHT,
        borderRadius: 2,
        backgroundColor: 'white',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around', // 행간 자동 간격
      }}
    >
      {items.map((item) => (
        <Box
          key={item.title}
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: 1.5,
          }}
        >
          {/* 1. 제목 */}
          <Typography
            variant="body1"
            color="text.secondary"
            fontWeight="bold"
            sx={{ fontSize: '0.8rem', flexBasis: '30%', minWidth: '60px' }}
          >
            {item.title}
          </Typography>

          {/* 2. 프로그레스 바 */}
          <LinearProgress
            variant="determinate"
            value={item.value}
            sx={{
              flex: 1, // 남은 공간 모두 차지
              height: 15,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getColor(item.value), // value 기반 색상
              },
            }}
          />
          
          {/* 3. 퍼센트 텍스트 */}
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight="bold"
            sx={{
              fontSize: '0.9rem',
              flexBasis: '15%',
              minWidth: '35px',
              textAlign: 'right', 
            }}
          >
            {item.value}%
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// ===============================
// 4️⃣ 전체 컴포넌트 (⭐️ 렌더링 로직 수정)
// ===============================
export default function StatBoxes() {
  const { getEnabledItems } = useBannerConfig();
  const allItems = getEnabledItems();
  const [blinking, setBlinking] = useState(false);

  // 긴급 위협이 있는지 확인
  const hasCriticalThreat = allItems.some(item => {
    if (item.type === 'gauge' && item.config.score > 80) return true;
    if (item.type === 'stat' && item.config.title === '긴급 알람' && item.config.number > 0) return true;
    return false;
  });

  // 0.5초 간격으로 깜빡임
  useEffect(() => {
    if (hasCriticalThreat) {
      const interval = setInterval(() => {
        setBlinking(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setBlinking(false);
    }
  }, [hasCriticalThreat]);

  // 아이콘 매핑 (이미지 아이콘 추가)
  const iconMap = {
    SearchIcon,
    CalendarTodayIcon,
    PublicIcon,
    LockOpenIcon,
    AlarmOnIcon,
    AccessTimeIcon,
    LinkIcon,
    PriorityHighOutlinedIcon, // '이상탐지 Day' 용
    BarChartOutlinedIcon, // '이상탐지 Week' 용
    WifiOutlinedIcon, // '새롭게 탐지된 IP' 용
    NotificationsNoneOutlinedIcon, // '평균 지연 시간', '긴급 알람' 용
    CheckCircleOutlineOutlinedIcon, // '미확인 알람' 용
  };

  // 1. 타입별로 아이템 분리
  const gaugeItem = allItems.find((item) => item.type === 'gauge');
  const statItems = allItems.filter((item) => item.type === 'stat');
  
  // 2. Usage 아이템은 config 객체만 추출하여 '배열'로 만듦
  const usageItems = allItems
    .filter((item) => item.type === 'usage')
    .map((item) => item.config);

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        width: '100%',
        flexWrap: 'nowrap', // 한 줄에 모두 표시
        overflowX: 'auto', // 항목이 많아지면 스크롤
        height: CARD_HEIGHT + 10, // 스크롤바 공간 포함
        py: '5px', // 스크롤바 가려지지 않게
        border: hasCriticalThreat && blinking ? '9px solid #E60032' : '9px solid transparent',
        borderRadius: 2,
        transition: 'border-color 0.1s ease-in-out',
      }}
    >
      {/* 1. 위협 점수 카드 (ModernGaugeBox) 렌더링 */}
      {gaugeItem && (
        <ModernGaugeBox key={gaugeItem.id} score={gaugeItem.config.score} />
      )}

      {/* 2. 통계 카드 (StatCard) 렌더링 */}
      {statItems.map((item) => {
        const IconComponent = iconMap[item.config.icon] || SearchIcon; // 기본 아이콘
        return (
          <StatCard
            key={item.id}
            icon={IconComponent}
            number={item.config.number}
            title={item.config.title}
            color={item.config.color}
          />
        );
      })}

      {/* 3. 리소스 사용량 카드 (ResourceUsageCard) 렌더링 (단 1개) */}
      {usageItems.length > 0 && (
        <ResourceUsageCard items={usageItems} />
      )}
    </Stack>
  );
}