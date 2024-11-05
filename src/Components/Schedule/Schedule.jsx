import React, { useEffect, useState } from 'react';
import styles from './Schedule.module.css'; // CSS 모듈

const Schedule = () => {
  const [events, setEvents] = useState([]); // 모든 이벤트를 저장할 상태
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 날짜 포맷을 '11월 5일 오전 1시 45분'으로 변경하는 함수
  const formatDate = (startDate) => {
    const utcDate = new Date(startDate); // UTC 시간 변환
    const options = {
      year: 'numeric',
      month: 'long', // 월을 'November' 형식으로 표시
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true, // 오전/오후 표시
      timeZone: 'Asia/Seoul', // 서울 기준으로 변환
    };

    // '11월 5일 오전 1시 45분' 형태로 포맷팅
    const formattedDateTime = utcDate.toLocaleString('ko-KR', options);

    // 예시: '2024. 11. 05. 오전 1:45' -> ['2024', '11', '05', '오전', '1:45']
    const [year, month, day, ampm, time] = formattedDateTime.split(' ');
    const [hour, minute] = time.split(':'); // 시간과 분을 분리

    // 최종적으로 '11월 5일 오전 1시 45분' 형태로 반환
    return `${month}${day} ${ampm}${hour}시${minute}분`;
  };

  const fetchScheduleInfo = async () => {
    setLoading(true); // 로딩 시작
    const token = localStorage.getItem('jwtToken'); // 토큰 가져오기

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();
      console.log('API 응답 전체 구조:', JSON.stringify(data, null, 2)); // 디버깅용 로그

      const formattedEvents = data.events.map(event => {
        // KST로 변환된 날짜
        const formattedDateTime = formatDate(event.start_date);

        return {
          ...event,
          start_date: formattedDateTime, // 변환된 시간 저장
        };
      });

      setEvents(formattedEvents); // 상태에 저장
    } catch (error) {
      console.error('스케줄 정보 가져오기 실패:', error);
      setError(error.message);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  useEffect(() => {
    fetchScheduleInfo(); // 컴포넌트 마운트 시 데이터 요청
  }, []);

  return (
    <div className={styles.scheduleContainer}>
      {loading && <p>Loading...</p>} {/* 로딩 중 표시 */}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* 에러 메시지 */}

      {/* 모든 이벤트 표시 */}
      {!loading && !error && (
        <ul className={styles.homeLists}>
          {events.map((event) => (
            <li key={event.id} className={styles.eventItem}>
              <div className={styles.dateTitle}>
                <strong>날짜:</strong> {event.start_date}
              </div>
              <div className={styles.title}>
                <strong>제목:</strong> {event.title}
              </div>
              <div className={styles.description}>
                <strong>내용:</strong> {event.description || '설명 없음'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Schedule;