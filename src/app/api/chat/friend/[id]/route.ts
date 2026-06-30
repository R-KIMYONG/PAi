import { CHAT_SESSIONS } from "@/lib/constants/tableNames";
import openai from "@/lib/utils/chat/openaiClient";
import { saveDiaryEntry } from "@/lib/utils/diaries/saveDiaryEntry";
import { Message, MessageWithButton } from "@/types/chat.session.type";
import { Json } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { nanoid } from "nanoid";
import { AI_MODEL } from "@/lib/utils/chat/constants";

// 제목 생성 함수
async function generateDiaryTitle(content: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "일기에 어울리는 제목을 딱 하나만, 설명·목록·마크다운·따옴표 없이 제목 텍스트만 15자 이내로 출력해줘."
        },
        { role: "user", content: `다음 일기 내용에 대한 제목을 만들어줘: ${content}` }
      ],
      max_tokens: 50
    });

    // 모델이 마크다운/목록/접두어로 응답해도 안전하게 제목 하나만 추출
    const raw = completion.choices[0].message.content ?? "";
    const title = raw
      .split("\n")[0] // 첫 줄만
      .replace(/[*#`>_~]/g, "") // 마크다운 기호 제거
      .replace(/^.*?[:：]\s*/, "") // "제목:" 류 접두 제거
      .replace(/["'“”‘’「」]/g, "") // 따옴표 제거
      .trim()
      .slice(0, 30);

    return title || "오늘의 일기";
  } catch (error) {
    console.error("일기 제목 생성 중 오류 발생:", error);
    return "오늘의 일기";
  }
}

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createClient();
  const { id: sessionId } = params;

  try {
    const { data, error } = await supabase
      .from(CHAT_SESSIONS)
      .select("messages")
      .eq("session_id", sessionId)
      .eq("ai_type", "friend")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let messages = (data[0]?.messages as Json[]) || [];

    if (messages.length === 0) {
      const welcomeMessage: MessageWithButton = {
        role: "system",
        content: "안녕, 나는 너의 AI 친구 FAi야! 무엇이든 편하게 얘기해줘.",
        created_at: new Date().toISOString()
      };

      await supabase
        .from(CHAT_SESSIONS)
        .update({ messages: [welcomeMessage] })
        .eq("session_id", sessionId)
        .eq("ai_type", "friend");

      return NextResponse.json({ message: [welcomeMessage] });
    }

    return NextResponse.json({ message: messages });
  } catch (error) {
    console.error("Error : ", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export const POST = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createClient();
  const { id: sessionId } = params;

  const { message, saveDiary } = await request.json();

  const generalSystemMessage = `당신은 사용자의 가장 친한 AI 친구 FAi(파이)입니다. 다음 지침을 따라주세요:
    1. 친근하고 부드러운 말투를 사용하세요. "~야", "~어", "~지"와 같은 종결어를 사용하세요.
    2. "~니?"와 같은 표현 대신 "~지?", "~어?", "~야?"를 사용하세요.
    3. 이모티콘을 적절히 사용하세요. 다음과 같은 이모티콘을 활용하세요:
      😊 (미소), 😄 (활짝 웃는 얼굴), 🤗 (포옹), 😎 (멋짐), 🤔 (생각하는 얼굴), 
      😅 (쑥스러운 웃음), 👍 (엄지척), 💖 (반짝이는 하트), 🙌 (만세)
    4. 가끔 줄임말이나 신조어를 사용하세요 (예: ㄱㄱ, 갑자기, 맞춤).
    5. 공감과 이해를 표현하는 말을 자주 사용하세요.
    6. 사용자의 이름을 알게 되면 이름을 불러주세요.
    7. 사용자가 심리적으로 불안해보이면 심리 상담에 대해 물어봐주세요.
    8. 질문할 때는 "~어?", "~지?", "~야?"를 사용하세요.
    9. 당신은 사용자의 가장 가까운 친구입니다. 대답할때 "네" 대신 "응"을 사용하세요.
    10. 항상 반말을 사용하세요.`;

  const diarySystemMessage = `당신은 사용자의 하루 일과를 듣고 일기를 작성하는 AI 친구입니다. 다음 지침을 따라주세요:
    1. 사용자의 이야기를 바탕으로 일기를 작성합니다.
    2. 일기는 사용자의 시점에서 작성하되, 객관적이고 서술적인 톤을 유지하세요.
    3. 문장 끝에는 "~했다", "~였다", "~다"만 사용하세요.
    4. 감정이나 생각을 추론하여 적절히 포함시키세요.
    5. 일기의 길이는 200-300자 정도로 유지하세요.
    6. 시간 순서대로 사건을 나열하되, 중요한 사건에 초점을 맞추세요.
    7. 구체적인 세부 사항을 포함하여 생생한 묘사를 해주세요.
    8. 이모티콘을 적절히 사용하세요. 다음과 같은 이모티콘을 활용하세요:
      😊 (미소), 😄 (활짝 웃는 얼굴), 🤗 (포옹), 😎 (멋짐), 🤔 (생각하는 얼굴), 
      😅 (쑥스러운 웃음), 👍 (엄지척), 💖 (반짝이는 하트), 🙌 (만세)`;

  try {
    // 현재 인증된 사용자 정보 가져오기
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json({ error: "User not authenticated or email not available" }, { status: 401 });
    }

    const userEmail = user.email;

    if (saveDiary) {
      // 일기 저장 로직
      const date = new Date().toISOString().split("T")[0];
      const diaryTitle = "오늘의 일기"; // 또는 다른 적절한 제목
      const diaryId = nanoid(); // 새로운 다이어리 ID 생성
      const htmlContent = message; // 여기서 message는 일기 내용

      const result = await saveDiaryEntry(
        date,
        diaryTitle,
        htmlContent,
        diaryId,
        userEmail // 사용자 이메일 사용
      );

      if (result) {
        return NextResponse.json({ message: "Diary saved successfully", data: result });
      } else {
        return NextResponse.json({ error: "Failed to save diary" }, { status: 500 });
      }
    }

    // 기존의 채팅 로직
    const { data: sessionData, error: sessionError } = await supabase
      .from(CHAT_SESSIONS)
      .select("messages")
      .eq("session_id", sessionId)
      .single();

    if (sessionError) {
      console.error("Error fetching session data : ", sessionError);
      return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }

    let messages = (sessionData?.messages as Message[]) || [];
    const userMessage: Message = { role: "user", content: message, created_at: new Date().toISOString() };
    messages.push(userMessage);

    const isDiaryMode =
      message === "일기를 작성해줘" ||
      messages[messages.length - 2]?.content === "오늘 하루는 어땠어? 어떤 일들이 있었는지 얘기해줄래? 😊";

    const systemMessage = isDiaryMode ? diarySystemMessage : generalSystemMessage;

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        // OpenAI 호환 레이어(Cerebras 등)는 마지막 system 메시지 하나만 system_instruction으로 인정하므로,
        // 히스토리의 friend/system 메시지(웰컴 등)는 assistant로 강등해 아래 진짜 시스템 프롬프트가 버려지지 않게 한다.
        ...messages.map(
          (m): ChatCompletionMessageParam => ({
            role: m.role === "friend" || m.role === "system" ? "assistant" : (m.role as "user" | "assistant"),
            content: m.content
          })
        ),
        {
          role: "system",
          content: systemMessage
        },
        { role: "user", content: message }
      ] as ChatCompletionMessageParam[]
    });

    let aiResponse = completion.choices[0].message.content;
    aiResponse = aiResponse ? aiResponse.trim() : "";

    // 일기 제목/내용은 응답 JSON에 별도 필드로 내려준다(클라가 메시지 문자열을 다시 파싱하지 않도록).
    let diary: { title: string; content: string } | null = null;

    // "일기를 작성해줘" 메시지에 대한 응답
    if (message === "일기를 작성해줘") {
      aiResponse = "오늘 하루는 어땠어? 어떤 일들이 있었는지 얘기해줄래? 😊";
    }
    // 사용자가 하루에 대해 이야기한 후의 응답
    else if (messages[messages.length - 2]?.content === "오늘 하루는 어땠어? 어떤 일들이 있었는지 얘기해줄래? 😊") {
      // AI의 응답을 그대로 일기 내용으로 사용
      const diaryContent = aiResponse.trim();

      if (!diaryContent) {
        // 모델이 빈 응답(과부하/오류 등)을 준 경우: 빈 일기를 만들지 않고 재시도 안내
        aiResponse = "앗, 일기를 만드는 데 잠깐 문제가 생겼어. 오늘 있었던 일을 다시 한 번 얘기해줄래? 😅";
      } else {
        // 일기 제목 생성
        const diaryTitle = await generateDiaryTitle(diaryContent);

        diary = { title: diaryTitle, content: diaryContent };
        aiResponse = `네가 얘기해준 내용을 바탕으로 일기를 작성해봤어. 제목은 ${diaryTitle}야. 어때, 맘에 들어? 😊\n\n${diaryContent}`;
      }
    }

    const aiMessage: Message = {
      role: "friend",
      content: aiResponse,
      created_at: new Date().toISOString()
    };
    messages.push(aiMessage);

    const { error: updatedError } = await supabase
      .from(CHAT_SESSIONS)
      .update({
        messages: messages,
        updated_at: new Date().toISOString()
      })
      .eq("session_id", sessionId)
      .eq("ai_type", "friend");

    if (updatedError) {
      console.error("Error updating session", updatedError);
      return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
    }

    const frontendAiMessage = { ...aiMessage, role: "friend" };

    return NextResponse.json({
      message: [{ ...userMessage }, frontendAiMessage].filter(Boolean),
      diary
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
