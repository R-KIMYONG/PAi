"use client";

import SubmitBtn from "@/app/(auth)/_components/SubmitBtn";
import useModal from "@/hooks/useModal";
import { useThrottle } from "@/hooks/useThrottle";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import AgreeBtn from "@/components/icons/myPage/AgreeBtn";
import Notification from "@/components/icons/myPage/Notification";
import { useQueryClient } from "@tanstack/react-query";

const placeholder = `소중한 피드백을 부탁드립니다.
더 나은 서비스로 보답드리겠습니다.`;

const DeleteAccount = () => {
  const router = useRouter();
  const throttle = useThrottle();
  const { data, isPending, isError } = useUserData();
  const feedbackRef = useRef<HTMLTextAreaElement>(null);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [isAgreement, setIsAgreement] = useState<boolean>(false);
  const { openModal, Modal } = useModal();
  const queryClient = useQueryClient();

  // useEffect(()=> {
  //   setIsDisabled
  // }, [isDisabled])

  const handleNotificationClick = () => {
    setIsAgreement(!isAgreement);
    setIsDisabled(!isDisabled);
  };

  const handleClickDelete = () => {
    if (!isAgreement) {
      toast.warn("회원 탈퇴 유의사항에 동의해주세요.");
      return;
    }
    openModal(
      {
        message: "정말 탈퇴하시겠어요?",
        confirmButton: { text: "확인", style: "확인" },
        cancelButton: { text: "취소", style: "취소" }
      },
      handleDeleteAccount
    );
  };

  const handleDeleteAccount = () => {
    throttle(async () => {
      if (feedbackRef?.current?.value.trim() !== "") {
        const response = await fetch(`/api/myPage/deleteAccount/feedback`, {
          method: "POST",
          body: JSON.stringify({
            content: feedbackRef?.current?.value
          })
        });
      }
      const response = await fetch(`/api/myPage/deleteAccount`, {
        method: "POST",
        body: JSON.stringify({ userId: data?.user_id })
      });

      if (response.ok) {
        router.replace("/");
        await fetch(`/api/myPage/logout`);
        queryClient.removeQueries({ queryKey: ["user"] });
        toast.success("회원탈퇴가 완료되었습니다.");
      }
    }, 2000);
  };

  return (
    <>
      <Modal />
      <div className="w-full h-full">
        <div className="md:w-8/12 flex flex-col justify-center items-center pb-[130px]">
          <div className="min-w-[343px] min-h-[calc(100%-400px)] flex flex-col relative justify-between ml-8 mr-8 font-bold">
            <h1 className="text-2xl mt-10 mb-2.5 leading-7">{data?.nickname} 님,</h1>
            <h1 className="text-2xl leading-7">정말 탈퇴하시겠어요?</h1>
            <h1 className="text-base text-gray-900 font-medium mt-5 mb-2.5">떠나시는 이유를 알려주세요.</h1>
            <textarea
              placeholder={placeholder}
              ref={feedbackRef}
              className="min-w-[343px] h-48 p-5 rounded-[32px] bg-system-white border-2 border-gray-200 focus:border-pai-400 text-sm focus:outline-none resize-none"
            />
            <div className="relative mt-8">
              <div className="absolute">
                <Notification />
              </div>
              <p className="text-sm ml-7 mr-5">
                추후 동일 계정으로 재가입하셔도 <br /> 투두와 다이어리 내역은 복구되지 않아요.
              </p>
            </div>
            <div
              onClick={handleNotificationClick}
              className={`z-10 h-10 relative mt-10 ${isAgreement ? "text-pai-400" : "text-gray-400"}`}
            >
              <div className="absolute left-2">
                <AgreeBtn />
              </div>
              <p
                className={` text-center text-sm font-medium text-gray-400 ${isAgreement && "text-pai-400"} hover:cursor-pointer`}
              >
                회원 탈퇴 유의사항을 확인하였으며, 동의합니다.
              </p>
            </div>
            <div onClick={handleClickDelete} className="-mt-6 z-1">
              <SubmitBtn text="회원 탈퇴" type="button" isDisabled={isDisabled} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteAccount;
