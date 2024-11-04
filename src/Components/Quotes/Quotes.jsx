import React, { useEffect, useState, useCallback } from 'react';
import styles from './Quotes.module.css';
import axios from 'axios';

const Quotes = () => {
    const [randomNumber, setRandomNumber] = useState(null);
    const [randomContent, setRandomContext] = useState('');

    const fetchQuotes = useCallback(async () => {
        if (randomNumber === null) return; // randomNumber가 null인 경우 fetch하지 않음
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/quotes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    randomNumber: randomNumber,
                }
            });

            const data = response.data.content; // 정확한 키로 수정
            setRandomContext(data || 'No quote found');
        } catch (error) {
            console.error('Failed to fetch quotes:', error);
            setRandomContext('Failed to load quote');
        }
    }, [randomNumber]);

    useEffect(() => {
        const number = Math.floor(Math.random() * 100) + 1;
        setRandomNumber(number);
    }, []); // 빈 배열로 설정하여 컴포넌트가 마운트될 때 한 번만 호출

    useEffect(() => {
        fetchQuotes(); // randomNumber가 변경될 때 호출
    }, [randomNumber, fetchQuotes]); // randomNumber가 변경될 때만 호출

    return (
        <div className={styles.totalPage}>
            <div className={styles.contentBox}>
                <h3>{randomContent}</h3>
            </div>
        </div>
    );
};

export default Quotes;
