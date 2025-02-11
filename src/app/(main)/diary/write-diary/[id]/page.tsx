"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/utils/supabase/client";
import { DIARY_TABLE } from "@/lib/constants/tableNames";
import { DiaryContentType, DiaryData } from "@/types/diary.type";

const DiaryEditDetail = dynamic(() => import("@/app/(main)/diary/_components/DiaryEditDetail"), { ssr: false });

const importDiaryToEdit = async (id: string) => {
  const supabase = createClient();

  try {
    const { data, error } = await supabase.from(DIARY_TABLE).select("*").eq("diary_id", id).single();
    if (error) {
      console.error("importDiaryToEdit function error", error);
      return null;
    }
    if (data && Array.isArray(data.content)) {
      const diaryDetail = {
        diary_id: data.diary_id,
        created_at: data.created_at.split("T")[0],
        content: data.content
      };
      return diaryDetail as DiaryData;
    }
  } catch (error) {
    console.error("ImportDiaryToEdit Error", error);
  }
};

const WriteDiaryPage = () => {
  const [pageData, setPageData] = useState<DiaryContentType | null>(null);
  const searchParams = useSearchParams();
  const params = useParams();
  const diary_id = params.id as string;
  const contentIndex = Number(searchParams.get("itemIndex"));
  useEffect(() => {
    const fetchData = async () => {
      if (!diary_id) return;

      const diaryContent = await importDiaryToEdit(diary_id);
      if (!diaryContent || !diaryContent.content[contentIndex]) {
        console.error("Invalid diary content:", diaryContent);
        return;
      }
      try {
        setPageData(diaryContent?.content[contentIndex]);
      } catch (error) {
        console.error("Error parsing data:", error);
      }
    };

    fetchData();
  }, [diary_id, contentIndex]);
  if (!pageData) {
    return (
      <span className="pai-loader w-full h-screen flex flex-col items-center text-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
    );
  }
  return <DiaryEditDetail pageData={pageData} />;
};

export default WriteDiaryPage;
