import NextBtn from "@/components/icons/authIcons/NextBtn";
import SkeletonBar from "./SkeletonBar";
import EmailSmall from "@/components/icons/myPage/EmailSmall";
import NicknameSmall from "@/components/icons/myPage/NicknameSmall";
import PasswordSmall from "@/components/icons/myPage/PasswordSmall";

const MyInfoSkeleton = () => {
  return (
    <>
      <div className="w-full h-full">
        <div className="animate-pulse md:w-8/12 flex flex-col justify-center items-center mt-5 h-full">
          <div className="animate-pulse min-w-[343px] min-h-[60px] flex flex-col justify-between ">
            <h1 className="w-full text-[22px] text-gray-300 font-bold leading-7">회원님,</h1>
            <h3 className="text-lg text-gray-300 font-bold leading-7">당신의 하루를 늘 응원해요!</h3>
          </div>
          <div className="h-[180px] flex justify-center items-end">
            <SkeletonBar />
          </div>
          <div
            style={{ boxShadow: "0px 0px 8px 0px rgba(0, 0, 0, 0.16)" }}
            className="w-full min-h-[480px] max-w-[390px] mt-5 pt-5 px-4 rounded-t-[48px] bg-system-white h-full"
          >
            <h1 className="w-[343px] h-7 flex items-center pl-3 text-gray-300 font-extrabold text-base">설정</h1>
            <ul>
              <li
                className={`relative min-w-[343px] h-16 flex items-center px-3 py-5 border-b-[1px] border-gray-100 text-gray-300 `}
              >
                <EmailSmall />
                <p className="flex items-center h-[28px] ml-1 text-gray-300  font-medium text-base">이메일 계정</p>
                <p className="absolute right-2 text-gray-300 font-medium text-base"></p>
              </li>
              <li className="relative min-w-[343px] h-16 flex items-center px-3 py-5 border-b-[1px] border-gray-100 duration-200 text-gray-300">
                <NicknameSmall />
                <p className="flex items-center h-[28px] ml-1 text-gray-300  font-medium text-base">닉네임 변경</p>
                <div className="absolute right-2">
                  <NextBtn />
                </div>
              </li>
              <li className="relative min-w-[343px] h-16 flex items-center px-3 py-5 border-b-[1px]  border-gray-100 duration-200 text-gray-300">
                <PasswordSmall />
                <p className="flex items-center h-[28px] ml-1 text-gray-300  font-medium text-base">비밀번호 변경</p>
                <div className="absolute right-2">
                  <NextBtn />
                </div>
              </li>
              <li className="relative min-w-[343px] h-16 mt-5 flex items-center px-3 py-5 border-b-[1px]  border-gray-100 duration-200 text-gray-800 font-medium text-base">
                <p className="text-gray-300  font-medium text-base">로그아웃</p>
                <div className="absolute right-2">
                  <NextBtn />
                </div>
              </li>
              <li className="relative min-w-[343px] h-16 flex items-center px-3 py-5 border-b-[1px]  border-gray-100 duration-200 text-gray-800 font-medium text-base">
                <p className="text-gray-300  font-medium text-base">회원탈퇴</p>
                <div className="absolute right-2">
                  <NextBtn />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyInfoSkeleton;
