import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BiSolidHeart } from "react-icons/bi";
import { PiCakeDuotone } from "react-icons/pi";
import { IoAirplane } from "react-icons/io5";
import { IoBeerOutline } from "react-icons/io5";
import { SlNote } from "react-icons/sl";
import Modal from 'react-modal';
import MenuBar from '../MenuBar/MenuBar';
import styles from './Calendar.module.css';
import colorCheckIcon from '../Assets/color_check.png';
import axios from 'axios';

const icons = [<BiSolidHeart />, <PiCakeDuotone />, <IoAirplane />, <IoBeerOutline />, <SlNote />];

Modal.setAppElement('#root');

const Calendar = () => {
  const currentDate = new Date();
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventTime, setEventTime] = useState('오전 12:00');
  const [eventContent, setEventContent] = useState('');
  const [events, setEvents] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [iconIndexes, setIconIndexes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [moreEvents, setMoreEvents] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#7F24A6');
  const [userInfo, setUserInfo] = useState({ user_id: ''});
  const [isLoading, setIsLoading] = useState(true); 


  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dayColors = {
    Sun: 'red',
    Sat: 'blue',
    default: 'black',
  };

  const colorOptions = [
    '#7F24A6', '#4563BF', '#39BF73', '#F2AC29', '#D90404'
  ];

  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    const isPM = hour >= 12;
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const period = isPM ? "오후" : "오전";
    return `${period} ${formattedHour}:${minute.toString().padStart(2, '0')}`;
  });

  
  const fetchEvents = useCallback(async () => {
    setIsLoading(true); 
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const fetchedEvents = response.data.events;
      const userId = response.data.userId;
  
      const eventsMap = {};
  
      fetchedEvents.forEach(event => {
        const startDateKST = new Date(event.start_date).toLocaleString('en-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
  
        const endDateKST = new Date(event.end_date).toLocaleString('en-KR', {
          timeZone: 'Asia/Seoul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
  
        const kstEvent = {
          ...event,
          start_date: startDateKST,
          end_date: endDateKST
        };
  
        const dateParts = startDateKST.split(',')[0].split('/');
        const [month, day, year] = dateParts;
        
        const dateKey = `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
  
        if (!eventsMap[dateKey]) {
          eventsMap[dateKey] = [];
        }
  
        eventsMap[dateKey].push(kstEvent);
      });
  
      setUserInfo(userId);
      setEvents(eventsMap);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(); 
  }, [fetchEvents, currentYear, currentMonth]);

  const formatDateToMMDDYYYY = (year, month, day) => {
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    return `${formattedMonth}/${formattedDay}/${year}`;
  };

  const convertTo24HourFormat = (timeString) => {
    if (!timeString || !timeString.includes(' ')) {
      console.warn('Invalid or empty time input, setting default: 00:00:00');
      return '00:00:00';
    }
  
    const [period, time] = timeString.split(' ');
    let [hour, minute] = time.split(':').map(Number);
  
    if (period === '오후' && hour !== 12) hour += 12;
    if (period === '오전' && hour === 12) hour = 0;
  
    if (isNaN(hour) || isNaN(minute)) {
      console.error('Invalid time format:', timeString);
      return '00:00:00';
    }
  
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setEventTitle('');
    setEventContent('');
    setEventTime('오전 12:00'); 
    setSelectedColor('#7F24A6');
  };
  const closeMoreModal = () => setShowMoreModal(false);

  const handleDateClick = (day) => {
    const dateKey = formatDateToMMDDYYYY(currentYear, currentMonth, day);
    setSelectedDate(new Date(currentYear, currentMonth, day));
  
    // 아이콘 인덱스 변경 및 로컬 스토리지에 저장
    setIconIndexes(prevIndexes => {
      const currentIndex = prevIndexes[dateKey] || 0;
      const newIndex = (currentIndex + 1) % icons.length;
  
      localStorage.setItem(dateKey, newIndex); // 로컬 스토리지 업데이트
      return { ...prevIndexes, [dateKey]: newIndex };
    });
  
    const event = events[dateKey] || { title: '', time: '00:00', content: '' };
    setEventTitle(event.title);
    setEventTime(event.time);
    setEventContent(event.content);
  
    openModal();
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prevYear => prevYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prevMonth => prevMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prevYear => prevYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prevMonth => prevMonth + 1);
    }
  };

  const formatDateToMySQL = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  const handleIconClick = (e, day) => {
    if (isLoading) return;
  
    e.stopPropagation();
    const dateKey = formatDateToMMDDYYYY(currentYear, currentMonth, day);
  
    setIconIndexes((prevIndexes) => {
      const currentIndex = prevIndexes[dateKey] || 0;
      const newIndex = (currentIndex + 1) % icons.length;
  
      // 로컬 스토리지에 아이콘 인덱스 저장
      localStorage.setItem(dateKey, newIndex);
  
      return { ...prevIndexes, [dateKey]: newIndex };
    });
  };

  const fetchStoredIconIndexes = () => {
    const storedIconIndexes = {};
  
    // 로컬 스토리지에서 모든 키를 순회하며 아이콘 인덱스 불러오기
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = formatDateToMMDDYYYY(currentYear, currentMonth, i);
      const storedIndex = localStorage.getItem(dateKey);
  
      if (storedIndex !== null) {
        storedIconIndexes[dateKey] = parseInt(storedIndex);
      }
    }
  
    setIconIndexes(storedIconIndexes);
  };
  
  useEffect(() => {
    fetchEvents(); // 기존 이벤트 로드
  
    fetchStoredIconIndexes(); // 로컬 스토리지에서 아이콘 인덱스 불러오기
  }, [fetchEvents, currentYear, currentMonth]);
  
  const handleSaveEvent = async () => {
    if (selectedDate) {
      const selectedDateTime = new Date(selectedDate);
      const [hours, minutes] = convertTo24HourFormat(eventTime).split(':').map(Number);
      selectedDateTime.setHours(hours, minutes);
  
      const dateKey = formatDateToMMDDYYYY(
        selectedDateTime.getFullYear(),
        selectedDateTime.getMonth(),
        selectedDateTime.getDate()
      );
  
      // MySQL에서 인식할 수 있는 날짜 형식으로 변환
      const startDateFormatted = formatDateToMySQL(selectedDateTime);
      const endDateFormatted = formatDateToMySQL(new Date(selectedDateTime.getTime() + 60 * 60 * 1000));
  
      const eventDetail = {
        title: eventTitle,
        time: convertTo24HourFormat(eventTime),
        description: eventContent,
        start_date: startDateFormatted, // 변환된 값 사용
        end_date: endDateFormatted,     // 변환된 값 사용
        all_day: 1,
        color: selectedColor,
      };
  
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events`, eventDetail, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const savedEventId = response.data.saveEventId.insertId;
  
        const newEventDetail = {
          id: savedEventId,
          ...eventDetail,
        };
  
        setEvents((prevEvents) => ({
          ...prevEvents,
          [dateKey]: [...(prevEvents[dateKey] || []), newEventDetail]
            .sort((a, b) => a.time.localeCompare(b.time)), // 시간 순 정렬
        }));
        closeModal();
      } catch (error) {
        console.error('Error saving event:', error);
      }
    }
  };
   
  const handleEventClick = (day, event) => {
    console.log('Selected event:', event); // 선택된 이벤트 확인용 로그
  
    setSelectedDate(new Date(currentYear, currentMonth, day)); // 선택된 날짜 설정
    setSelectedEvent(event); // 선택된 이벤트 설정
  
    // 이벤트 데이터로 모달의 필드 설정
    setEventTitle(event.title || ''); 
    setEventTime(event.time || '오전 12:00');
    setEventContent(event.description || ''); // 이벤트 내용 설정
    setSelectedColor(event.color || '#FFFF00');
  
    openModal(); // 모달 열기
  };

  const handleMoreClick = (day) => {
    const dateKey = formatDateToMMDDYYYY(currentYear, currentMonth, day);
    const eventsForDay = events[dateKey] || [];
    
    if (eventsForDay.length > 0) {
      setMoreEvents(eventsForDay);
      setShowMoreModal(true);
    } else {
      console.error('No events for this day.');
    }
  };

  const handleEventUpdate = async () => {
    if (!selectedEvent) {
      console.error('No event selected for update.');
      return;
    }
  
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = convertTo24HourFormat(eventTime || '오전 12:00').split(':').map(Number);
    selectedDateTime.setHours(hours, minutes);
  
  
    const startDateFormatted = formatDateToMySQL(selectedDateTime);
    const endDateFormatted = formatDateToMySQL(new Date(selectedDateTime.getTime() + 60 * 60 * 1000));
  
    const updatedEventDetails = {
      ...selectedEvent,
      title: eventTitle,
      description: eventContent,
      color: selectedColor,
      time: convertTo24HourFormat(eventTime || '오전 12:00'),
      start_date: startDateFormatted, 
      end_date: endDateFormatted,
    };
  
    try {
      const token = localStorage.getItem('jwtToken');
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.id}`,
        updatedEventDetails,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
  
      const dateKey = formatDateToMMDDYYYY(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents[dateKey].map((event) =>
          event.id === selectedEvent.id ? updatedEventDetails : event
        );
        return { ...prevEvents, [dateKey]: updatedEvents };
      });
  
      setSelectedEvent(null);
      closeModal();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };
  
  const handleEventDelete = async () => {
    if (!selectedEvent) {
      console.error('No event selected for deletion.');
      return;
    }
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = convertTo24HourFormat(eventTime || '오전 12:00').split(':').map(Number);
    selectedDateTime.setHours(hours, minutes);
    console.log('Deleting event:', selectedEvent);
  
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/events/${selectedEvent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Delete response:', response.data);
  
      const dateKey = formatDateToMMDDYYYY(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), selectedDateTime.getDate());
      setEvents((prevEvents) => {
        const filteredEvents = prevEvents[dateKey].filter(
          (event) => event.id !== selectedEvent.id
        );
  
        if (filteredEvents.length === 0) {
          setIconIndexes(prevIndexes => ({
            ...prevIndexes,
            [dateKey]: -1 
          }));
        }
  
        return { ...prevEvents, [dateKey]: filteredEvents };
      });
  
      setSelectedEvent(null);
      closeModal();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEventEditFromMoreModal = (event) => {
    setSelectedEvent(event);
    setEventTitle(event.title);
    setEventTime(event.time);
    setEventContent(event.content);
    closeMoreModal();
    openModal();
  };

  const handleColorSelection = (color) => {
    setSelectedColor(color);
  };

  const filteredAndSortedEvents = moreEvents
  .sort((a, b) => {
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    return 0;
  });

  const weeks = Math.ceil((firstDayOfMonth + daysInMonth) / 7);
  const isSixWeeks = weeks === 6;

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = formatDateToMMDDYYYY(currentYear, currentMonth, day)
  
    const eventString = events && events[dateKey];
    const eventList = events[dateKey] || [];
    const hasEvents = eventList.length > 0;
    const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
    const color = (dayOfWeek === 0) ? dayColors.Sun : (dayOfWeek === 6) ? dayColors.Sat : dayColors.default;
    const currentIconIndex = iconIndexes[dateKey];
    const maxVisibleEvents = 2;
  
    days.push(
      <div
        key={day}
        className={`${styles.calendarDay} ${selectedDate?.getDate() === day ? styles.selected : ''}`}
        onClick={() => handleDateClick(day)}
        style={{  
          minHeight: isSixWeeks ? '11.5vh' : '13vh',
          color: color 
        }}
      >
        {day}
        {hasEvents && (
          <>
            <div className={styles.iconContainer} onClick={(e) => handleIconClick(e, day)}>
              {icons[currentIconIndex]}
            </div>
            {eventList
              .slice(0, events[dateKey].length > maxVisibleEvents ? 1 : maxVisibleEvents)
            .map((event, index) => (
          <div
            key={index}
            className={styles.eventTitle}
            onClick={(e) => {
            e.stopPropagation();
            handleEventClick(day, event); 
          }}
          style={{ backgroundColor: event.color }}
        >
        {event.title}
      </div>
      ))}
            {eventList.length > maxVisibleEvents && (
              <div
                className={styles.moreEvents}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreClick(day);
                }}
              >
                ...더보기
              </div>
            )}
          </>
        )}
      </div>
    );
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.calendarPage}>
      <MenuBar />
      <div className={styles.calendarContainer}>
        <div className={styles.calendarHeader}>
        <button className={styles.moveMonthButton} onClick={handlePrevMonth}>
        <img src={require('../Assets/arrow_left_button.png')} className={styles.buttonImage} /></button>
          <div>{`${currentYear}년 ${currentMonth + 1}월`}</div>
          <button className={styles.moveMonthButton} onClick={handleNextMonth}>
          <img src={require('../Assets/arrow_right_button.png')} className={styles.buttonImage} /></button>
        </div>
        <div className={styles.calendarGrid}>
          {daysInWeek.map((dayName, index) => (
            <div key={index} 
              className={styles.calendarDayName}
              style={{ color: dayColors[dayName] || dayColors.default }}
            >
              {dayName}
            </div>
          ))}
          {days}
        </div>
      </div>
      <Modal isOpen={showModal} onRequestClose={closeModal} className={styles.modal}>
        <h2>제목 및 일정 추가</h2>
        <input type="text" placeholder="제목" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
        <select value={eventTime} onChange={(e) => setEventTime(e.target.value)}>
          {timeOptions.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
        <textarea 
          placeholder="내용" 
          value={eventContent} 
          onChange={(e) => setEventContent(e.target.value)} 
          style={{ border: '1px solid #000000', padding: '10px'}}
        />
        <div className={styles.colorPicker}>
          {colorOptions.map(color => (
            <button
              key={color}
              style={{
                background: color,
                margin: '5px',
                border: '2px solid black',
                display: 'inline-block',
                overflow: 'hidden',
                position: 'relative',
              }}
              onClick={() => handleColorSelection(color)}
            >
              {selectedColor === color && (
                <img 
                  src={colorCheckIcon} 
                  alt="selected" 
                  style={{
                    width: '20px',
                    height: '20px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
            </button>
          ))}
        </div>
        <button onClick={handleSaveEvent}>저장</button>
        <button onClick={closeModal}>닫기</button>
        <button onClick={handleEventUpdate}>수정</button>
        <button onClick={handleEventDelete}>삭제</button>
      </Modal>
      <Modal isOpen={showMoreModal} onRequestClose={closeMoreModal} className={styles.modal}>
        <h2>모든 일정 보기</h2>
        {filteredAndSortedEvents.map((event, index) => (
          <div key={index} className={styles.eventDetail}>
            <strong>{event.title}</strong> - {event.time}
            <p>{event.content}</p>
            <button onClick={() => handleEventEditFromMoreModal(event)}>수정</button>
          </div>
        ))}
        <button onClick={closeMoreModal}>닫기</button>
      </Modal>
    </div>
  );
};

export default Calendar;