import React from 'react';
import { Stack, Button } from '@mui/material';

/**
 * 편집/완료 버튼 토글 (공용)
 * @param {boolean} isEditing - 현재 편집 중인지 여부
 * @param {function} onEdit - 편집 버튼 클릭 핸들러
 * @param {function} onComplete - 완료 버튼 클릭 핸들러
 */
export default function EditCompleteButtons({ isEditing, onEdit, onComplete }) {
  return (
    <Stack direction="row" spacing={1}>
      {isEditing ? (
        <Button 
          variant="contained" 
          onClick={onComplete} 
          size="small" 
          disableElevation
          sx={{ 
            backgroundColor: '#424242', 
            '&:hover': { backgroundColor: '#616161' } 
          }}
        >
          완료
        </Button>
      ) : (
        <Button 
          variant="contained" 
          onClick={onEdit} 
          size="small" 
          disableElevation
          sx={{ 
            backgroundColor: '#212121', 
            '&:hover': { backgroundColor: '#424242' } 
          }}
        >
          편집
        </Button>
      )}
    </Stack>
  );
}