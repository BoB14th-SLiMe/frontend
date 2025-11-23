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

export default function WeeklyProtocol() {
    const [chartData, setChartData] = useState({
        dates: [],
        Modbus: [],
        TCP: [],
        UDP: [],
        LLDP: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWeeklyData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/protocols/weekly`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();

                // Transform API data to chart format
                const dates = [];
                const protocols = {
                    Modbus: [],
                    TCP: [],
                    UDP: [],
                    LLDP: [],
                };

                (result.data || []).forEach(day => {
                    // Format date (YYYY-MM-DD -> M/D)
                    const dateStr = day.date || '';
                    const dateParts = dateStr.split('-');
                    const formattedDate = dateParts.length === 3
                        ? `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`
                        : dateStr;
                    dates.push(formattedDate);

                    // Calculate percentages
                    const total = day.total || 1; // Avoid division by zero
                    const dayProtocols = day.protocols || {};

                    protocols.Modbus.push(((dayProtocols.Modbus || 0) / total * 100).toFixed(2));
                    protocols.TCP.push(((dayProtocols.TCP || 0) / total * 100).toFixed(2));
                    protocols.UDP.push(((dayProtocols.UDP || 0) / total * 100).toFixed(2));
                    protocols.LLDP.push(((dayProtocols.LLDP || 0) / total * 100).toFixed(2));
                });

                setChartData({
                    dates,
                    ...protocols,
                });
                setLoading(false);
            } catch (error) {
                console.error('❌ 주간 프로토콜 데이터 로드 실패:', error);
                // Use fallback data on error
                setChartData({
                    dates: ['11/17', '11/18', '11/19', '11/20', '11/21', '11/22', '11/23'],
                    Modbus: [73.73, 72.81, 72.94, 70.97, 71.17, 72.28, 70.91],
                    TCP: [17.51, 19.35, 18.35, 19.35, 19.95, 18.3, 19.55],
                    UDP: [5.99, 4.61, 6.42, 6.91, 6.35, 6.59, 6.82],
                    LLDP: [2.76, 3.23, 2.29, 2.76, 2.54, 2.84, 2.73],
                });
                setLoading(false);
            }
        };

        fetchWeeklyData();

        // Refresh every 60 seconds
        const interval = setInterval(fetchWeeklyData, 60000);
        return () => clearInterval(interval);
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
                    const value = typeof params[i].value === 'number'
                        ? params[i].value.toFixed(2)
                        : params[i].value;
                    res += params[i].marker + params[i].seriesName + ': ' + value + '%<br/>';
                }
                return res;
            }
        },
        legend: {
            data: ['Modbus', 'TCP', 'UDP', 'LLDP'],
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
        series: [
            {
                name: 'LLDP',
                type: 'bar',
                stack: 'total',
                data: chartData.LLDP,
                itemStyle: { color: PROTOCOL_COLORS.LLDP }
            },
            {
                name: 'UDP',
                type: 'bar',
                stack: 'total',
                data: chartData.UDP,
                itemStyle: { color: PROTOCOL_COLORS.UDP }
            },
            {
                name: 'TCP',
                type: 'bar',
                stack: 'total',
                data: chartData.TCP,
                itemStyle: { color: PROTOCOL_COLORS.TCP }
            },
            {
                name: 'Modbus',
                type: 'bar',
                stack: 'total',
                data: chartData.Modbus,
                itemStyle: { color: PROTOCOL_COLORS.Modbus },
                label: { show: false }
            }
        ]
    };

    return (
        <DashboardBlock title="주간 프로토콜 현황" sx={{ height: '100%', flex: 1 }}>
            <ReactECharts
                option={trendOptions}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
                showLoading={loading}
            />
        </DashboardBlock>
    );
}