import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/shared/ui/drawer";
import AddTodoForm, { TodoFormData } from "./AddTodoForm";
import dayjs from "dayjs";
import { useState } from "react";
import AddTodoBtn from "./AddTodoBtn";
import { IoCloseCircleOutline } from "react-icons/io5";

interface AddTodoDrawerProps {
  onSubmit?: (data: TodoFormData) => Promise<void>;
  selectedDate: Date;
}

const AddTodoDrawer = ({ onSubmit, selectedDate }: AddTodoDrawerProps) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleSubmit = async (data: TodoFormData) => {
    await onSubmit?.(data);
    setOpen(false);
  };

  return (
    <Drawer open={open}>
      <AddTodoBtn onClick={() => setOpen(true)} />
      <DrawerContent onPointerDownOutside={() => setOpen(false)} className="h-[739px] rounded-t-[48px]">
        <DrawerHeader>
          <DrawerTitle className="text-gray-600 font-normal font-md">
            {dayjs(selectedDate).format("YYYY년 M월 D일 ddd요일")}
          </DrawerTitle>
          <div className="absolute top-6 right-6">
            <IoCloseCircleOutline className="w-8 h-8 text-gray-400 cursor-pointer" onClick={() => setOpen(false)} />
          </div>
        </DrawerHeader>
        <AddTodoForm onSubmit={handleSubmit} />
      </DrawerContent>
    </Drawer>
  );
};

export default AddTodoDrawer;
