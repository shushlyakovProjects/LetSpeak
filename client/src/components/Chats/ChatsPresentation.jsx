import React from 'react'
import style from './Chats.module.scss'

export default function ChatsPresentation() {
  return (
    <div className={style['wrapper']}>
        <h2>Общий чат</h2>
        <div className="chat">
            <div className="chat__message">
                <p>Alex</p>
                <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Rem, aut.</p>
                <p>10.10.25</p>
            </div>
            <textarea name="" id=""></textarea>

            {/* ДОБРАБОТАТЬ ЧАТ */}

        </div>
    </div>
  )
}
