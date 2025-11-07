export const ANALYSIS_MAP = {
  '리플레이 공격': {
    detection: '과거에 관찰된 패킷의 트랜잭션 ID, 기능 코드, 데이터 값의 순서가 특정 시간차를 두고 정확히 동일하게 반복되었습니다.',
    violation: '정상적인 제어 주기와 통계적으로 학습된 시간 간격(Interval)을 벗어난 시점에 과거와 동일한 명령이 발생했습니다.',
    conclusion: '인가된 통신처럼 보이지만, 과거 트래픽을 재사용한 비정상적인 재전송(Replay Attack)으로 시스템 오작동을 유발하려는 악의적인 공격으로 판단합니다.'
  },
  '비정상 Modbus 쓰기': {
    detection: '비정상적인 Modbus Function Code (Write Single Coil/Register) 요청이 감지되었습니다.',
    violation: '인가되지 않은 IP(192.168.1.110)가 HMI-01의 특정 주소에 대한 쓰기 권한을 시도했습니다.',
    conclusion: '시스템 설정값을 임의로 변경하려는 시도로, 긴급 차단이 필요합니다.'
  },
  '명령 시퀀스 이상': {
    detection: '정상적인 PLC 제어 로직(A->B->C)과 다른 순서(A->C)의 명령이 감지되었습니다.',
    violation: '필수적인 안전 확인 단계(B)가 누락되어 정책을 위반했습니다.',
    conclusion: '물리적 시스템에 오류를 유발할 수 있는 비정상적 명령 시퀀스입니다.'
  },
  '잘못된 기능 코드': {
    detection: '정의되지 않은 Modbus 기능 코드가 포함된 패킷이 탐지되었습니다.',
    violation: '표준 프로토콜을 준수하지 않았습니다.',
    conclusion: '시스템 스캔 또는 퍼징(Fuzzing) 공격의 일부일 가능성이 있습니다. 조치 완료되었습니다.'
  },
  'default': {
    detection: '해당 위협 유형에 대한 분석 내용이 등록되지 않았습니다.',
    violation: '분석 내용 없음',
    conclusion: '분석 내용 없음'
  }
};
