import React from 'react';
import DashboardBlock from '../DashboardBlock'; 
import ReactECharts from 'echarts-for-react';

const pieOptions = {
    tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)', 
    },
    legend: {
        orient: 'horizontal',
        bottom: 25, 
        data: ['Modbus', 'TCP', 'UDP', 'LLDP'],
        itemWidth: 14, 
        itemHeight: 14,
    },
    series: [
        {
            type: 'pie',
            radius: '65%', 
            center: ['50%', '40%'], 
            data: [
                { value: 750, name: 'Modbus', itemStyle: { color: '#A0E7E5' } },
                { value: 80, name: 'TCP', itemStyle: { color: '#F08080' } },
                { value: 40, name: 'UDP', itemStyle: { color: '#F7DC6F' } },
                { value: 130, name: 'LLDP', itemStyle: { color: '#F5CBA7' } },
            ],
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


export default function ProtocolDistribution() {
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