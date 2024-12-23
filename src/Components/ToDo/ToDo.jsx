import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ToDo.module.css'; // ToDo CSS 모듈

const ToDo = () => {
  const [notes, setNotes] = useState([]); // 초기값을 빈 배열로 설정
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  // 노트 데이터 fetch 함수
  const fetchNotes = async () => {
    setLoading(true); // 로딩 시작
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/todos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = response.data.todos;

      setNotes(data); // 서버에서 가져온 노트 데이터
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 컴포넌트가 마운트될 때 노트 데이터를 가져온다
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async () => {
    if (!newNote.trim()) return; // 빈 노트 방지

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/todos`, 
        {
          content: newNote,
          completed: false,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

        const createdNote = response.data.newTodo;

        setNotes((prevNotes) => [...prevNotes, createdNote]);
        setNewNote('');
      } catch (error) {
        setError(error.message);
      }
  };

  const handleDeleteNote = async (id) => {
    const token = localStorage.getItem('jwtToken');
    const noteToDelete = notes.find(note => note.id === id);
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

    } catch (error) {
      setError(error.message);
      setNotes((prevNotes) => [...prevNotes, noteToDelete]);
    }
  };  

  const handleToggleComplete= async (id) => {
    const note = notes.find(note => note.id === id);
    const updatedNote = { ...note, completed: !note.completed };

    setNotes((prevNotes) =>
        prevNotes.map((note) =>
            note.id === id ? updatedNote : note
    ));

    try {
        const token = localStorage.getItem('jwtToken');
        await axios.patch(`${process.env.REACT_APP_API_URL}/api/todos/${id}`, { 
            completed: updatedNote.completed 
            }, { 
                headers: { 
                    Authorization: `Bearer ${token}`, 
                    'Content-Type': 'application/json' 
                } 
            }
        );
    } catch (error) {
        setError(error.message);
        setNotes((prevNotes) =>
            prevNotes.map((note) =>
                note.id === id ? { ...note, completed: !updatedNote.completed } : note
        ));
    }
  };

  return (
    <div className={styles.todoContainer}>      
      {loading}

      <ul className={styles.todoLists}>
          {notes.map((note) => (
            <li key={note.id}>
              <input
                  className={styles.noteCheckBox} 
                  type="checkbox" 
                  checked={note.completed}
                  onChange={() => handleToggleComplete(note.id)}
              />
              <p className={note.completed ? styles.completed : styles.noteContent}>{note.content}</p>
              <button className={styles.deleteButton} onClick={() => handleDeleteNote(note.id)}></button>
            </li>
          ))}
      </ul>

      <div className={styles.inputContainer}>
          <input
              className={styles.taskInput}
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add New Task"
          />
          <button className={styles.sendButton} onClick={handleAddNote}>등록</button>
      </div>
    </div>
  );  
};

export default ToDo;
