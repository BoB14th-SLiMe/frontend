import React, { useState, useEffect } from 'react';
import DashboardBlock from '../DashboardBlock';
import ReactECharts from 'echarts-for-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const PROTOCOL_COLORS = {
    Modbus: '#A0E7E5',
    TCP: '#F08080',
    UDP: '#F7DC6F',
    LLDP: '#F5CBA7',
};

export default function ProtocolDistribution() {
    const [protocolData, setProtocolData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProtocolData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/protocols/hourly`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                // Transform API data to chart format
                const chartData = Object.entries(data.protocols || {}).map(([name, value]) => ({
                    value,
                    name,
                    itemStyle: { color: PROTOCOL_COLORS[name] || '#999' }
                }));

                setProtocolData(chartData);
                setLoading(false);
            } catch (error) {
                console.error('❌ 시간별 프로토콜 데이터 로드 실패:', error);
                // Use fallback data on error
                setProtocolData([
                    { value: 750, name: 'Modbus', itemStyle: { color: PROTOCOL_COLORS.Modbus } },
                    { value: 80, name: 'TCP', itemStyle: { color: PROTOCOL_COLORS.TCP } },
                    { value: 40, name: 'UDP', itemStyle: { color: PROTOCOL_COLORS.UDP } },
                    { value: 130, name: 'LLDP', itemStyle: { color: PROTOCOL_COLORS.LLDP } },
                ]);
                setLoading(false);
            }
        };

        fetchProtocolData();

        // Refresh every 30 seconds
        const interval = setInterval(fetchProtocolData, 30000);
        return () => clearInterval(interval);
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
            data: protocolData.map(item => item.name),
            itemWidth: 14,
            itemHeight: 14,
        },
        series: [
            {
                type: 'pie',
                radius: '65%',
                center: ['50%', '35%'],
                data: protocolData,
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

    return (
        <DashboardBlock title="시간별 프로토콜 분포" sx={{ height: '100%', flex: 1 }}>
            <ReactECharts
                option={pieOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
                showLoading={loading}
            />
        </DashboardBlock>
    );
}