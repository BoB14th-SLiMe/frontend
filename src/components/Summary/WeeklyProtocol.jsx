import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';
import { CircularProgress, Box } from '@mui/material';
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


export default function WeeklyProtocol() {
    const [chartData, setChartData] = useState({ dates: [], series: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeeklyProtocol = async () => {
            try {
                setLoading(true);
                const response = await protocolApi.getWeeklyProtocol();
                const dailyData = response.data.dailyData || [];

                // 날짜와 프로토콜 데이터 추출
                const dates = dailyData.map(d => d.date);
                const protocols = new Set();

                // 모든 프로토콜 수집
                dailyData.forEach(day => {
                    Object.keys(day.protocols || {}).forEach(protocol => protocols.add(protocol));
                });

                // 프로토콜별 데이터 구성 (백분율로 변환)
                const series = {};
                protocols.forEach(protocol => {
                    series[protocol] = dailyData.map(day => {
                        const protocolCount = day.protocols[protocol] || 0;
                        const total = day.total || 1;
                        return ((protocolCount / total) * 100).toFixed(2);
                    });
                });

                setChartData({ dates, series });
            } catch (error) {
                console.error('주간 프로토콜 데이터 조회 실패:', error);
                setChartData({ dates: [], series: {} });
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyProtocol();

        // 5분마다 갱신
        const intervalId = setInterval(fetchWeeklyProtocol, 300000);

        return () => clearInterval(intervalId);
    }, []);

    const trendOptions = {
        animation: false,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                let res = params[0].name + '<br/>';
                for (let i = 0; i < params.length; i++) {
                    const value = typeof params[i].value === 'number' ? params[i].value.toFixed(2) : params[i].value;
                    res += params[i].marker + params[i].seriesName + ': ' + value + '%<br/>';
                }
                return res;
            }
        },
        legend: {
            data: Object.keys(chartData.series),
            orient: 'horizontal',
            bottom: 20,
            itemWidth: 14,
            itemHeight: 14,
        },
        xAxis: {
            type: 'category',
            data: chartData.dates,
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: {
                formatter: '{value} %'
            }
        },
        grid: {
            top: '2.5%',
            left: '3%',
            right: '15%',
            bottom: '22%',
            containLabel: true
        },
        series: Object.entries(chartData.series).map(([protocol, data]) => ({
            name: protocol,
            type: 'bar',
            stack: 'total',
            data: data,
            itemStyle: { color: PROTOCOL_COLORS[protocol] || PROTOCOL_COLORS['Other'] },
            label: { show: false }
        }))
    };

    if (loading) {
        return (
            <DashboardBlock title="주간 프로토콜 현황" sx={{ height: '100%', flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            </DashboardBlock>
        );
    }

    return (
        <DashboardBlock title="주간 프로토콜 현황" sx={{ height: '100%', flex: 1 }}>
            <ReactECharts
                option={trendOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
            />
        </DashboardBlock>
    );
}