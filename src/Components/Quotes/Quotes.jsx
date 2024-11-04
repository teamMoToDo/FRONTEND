import React, { useEffect, useState } from 'react';
import styles from './Quotes.module.css';
import MenuBar from '../MenuBar/MenuBar';

const Quotes = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    useEffect(() => {

    }, );

    return (
        <div className={styles.totalPage}>
            <MenuBar />
            <div className={styles.contentBox}>
                <h1>Number: {randomNumber}</h1>
            </div>
        </div>
    );
};

export default Quotes;