import { useEffect } from "react";
import style from "../Chats.module.scss";
import { useState } from "react";

export default function ImageBlock({ urlImage, setUrlImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(null);

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code == "Escape") {
        setUrlImage("");
      }
    });

    return () => {
      document.removeEventListener("keydown", (e) => {
        if (e.code == "Escape") {
          setUrlImage("");
        }
      });
    };
  });

  return (
    <div
      className={style["imageWrapper"]}
      onClick={(e) => {
        if (!e.target.closest("img")) {
          setUrlImage("");
        }
      }}
    >
      <section className="zoom">
        <img
          src={urlImage}
          alt="Тут было изображение. Серьезно."
          onTouchStart={(e) => {
            setStartY(e.touches[0].clientY);
            setIsDragging(true);
          }}
          onTouchMove={(e) => {
            if (!isDragging) return;
            let currentY = e.touches[0].clientY;
            let deltaY = startY - currentY;

            e.target.style.cssText = `transform: translateY(${-deltaY}px)`;

            if (Math.abs(deltaY) > 100) {
              setUrlImage("");
            }
          }}
          onTouchEnd={(e) => {
            e.target.style.cssText = `transform: translateY(0)`;
            setIsDragging(false);
          }}
        />
      </section>
    </div>
  );
}
