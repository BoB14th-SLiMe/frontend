import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function AssetManagementSettings() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAsset, setCurrentAsset] = useState({
    assetId: '',
    assetType: 'plc',
    name: '',
    ipAddress: '',
    macAddress: '',
    isVisible: true,
  });

  // 초기 데이터 로드
  useEffect(() => {
    loadAssets();
  }, []);

  // 필터링
  useEffect(() => {
    let result = assets;

    // 타입 필터
    if (typeFilter !== 'all') {
      result = result.filter(asset => asset.assetType === typeFilter);
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(asset => 
        asset.assetId?.toLowerCase().includes(query) ||
        asset.name?.toLowerCase().includes(query) ||
        asset.ipAddress?.toLowerCase().includes(query)
      );
    }

    setFilteredAssets(result);
  }, [assets, typeFilter, searchQuery]);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/assets`);
      setAssets(response.data);
      console.log('✅ 자산 목록 로드:', response.data);
    } catch (err) {
      console.error('❌ 자산 목록 로드 실패:', err);
      setError('자산 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentAsset({
      assetId: '',
      assetType: 'plc',
      name: '',
      ipAddress: '',
      macAddress: '',
      isVisible: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (asset) => {
    setEditMode(true);
    setCurrentAsset(asset);
    setDialogOpen(true);
  };

  const handleDelete = async (assetId) => {
    if (!confirm(`${assetId} 자산을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/assets/${assetId}`);
      setSuccess(true);
      loadAssets();
      setTimeout(() => setSuccess(false), 3000);
      console.log('✅ 자산 삭제 완료:', assetId);
    } catch (err) {
      console.error('❌ 자산 삭제 실패:', err);
      setError('자산 삭제에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      if (editMode) {
        // 수정
        await axios.put(`${API_BASE_URL}/assets/${currentAsset.assetId}`, currentAsset);
        console.log('✅ 자산 수정 완료');
      } else {
        // 생성
        await axios.post(`${API_BASE_URL}/assets`, currentAsset);
        console.log('✅ 자산 생성 완료');
      }

      setSuccess(true);
      setDialogOpen(false);
      loadAssets();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ 자산 저장 실패:', err);
      setError('자산 저장에 실패했습니다.');
    }
  };

  return (
    <Paper
      sx={{
        height: '100%',
        padding: 2.5,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">자산 관리 설정</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          자산 추가
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          작업이 성공적으로 완료되었습니다.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 검색 및 필터 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="자산 ID, 이름, IP 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">전체 타입</MenuItem>
          <MenuItem value="scada">SCADA</MenuItem>
          <MenuItem value="switch">Switch</MenuItem>
          <MenuItem value="plc">PLC</MenuItem>
          <MenuItem value="hmi">HMI</MenuItem>
        </Select>
      </Box>

      {/* 테이블 */}
      <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>자산 ID</TableCell>
                <TableCell>타입</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>IP 주소</TableCell>
                <TableCell>MAC 주소</TableCell>
                <TableCell>상태</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.id} hover>
                    <TableCell>{asset.assetId}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                        {asset.assetType}
                      </Typography>
                    </TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.ipAddress}</TableCell>
                    <TableCell>{asset.macAddress}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: 
                            asset.status === 'critical' ? '#ffebee' :
                            asset.status === 'warning' ? '#fff3e0' :
                            '#e8f5e9',
                          color:
                            asset.status === 'critical' ? '#c62828' :
                            asset.status === 'warning' ? '#ef6c00' :
                            '#2e7d32',
                          display: 'inline-block',
                          fontSize: '0.75rem',
                        }}
                      >
                        {asset.status || 'normal'}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleEdit(asset)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(asset.assetId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* 자산 추가/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? '자산 수정' : '자산 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="자산 ID"
              value={currentAsset.assetId}
              onChange={(e) => setCurrentAsset({ ...currentAsset, assetId: e.target.value })}
              disabled={editMode}
              fullWidth
              size="small"
            />
            <Select
              value={currentAsset.assetType}
              onChange={(e) => setCurrentAsset({ ...currentAsset, assetType: e.target.value })}
              fullWidth
              size="small"
            >
              <MenuItem value="scada">SCADA</MenuItem>
              <MenuItem value="switch">Switch</MenuItem>
              <MenuItem value="plc">PLC</MenuItem>
              <MenuItem value="hmi">HMI</MenuItem>
            </Select>
            <TextField
              label="이름"
              value={currentAsset.name}
              onChange={(e) => setCurrentAsset({ ...currentAsset, name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="IP 주소"
              value={currentAsset.ipAddress}
              onChange={(e) => setCurrentAsset({ ...currentAsset, ipAddress: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="MAC 주소"
              value={currentAsset.macAddress}
              onChange={(e) => setCurrentAsset({ ...currentAsset, macAddress: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button onClick={handleSave} variant="contained">
            {editMode ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}