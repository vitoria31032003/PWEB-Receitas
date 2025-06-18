import React from 'react';
import styles from './style/style.module.css';

export function About() {
    return (
        <div className={styles.about}>
            <h2>Página sobre</h2>
        </div>
    );
}

export function Contact() {
    return (
        <div className={styles.contact}>
            <h2>Página contato</h2>
            <p>Fale conosco através do formulário abaixo.</p>
        </div>
    );
}

export default function Home() {
    return (
        <div className={styles.container}>
            <h2>Viva a Santana!!</h2>
            <About />
            <Contact />
            <img
                width="375"
                src="https://s2-g1.glbimg.com/OnDQyKKHUbPqWCY0FzvwnC04As8=/0x0:3456x2304/1000x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_59edd422c0c84a879bd37670ae4f538a/internal_photos/bs/2017/5/C/VPBxAbQwqihbxV4A3dUw/senhora-santana-foto-wn.jpg"
                alt="Senhora Santana"
            />
            <p>Salve, sant'ana gloriosa, nosso amparo e nossa luz!</p>
        </div>
    );
}
