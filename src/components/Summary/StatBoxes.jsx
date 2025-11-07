import React from 'react';
import { Box, Stack, Typography, LinearProgress, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import { useBannerConfig } from '../../hooks/BannerConfigContext';

// 공통 카드 높이
const CARD_HEIGHT = 170;

// ===============================
// 1️⃣ ModernGaugeBox (채우기 방향, 색상 로직 수정)
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
        flex: 1, // 유연하게 너비 조절
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
// 2️⃣ StatCard (⭐️ 레이아웃, 크기, 폰트 수정)
// ===============================
const StatCard = ({ icon: Icon, number, title, color }) => (
  <Box
    sx={{
      flex: 1, // 유연하게 너비 조절
      minWidth: 0, // 무한히 작아질 수 있도록 설정
      height: CARD_HEIGHT,
      borderRadius: 2,
      backgroundColor: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    {/* ⭐️ 3. 상단: 아이콘(좌) + 숫자(우) */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 32, // ⭐️ 3. 아이콘 크기 증가
          height: 32, // ⭐️ 3. 아이콘 크기 증가
          borderRadius: '50%',
          backgroundColor: `${color}1A`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon sx={{ fontSize: 18, color: color }} />
      </Box>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ 
          color: '#212121', 
          fontSize: 26, // ⭐️ 3. 숫자 크기 증가
          textAlign: 'right' 
        }}
      >
        {number}
      </Typography>
    </Box>

    {/* ⭐️ 3. 하단: 제목 */}
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ 
        fontSize: '0.9rem', // ⭐️ 3. 제목 크기 증가
        fontWeight: 500 
      }}
    >
      {title}
    </Typography>
  </Box>
);

// ===============================
// 3️⃣ UsageCard (⭐️ 공간 채우기)
// ===============================
const UsageCard = ({ title, value, color }) => (
  <Box
    sx={{
      flex: 1, // 유연하게 너비 조절
      minWidth: 0, // 무한히 작아질 수 있도록 설정
      height: CARD_HEIGHT,
      borderRadius: 2,
      backgroundColor: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      p: 1.5,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    }}
  >
    <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
      {title}
    </Typography>
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{
          width: '90%',
          height: 8,
          borderRadius: 5,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor:
              color === 'error'
                ? '#F44336'
                : color === 'success'
                ? '#4CAF50'
                : '#2196F3',
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ mt: 0.5 }}>
        {value}%
      </Typography>
    </Box>
    <Box /> {/* ⭐️ 레이아웃 유지를 위한 빈 박스 */}
  </Box>
);

// ===============================
// 4️⃣ 전체 컴포넌트 (⭐️ 스크롤바 숨김)
// ===============================
export default function StatBoxes() {
  const { getEnabledItems } = useBannerConfig();
  const enabledItems = getEnabledItems();

  // 아이콘 매핑
  const iconMap = {
    SearchIcon,
    CalendarTodayIcon,
    PublicIcon,
    LockOpenIcon,
    AlarmOnIcon,
    AccessTimeIcon,
    LinkIcon,
  };

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        width: '100%',
        flexWrap: 'nowrap', // 한 줄에 모두 표시
        height: CARD_HEIGHT, // 고정 높이 유지
      }}
    >
      {enabledItems.map((item) => {
        if (item.type === 'gauge') {
          return <ModernGaugeBox key={item.id} score={item.config.score} />;
        }
        
        if (item.type === 'stat') {
          const IconComponent = iconMap[item.config.icon] || SearchIcon;
          return (
            <StatCard
              key={item.id}
              icon={IconComponent}
              number={item.config.number}
              title={item.config.title}
              color={item.config.color}
            />
          );
        }
        
        if (item.type === 'usage') {
          return (
            <UsageCard
              key={item.id}
              title={item.config.title}
              value={item.config.value}
              color={item.config.color}
            />
          );
        }
        
        return null;
      })}
    </Stack>
  );
}
