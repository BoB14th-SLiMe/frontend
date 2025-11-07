import React from 'react';
import DashboardBlock from '../DashboardBlock'; 
import ReactECharts from 'echarts-for-react';

// 원본 데이터 (단위: 건)
const rawData = {
    dates: ['9/10', '9/11', '9/12', '9/13', '9/14', '9/15', '9/16'],
    Modbus: [8000, 7900, 7950, 7700, 7850, 7900, 7800],
    TCP: [1900, 2100, 2000, 2100, 2200, 2000, 2150],
    UDP: [650, 500, 700, 750, 700, 720, 750],
    LLDP: [300, 350, 250, 300, 280, 310, 300],
    COLORS: {
        Modbus: '#A0E7E5', // 민트색 (옅은 하늘색)
        TCP: '#F08080',   // 산호색 (붉은색)
        UDP: '#F7DC6F',   // 노란색
        LLDP: '#F5CBA7',  // 살구색 (옅은 주황색)
    }
};

// ⭐️ 1. 원본 데이터를 비율(%)로 변환한 데이터 (Python 계산 결과 반영)
const percentData = {
    dates: rawData.dates,
    Modbus: [73.73, 72.81, 72.94, 70.97, 71.17, 72.28, 70.91],
    TCP: [17.51, 19.35, 18.35, 19.35, 19.95, 18.3, 19.55],
    UDP: [5.99, 4.61, 6.42, 6.91, 6.35, 6.59, 6.82],
    LLDP: [2.76, 3.23, 2.29, 2.76, 2.54, 2.84, 2.73],
    COLORS: rawData.COLORS
};


// ECharts 옵션 객체 정의
const trendOptions = {
    // 툴팁 설정
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        },
        // ⭐️ 2. 툴팁에 퍼센트 기호(%) 추가
        formatter: function (params) {
            let res = params[0].name + '<br/>';
            let total = 0;
            // ECharts의 누적 차트(stack) 특성상 마지막 시리즈에만 총합 표시
            // 여기서는 각 항목의 비율을 표시합니다.
            for (let i = 0; i < params.length; i++) {
                // value가 숫자인지 확인 후 .toFixed(2) 적용
                const value = typeof params[i].value === 'number' ? params[i].value.toFixed(2) : params[i].value;
                res += params[i].marker + params[i].seriesName + ': ' + value + '%<br/>';
            }
            return res;
        }
    },
    // 범례 설정 (변경 없음)
    legend: {
        data: ['Modbus', 'TCP', 'UDP', 'LLDP'],
        orient: 'horizontal',
        bottom: 25,
        itemWidth: 14, 
        itemHeight: 14,
    },
    // x축 설정 (변경 없음)
    xAxis: {
        type: 'category',
        data: percentData.dates,
        axisTick: { show: false }
    },
    // ⭐️ 3. y축을 비율(0~100)로 설정
    yAxis: {
        type: 'value',
        min: 0,
        max: 100, // ⭐️ 최대값을 100으로 설정
        // ⭐️ 4. y축 라벨에 퍼센트 기호(%) 추가
        axisLabel: {
            formatter: '{value} %'
        }
    },
    // 그래프의 여백 조정
    grid: {
        // ⭐️ 5. 상단 여백을 조정하여 제목 아래로 당기고 8000 레이블(이제 100%)을 보이게 함
        top: '5%', 
        left: '3%',
        right: '15%', 
        bottom: '20%',
        containLabel: true 
    },
    
    // ⭐️ 6. 데이터 시리즈에 비율 데이터 사용
    series: [
        {
            name: 'LLDP',
            type: 'bar',
            stack: 'total', 
            data: percentData.LLDP, // ⭐️ 비율 데이터 사용
            itemStyle: { color: percentData.COLORS.LLDP }
        },
        {
            name: 'UDP',
            type: 'bar',
            stack: 'total',
            data: percentData.UDP, // ⭐️ 비율 데이터 사용
            itemStyle: { color: percentData.COLORS.UDP }
        },
        {
            name: 'TCP',
            type: 'bar',
            stack: 'total',
            data: percentData.TCP, // ⭐️ 비율 데이터 사용
            itemStyle: { color: percentData.COLORS.TCP }
        },
        {
            name: 'Modbus',
            type: 'bar',
            stack: 'total',
            data: percentData.Modbus, // ⭐️ 비율 데이터 사용
            itemStyle: { color: percentData.COLORS.Modbus },
            label: { show: false } 
        }
    ]
};

export default function WeeklyProtocol() {
  return (
    <DashboardBlock title="주간 프로토콜 현황" sx={{ height: '100%', flex: 1 }}>
            <ReactECharts
                option={trendOptions}
                // ⭐️ 박스 크기에 맞추기 위해 높이 재조정 (300px 유지)
                style={{ height: '100%', width: '100%' }} 
                notMerge={true}
                lazyUpdate={true}
            />
        </DashboardBlock>
    );
}