import React from 'react';
import DashboardBlock from '../DashboardBlock'; 
import ReactECharts from 'echarts-for-react';
import { COMPONENT_COLORS, getColorByIndex } from '../../theme';

const pieOptions = {
    animation: false,
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
            center: ['50%', '35%'], 
            data: [
                { value: 750, name: 'Modbus', itemStyle: { color: getColorByIndex(COMPONENT_COLORS.protocol, 0) } },
                { value: 80, name: 'TCP', itemStyle: { color: getColorByIndex(COMPONENT_COLORS.protocol, 1) } },
                { value: 40, name: 'UDP', itemStyle: { color: getColorByIndex(COMPONENT_COLORS.protocol, 2) } },
                { value: 130, name: 'LLDP', itemStyle: { color: getColorByIndex(COMPONENT_COLORS.protocol, 3) } },
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