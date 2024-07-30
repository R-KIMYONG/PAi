import { SetStateAction } from "react";

type PropsType = {
  isModalOpen: boolean;
  setIsModalOpen: (value: SetStateAction<boolean>) => void;
};

const ResendEmailModal = ({ isModalOpen, setIsModalOpen }: PropsType) => {
  const handleResendBtn = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="min-w-[300px] min-h-[177px] bg-white rounded-[32px]">
          <div className="flex flex-col justify-center items-center">
            <h2 className=" mt-[30px] mb-[30px] font-semibold text-base">비밀번호 재설정 메일을 재발송할까요?</h2>
            <button onClick={handleResendBtn} className="rounded-[24px]">
              이메일 재발송하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResendEmailModal;
