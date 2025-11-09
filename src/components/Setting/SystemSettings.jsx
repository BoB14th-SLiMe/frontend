import React, { useState, useEffect } from 'react';
import { Typography, Select, MenuItem, Slider, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import DashboardBlock from '../DashboardBlock';
import { settingsApi } from '../../service/apiService';

const SystemSettings = () => {
  const [refreshRate, setRefreshRate] = useState(30);
  const [dataRetention, setDataRetention] = useState(30);
  const [threshold, setThreshold] = useState(80);
  const [admin, setAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // 초기 데이터 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await settingsApi.getSystemSettings();
      const data = response.data;
      
      setRefreshRate(data.autoRefreshInterval || 30);
      setDataRetention(data.dataRetentionDays || 30);
      setThreshold(data.thresholds?.cpu || 80);
      
      console.log('✅ 시스템 설정 로드 완료:', data);
    } catch (err) {
      console.error('❌ 시스템 설정 로드 실패:', err);
      setError('설정을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await settingsApi.updateSystemSettings({
        autoRefreshInterval: refreshRate,
        dataRetentionDays: dataRetention,
        thresholds: {
          cpu: threshold,
          ram: threshold,
          gpu: threshold,
        },
      });

      setSuccess(true);
      console.log('✅ 시스템 설정 저장 완료');

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ 시스템 설정 저장 실패:', err);
      setError('설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardBlock title="시스템 설정" sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </DashboardBlock>
    );
  }

  return (
    <DashboardBlock title="시스템 설정" sx={{ p: 2, height: '100%' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        시스템 동작 및 데이터 관리 설정을 구성합니다.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          설정이 성공적으로 저장되었습니다.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          columnGap: 4,
          rowGap: 2.5,
          alignItems: 'start',
          justifyItems: 'center',
          mb: 2,
        }}
      >
        {/* 화면 자동 갱신 주기 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            화면 자동 갱신 주기 (초)
          </Typography>
          <Select
            value={refreshRate}
            onChange={(e) => setRefreshRate(e.target.value)}
            size="small"
            fullWidth
            sx={{
              fontSize: '0.8rem',
              height: 28,
              '& .MuiSelect-select': { py: 0.2 },
            }}
          >
            <MenuItem value={10}>10초</MenuItem>
            <MenuItem value={30}>30초</MenuItem>
            <MenuItem value={60}>60초</MenuItem>
          </Select>
        </Box>

        {/* 데이터 보관 기간 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            데이터 보관 기간 (일)
          </Typography>
          <Select
            value={dataRetention}
            onChange={(e) => setDataRetention(e.target.value)}
            size="small"
            fullWidth
            sx={{
              fontSize: '0.8rem',
              height: 28,
              '& .MuiSelect-select': { py: 0.2 },
            }}
          >
            <MenuItem value={30}>30일</MenuItem>
            <MenuItem value={60}>60일</MenuItem>
            <MenuItem value={90}>90일</MenuItem>
          </Select>
        </Box>

        {/* 임계값 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            CPU, RAM, GPU 임계값
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Slider
              value={threshold}
              onChange={(e, val) => setThreshold(val)}
              size="small"
              sx={{
                flex: 1,
                height: 3,
                '& .MuiSlider-thumb': { width: 10, height: 10 },
              }}
            />
            <Typography sx={{ fontSize: '0.8rem' }}>{threshold}%</Typography>
          </Box>
        </Box>

        {/* 관리자 등록 */}
        <Box sx={{ width: '100%', maxWidth: 240 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
            관리자 등록
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <TextField
              value={admin}
              onChange={(e) => setAdmin(e.target.value)}
              size="small"
              sx={{
                '& .MuiInputBase-input': { py: 0.35, fontSize: '0.8rem' },
              }}
            />
            <Button
              variant="outlined"
              size="small"
              sx={{
                fontSize: '0.75rem',
                height: 26,
                minWidth: 50,
              }}
            >
              추가
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 저장 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={loadSettings}
          disabled={saving}
        >
          초기화
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} /> : '저장'}
        </Button>
      </Box>
    </DashboardBlock>
  );
};

export default SystemSettings;
