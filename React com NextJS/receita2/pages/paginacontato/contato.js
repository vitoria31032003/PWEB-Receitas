import React from 'react'; 
import Navigation from '../../pages/navigation';
import styles from '../../styles/contato\.module.css'; 

export default function Contato() {
    return (
        <div>
            <Navigation />
            <div className={styles.wrapper}>
                <form action=''>
                    <h1 className={styles.nameLogin}>Fale Conosco</h1>
                    
                    <div className={styles.inputbox}>
                        <input type='text' placeholder='Seu nome' required />
                    </div>

                    <div className={styles.inputbox}>
                        <input type='email' placeholder='Seu email' required />
                    </div>

                    <div className={styles.inputbox}>
                        <textarea placeholder='Sua mensagem' required style={{ height: '100px', resize: 'none' }} />
                    </div>

                    <button type='enviar' className={styles.bnt}>Enviar</button>
                </form>
            </div>
        </div>
    );
}