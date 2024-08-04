"use client";
import { useLayoutEffect, useState } from "react";
import ChatbotTap from "./icons/navigationBarIcons/ChatbotTap";
import DiaryTap from "./icons/navigationBarIcons/DiaryTap";
import MypageTap from "./icons/navigationBarIcons/MypageTap";
import TodolistTap from "./icons/navigationBarIcons/TodolistTap";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const NavigationIcon = [
  { component: TodolistTap, key: "todolist", path: "/todo-list" },
  { component: ChatbotTap, key: "chatbot", path: "/chat" },
  { component: DiaryTap, key: "diary", path: "/diary" },
  { component: MypageTap, key: "mypage", path: "/my-page" }
];

const NavigationBar = () => {
  const [selectedIcon, setSelectedIcon] = useState<number>(0);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (index: number, path: string) => {
    setSelectedIcon(index);
    router.push(path);
  };

  useLayoutEffect(() => {
    const currentIndex = NavigationIcon.findIndex(({ path }) => path === pathname);
    if (currentIndex !== -1 && currentIndex !== selectedIcon) {
      setSelectedIcon(currentIndex);
    }
  }, [pathname, selectedIcon]);

  return (
    <div className="w-full absolute bottom-0 left-1/2 transform -translate-x-1/2 right-0 h-20 z-10">
      <div className="w-[calc(100%-32px)] mobile:mx-auto desktop:w-[500px] desktop:mx-auto h-[76px] rounded-full items-center bg-grayTrans-90020 backdrop-blur-3xl shadow-inner p-1">
        <nav className="h-full">
          <ul className="flex justify-between h-full items-center">
            {NavigationIcon.map(({ component: Icon, key, path }, index) => (
              <li
                key={key}
                className={`w-1/4 h-full rounded-full flex items-center justify-center transition-all duration-300 ease-in-out relative ${
                  selectedIcon === index
                    ? "w-full max-h-[4.3rem] bg-gradient-pai400-fai500-br"
                    : "max-w-[4.3rem] max-h-[4.3rem] min-w-[4.3rem] min-h-[4.3rem] bg-[#f4f4f4f3]"
                }`}
                onClick={() => {
                  handleNavigation(index, path);
                }}
              >
                <Icon isSelected={selectedIcon === index} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default NavigationBar;
