"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import GoogleLoginBtn from "./GoogleLoginBtn";

const SITE_URL = "http://localhost:3000";

const Login = () => {
  const router = useRouter();
  const [hidePw, setHidePw] = useState<boolean>(false);
  const { email, password, setEmail, setPassword } = useAuthStore();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  console.log(email, password);
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch(`${SITE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      const {
        user: { user_metadata }
      } = await response.json();

      //  TODO: 토스트 컨테이너 스타일 수정하기
      toast(`${user_metadata?.nickname}님, 메인 페이지로 이동합니다.`, {
        onClose: () => {
          router.push("/");
        }
      });
    } catch (error) {
      console.log("로그인 중 에러 발생");
    }
  };

  const handleGoogleButtonClick = async () => {
    try {
      const response = await fetch(`${SITE_URL}/api/auth/login/google`, {
        method: "POST"
      });
      const result = await response.json();
      console.log(result);
      // router.push(result.url);
    } catch (error) {
      console.log("구글 로그인 실패", error);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <h1 className="mt-11 mb-[90px] text-[30px] font-bold">PAi</h1>
      <form className="md:w-8/12 flex flex-col justify-center text-base" onSubmit={handleFormSubmit}>
        <div className="relative flex flex-col">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="welcome@example.com"
            className="min-w-[340px] h-10 mt-1 mb-5 bg-slate-200 indent-10 rounded-[10px] focus:outline-none "
          />
        </div>
        <div className="relative flex flex-col">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type={!hidePw ? "password" : "text"}
            value={password}
            onChange={handlePasswordChange}
            placeholder="영문, 숫자, 특수문자 포함 6~12자"
            className="min-w-[340px] h-10 mt-1 mb-16 bg-slate-200 indent-10 rounded-[10px] focus:outline-none "
          />
          {!hidePw ? (
            <FaRegEyeSlash
              color="#9a9a9a"
              className="w-[20px] h-[20px] absolute right-3.5 top-1/3 transform -translate-y-1/3 hover:cursor-pointer"
              onClick={() => setHidePw(!hidePw)}
            />
          ) : (
            <FaRegEye
              color="#9a9a9a"
              className="w-[20px] h-[20px] absolute right-3.5 top-1/3 transform -translate-y-1/3 hover:cursor-pointer"
              onClick={() => setHidePw(!hidePw)}
            />
          )}
        </div>
        <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} closeOnClick={true} />
        <button className="min-w-[340px] h-12 mt-7 mb-2.5 bg-slate-200 rounded-[10px] ">로그인</button>
      </form>
      <div className="flex mt-2.5 mb-9 gap-5 text-xs">
        <Link href="/sign-up">
          <p className="hover:cursor-pointer">이메일로 가입하기</p>
        </Link>
        <p>|</p>
        <Link href="/login/find-password">
          <p className="hover:cursor-pointer">비밀번호 찾기</p>
        </Link>
      </div>

      <div className="md:w-8/12 mt-14 relative flex flex-col justify-center items-center border-t border-gray-300">
        <p className="text-center min-w-[150px] absolute bg-white top-7 transform  -translate-y-10">간편 로그인</p>
        <div className="md:w-8/12 md:gap-24 min-w-[340px] flex justify-center gap-14 mt-14">
          <button className="w-[36px] h-[36px] rounded-full bg-slate-400 hover:bg-slate-500 transition duration-200">
            K
          </button>
          <button className="w-[36px] h-[36px] rounded-full bg-slate-400  hover:bg-slate-500 transition duration-200">
            A
          </button>
          <GoogleLoginBtn />
        </div>
      </div>
    </div>
  );
};

export default Login;
