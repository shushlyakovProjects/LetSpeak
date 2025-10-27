import React from "react";
import style from "./Chats.module.scss";

export default function ChatsPresentation({ logout }) {
  const myName = "Alex";
  const data = [
    { id: 1, name: "Alex", content: "Content 1", date: "10.10.25" },
    {
      id: 2,
      name: "Vick",
      content:
        "Content 2 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea dignissimos eaque, quos quod, mollitia illum eum quisquam suscipit quis fuga et nesciunt architecto modi, ullam deserunt rem dicta? Accusantium, mollitia.",
      date: "10.10.25",
    },
    {
      id: 3,
      name: "Alex",
      content:
        "Content 3 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea dignissimos eaque, quos quod, mollitia illum eum quisquam suscipit quis fuga et ",
      date: "10.10.25",
    },
    {
      id: 4,
      name: "Vick",
      content:
        "Content 4 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea dignissimos eaque, quos quod, mollitia illum eum quisquam ",
      date: "10.10.25",
    },
    {
      id: 5,
      name: "Alex",
      content:
        "Content 3 Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ea dignissimos eaque, quos quod, mollitia illum eum quisquam suscipit quis fuga et nesciunt architecto modi, ullam deserunt rem dicta? Accusantium, mollitia.",
      date: "10.10.25",
    },
    { id: 6, name: "Vick", content: "Content 4", date: "10.10.25" },
    { id: 7, name: "Alex", content: "Content 3", date: "10.10.25" },
    { id: 8, name: "Vick", content: "Content 4", date: "10.10.25" },
  ];

  return (
    <div className={style["wrapper"]}>
      <header>
        <h2>Общий чат</h2>
        <nav>
          <button onClick={logout}>Выход</button>
        </nav>
      </header>

      <div className={style["chat"]}>
        {data.map((message) => (
          <div
            key={message.id}
            className={
              message.name == myName
                ? `${style["chat__message"]} ${style["chat__myMessage"]}`
                : `${style["chat__message"]} `
            }
          >
            {message.name != myName ? <p className={style["chat__message-user"]}>{message.name}</p> : ""}
            <p className={style["chat__message-content"]}>{message.content}</p>
            <p className={style["chat__message-date"]}>{message.date}</p>
          </div>
        ))}
      </div>
      <textarea name="" id="" placeholder="Сообщение..."></textarea>
    </div>
  );
}
