import { TodoListType } from "@/types/diary.type";
import DiaryTextEditor from "./DiaryTextEditor";

interface DiaryEditDetailProps {
  pageData: { title: string; content: string; diary_id: string };
}

const DiaryEditDetail: React.FC<DiaryEditDetailProps> = ({ pageData }) => {
  const { title, content, diary_id } = pageData;
  return (
    <div className="bg-gray-100">
      <DiaryTextEditor diaryTitle={title} diaryContent={content} diaryId={diary_id} />
    </div>
  );
};

export default DiaryEditDetail;
