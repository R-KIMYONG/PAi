import { useState } from "react";
import TimeSelect from "@/shared/TimeSelect";
import { useUserData } from "@/hooks/useUserData";
import { IoCheckmarkCircleOutline, IoLocationOutline, IoReaderOutline, IoTimeOutline } from "react-icons/io5";

export type TodoFormData = {
  title: string;
  description: string;
  eventTime: [number, number] | null;
  address: {
    lat: number;
    lng: number;
  } | null;
};
export interface AddTodoFormProps {
  onSubmit?: (data: TodoFormData) => void;
}

const AddTodoForm = ({ onSubmit }: AddTodoFormProps) => {
  const { data } = useUserData();
  const userId = data?.user_id;

  const [formData, setFormData] = useState<TodoFormData>({
    title: "",
    description: "",
    eventTime: [0, 0],
    address: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    if (!userId) return;
    e.preventDefault();
    onSubmit?.(formData);
    setFormData({
      title: "",
      description: "",
      eventTime: [0, 0],
      address: null
    });
  };

  if (!userId) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-md">
        <ul className="flex flex-col gap-4 w-full px-4">
          <li className="flex items-center border-b-gray-400 w-full h-8 justify-center">
            <IoCheckmarkCircleOutline className="text-pai-400 w-[18.3px] h-[18.3px] mr-3" />
            <input
              type="text"
              placeholder="제목을 입력해주세요."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="flex-1"
            />
          </li>
          <li className="flex items-center w-full h-8 justify-center">
            <IoReaderOutline className="w-5 h-5 text-gray-700 mr-3" />
            <input
              placeholder="메모"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="flex-1"
            />
          </li>
          <li className="flex items-center w-full h-8 justify-center">
            <IoTimeOutline className="w-5 h-5 text-gray-700 mr-3" />
            <div className="flex-1">
              <TimeSelect
                value={formData.eventTime ?? undefined}
                onChange={(value) => setFormData((prev) => ({ ...prev, eventTime: value ?? null }))}
              />
            </div>
          </li>
          <li className="flex items-center w-full h-8 justify-center">
            <IoLocationOutline className="w-5 h-5 text-gray-700 mr-3" />
            <button className="text-gray-400 flex-1 text-left">장소 선택</button>
          </li>
        </ul>
        <button
          type="submit"
          className="w-[calc(100%-32px)] h-11 bg-gray-200 text-system-white rounded-[24px] my-4 mx-auto"
        >
          추가하기
        </button>
      </form>
    </div>
  );
};

export default AddTodoForm;
