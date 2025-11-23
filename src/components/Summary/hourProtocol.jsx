import { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { protocolApi } from '../../service/apiService';

const PROTOCOL_COLORS = {
    // 실제 프로토콜 이름 (소문자) - 파랑/초록 계열
    'modbus': '#4FC3F7',      // 밝은 하늘색
    'tcp_session': '#66BB6A',  // 초록
    'udp': '#26C6DA',         // 청록색
    'http': '#42A5F5',        // 파랑
    'icmp': '#5C6BC0',        // 남색
    'arp': '#29B6F6',         // 밝은 파랑
    'lldp': '#26A69A',        // 청록
    'dhcp': '#66BB6A',        // 초록
    's7comm': '#80CBC4',      // 민트
    'mms': '#81C784',         // 연두
    'xgt_fen': '#4DD0E1',     // 하늘색
    'unknown': '#B0BEC5',     // 회색
    // 대문자 버전도 지원
    'Modbus': '#4FC3F7',
    'TCP': '#66BB6A',
    'UDP': '#26C6DA',
    'HTTP': '#42A5F5',
    'ICMP': '#5C6BC0',
    'ARP': '#29B6F6',
    'LLDP': '#26A69A',
    'Other': '#B0BEC5'
};

export default function ProtocolDistribution() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProtocolData = async () => {
            try {
                setLoading(true);
                const response = await protocolApi.getHourlyProtocol();
                const protocols = response.data.protocols || {};

                // 데이터를 차트 형식으로 변환
                const data = Object.entries(protocols).map(([name, value]) => ({
                    value,
                    name,
                    itemStyle: { color: PROTOCOL_COLORS[name] || PROTOCOL_COLORS['Other'] }
                }));

                setChartData(data);
            } catch (error) {
                console.error('프로토콜 데이터 조회 실패:', error);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProtocolData();

        // 1분마다 갱신
        const intervalId = setInterval(fetchProtocolData, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const pieOptions = {
        animation: false,
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)',
        },
        legend: {
            orient: 'horizontal',
            bottom: 25,
            data: chartData.map(d => d.name),
            itemWidth: 14,
            itemHeight: 14,
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '35%'],
                data: chartData,
                label: {
                    show: false,
                },
                labelLine: {
                    show: false,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
            },
        ],
    };

    if (loading) {
        return (
            <DashboardBlock title="시간별 프로토콜 분포" sx={{ height: '100%', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            </DashboardBlock>
        );
    }

    if (chartData.length === 0) {
        return (
            <DashboardBlock title="시간별 프로토콜 분포" sx={{ height: '100%', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                        데이터가 없습니다
                    </Typography>
                </Box>
            </DashboardBlock>
        );
    }

    return (
        <DashboardBlock title="시간별 프로토콜 분포" sx={{ height: '100%', flex: 1 }}>
            <ReactECharts
                option={pieOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
            />
        </DashboardBlock>
    );
}