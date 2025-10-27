import React, { use } from "react";
import style from "../Form.module.scss";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

export default function AuthorizationFormPresentation({ tryLogin, handleError, errorMessage  }) {
  const { register, handleSubmit, getValues } = useForm();

  return (
    <form className={style["form"]} onSubmit={handleSubmit(tryLogin, handleError)}>
      <h1 className={style["title"]}>Let<span>S</span>peak</h1>
      <h2>Авторизация</h2>
      <div className={style["form__field"]}>
        <input type="text" placeholder="Введите логин" {...register("login", {required: "Укажите логин!"})} />
      </div>
      <div className={style["form__field"]}>
        <input type="password" placeholder="Введите пароль" {...register("password", {required: "Укажите пароль!"})} />
      </div>
      <div className={style["form__field-btns"]}>
        <p className="error">{errorMessage}</p>
        <input type="submit" value="Войти в аккаунт" />
        <Link className="link" to={'/reg'}>У меня нет аккаунта</Link>
      </div>
    </form>
  );
}
