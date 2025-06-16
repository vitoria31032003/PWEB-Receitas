import React from 'react';
import { About } from "./about";
import { Contact } from "./contact";
import styles from '../style/style.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <h2>
                Viva a nossa senhora sentana
            </h2>
            <About />
            <Contact />
            <img width='375'src="https://i.pinimg.com/736x/6f/97/db/6f97db55ef43c50db0511494489b9b6c.jpg"></img>
            <p >Salve, Sant’Ana gloriosa, nosso amparo e nossa luz! Salve, Sant’Ana ditosa, terno afeto de Jesus</p>
        </div>
    )
}