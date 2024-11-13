import React, { useEffect, useState } from 'react';
import styles from './Schedule.module.css'; // CSS 모듈

const Schedule = () => {
  const [events, setEvents] = useState([]); // 모든 이벤트를 저장할 상태
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 오늘의 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // UTC 시간을 KST로 변환하는 함수
  const convertToKST = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 9); // UTC에서 KST로 변환 (+9시간)
    return date.toISOString().split('T')[0]; // 날짜 부분만 가져오기
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

      const today = getTodayDate();
      const todayEvents = data.events.filter(event => {
        const eventDateKST = convertToKST(event.start_date); // KST로 변환된 날짜
        return eventDateKST === today;
      });

      setEvents(todayEvents); // 오늘의 일정만 상태에 저장
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

      {/* 오늘의 일정 표시 */}
      {!loading && !error && (
        <ul className={styles.homeLists}>
          {events.map((event) => (
            <li key={event.id} className={styles.eventItem}>
              <div className={styles.title}>
                <strong></strong> {event.title}
              </div>
              <div className={styles.description}>
                <strong></strong> {event.description || '설명 없음'}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Schedule;
