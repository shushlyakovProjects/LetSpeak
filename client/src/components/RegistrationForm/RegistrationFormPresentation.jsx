import React, { use } from "react";
import style from "../Form.module.scss";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function RegistrationFormPresentation({ tryRegistration, handleError, errorMessage }) {
  const { register, handleSubmit, getValues } = useForm();

  return (
    <form className={style["form"]} onSubmit={handleSubmit(tryRegistration, handleError)}>
      <h1 className={style["title"]}>Let<span>S</span>peak</h1>
      <h2>Регистрация</h2>
      <div className={style["form__field"]}>
        <input type="text" placeholder="Введите имя" {...register("username", { required: "Укажите имя!" })} />
      </div>
      <div className={style["form__field"]}>
        <input type="text" placeholder="Введите логин" {...register("login", { required: "Укажите логин!" })} />
      </div>
      <div className={style["form__field"]}>
        <input
          type="password"
          placeholder="Введите пароль"
          {...register("password", {
            required: "Укажите пароль!",
            minLength: {value: 3, message: 'Пароль должен быть минимум 3 символа!'},
            validate: {
              matchPassword: (value) => {
                return value == getValues("passwordRepeat") || "Пароли не совпадают";
              },
            },
          })}
        />
      </div>
      <div className={style["form__field"]}>
        <input type="password" placeholder="Повторите пароль" {...register("passwordRepeat", { required: true })} />
      </div>
      <div className={style["form__field-btns"]}>
        <p className="error">{errorMessage}</p>
        <input type="submit" value="Создать аккаунт" />
        <Link className="link" to={'/auth'}>У меня есть аккаунт</Link>
      </div>
    </form>
  );
}
