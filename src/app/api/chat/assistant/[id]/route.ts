import { handleSaveChatTodo } from "@/app/api/lib/chatTodoItemUtils";
import {
  extractTodoItemsFromResponse,
  formatTodoList,
  getTodoRequestType,
  getTodoSystemMessage
} from "@/app/api/lib/todoPatterns";
import { CHAT_SESSIONS } from "@/lib/constants/tableNames";
import openai from "@/lib/utils/chat/openaiClient";
import { Message, MessageWithButton } from "@/types/chat.session.type";
import { Json } from "@/types/supabase";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createClient();

  const { id: sessionId } = params;

  try {
    const { data, error } = await supabase
      .from(CHAT_SESSIONS)
      .select("messages")
      .eq("session_id", sessionId)
      .eq("ai_type", "assistant")
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let messages = (data[0]?.messages as Json[]) || [];

    if (messages.length === 0) {
      // 웰컴 메시지 한 개인 경우
      const welcomeMessage: MessageWithButton = {
        role: "assistant",
        content: "안녕하세요, 저는 당신의 AI 비서 PAi입니다. 필요하신 게 있다면 저에게 말씀해주세요.",
        created_at: new Date().toISOString(),
        showSaveButton: false
      };

      // 웰컴 메시지 여러 개인 경우
      const welcomeMessages: MessageWithButton[] = [
        {
          role: "assistant",
          content:
            "안녕하세요, 저는 당신의 AI 비서 PAi입니다. 투두리스트 작성 및 추천, 간단한 질문 답변 등 다양한 업무를 도와드릴 수 있습니다. 필요하신 게 있다면 저에게 말씀해주세요.",
          created_at: new Date().toISOString(),
          showSaveButton: false
        },
        {
          role: "assistant",
          content: "투두리스트를 작성하려면 아래 '투두리스트 작성하기' 버튼을 눌러주세요.",
          created_at: new Date(Date.now() + 1).toISOString(), // 1ms 후의 시간으로 설정
          showSaveButton: false
        }
      ];

      // 웰컴 메시지를 데이터베이스에 저장
      await supabase
        .from(CHAT_SESSIONS)
        .update({ messages: welcomeMessages })
        .eq("session_id", sessionId)
        .eq("ai_type", "assistant");

      return NextResponse.json({
        message: [...welcomeMessages].filter(Boolean)
      });
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

  const { message, saveTodo, todoMode, currentTodoList } = await request.json();

  let showSaveButton = false;
  let systemMessage = "";
  let askForListChoice = false;
  let todoItems: string[] = [];
  let updatedTodoList = [...currentTodoList];

  // 투두리스트 저장하는 로직
  if (saveTodo) {
    try {
      const result = await handleSaveChatTodo(supabase, sessionId);
      if (result.success) {
        todoItems = [];
        updatedTodoList = [];
        console.log("todoItems saveTodo => ", todoItems);
        return NextResponse.json({ message: result.message });
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({ error: "An error occurred while saving todo list." }, { status: 500 });
    }
  }

  try {
    // 사용자 메시지 저장
    const { data: sessionData, error: sessionError } = await supabase
      .from(CHAT_SESSIONS)
      .select("messages")
      .eq("session_id", sessionId)
      .single();

    // console.log("Saving user message to Supabase", userData);

    if (sessionError) {
      console.error("Error fetching session data : ", sessionError);
      return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }

    let messages = (sessionData?.messages as Message[]) || [];
    const userMessage: Message = { role: "user", content: message, created_at: new Date().toISOString() };
    messages.push(userMessage);

    // systemMessage 설정
    let todoRequestType = getTodoRequestType(message, todoMode, currentTodoList);

    systemMessage = getTodoSystemMessage(todoRequestType, currentTodoList);
    console.log("systemMessage => ", systemMessage);

    // Open API 호출
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // 이전 메시지들을 포함하여 ai가 현재의 대화 흐름을 파악할 수 있도록 이해돕기
        ...messages.map(
          (m): ChatCompletionMessageParam => ({ role: m.role as "system" | "user" | "assistant", content: m.content })
        ),
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "system",
          content: "너는 투두리스트를 작성하고, 상세한 투두리스트를 추천하는데 도움을 주는 ai야. "
        },
        // {
        //   role: "system",
        //   content:
        //     "너는 투두리스트를 작성하고, 상세한 투두리스트를 추천하는데 도움을 주는 ai야. 답변은 JSON 형식으로 반환해줘. 키워드는 todo_list, title, description, time, location으로 해줘."
        // },
        { role: "user", content: message }
      ] as ChatCompletionMessageParam[],
      temperature: 0
      // response_format: { type: "json_object" }
    });

    let aiResponse = completion.choices[0].message.content;
    console.log("OpenAI API Response", completion.choices[0].message);
    aiResponse = aiResponse ? aiResponse.replace(/^[•*]\s*|\d+\.\s*/gm, "").trim() : "";
    console.log("=========================");
    console.log("aiResponse => ", aiResponse);

    console.log("todoMode => ", todoMode);
    console.log("todoRequestType => ", todoRequestType);

    // ai한테 새로 보내는 투두에 대한 응답
    todoItems = extractTodoItemsFromResponse(aiResponse, todoRequestType, currentTodoList);
    console.log("=========================");
    console.log("todoItems 1 => ", todoItems);
    console.log("currentTodoList => ", currentTodoList);

    // todoRequestType에 따른 todoList 응답 받기
    if (todoMode === "createTodo") {
      if (todoRequestType === "create") {
        console.log("create => ", todoRequestType);
        updatedTodoList = [...new Set([...updatedTodoList, ...todoItems])];
        showSaveButton = todoItems.length > 0; // 항목이 추가된 경우에만 save 버튼 표시
      } else if (todoRequestType === "add") {
        console.log("add => ", todoRequestType);
        updatedTodoList = [...new Set([...updatedTodoList, ...todoItems])];
        showSaveButton = todoItems.length > 0;
      } else if (todoRequestType === "delete") {
        console.log("delete");
        if (todoItems.length > 0) {
          updatedTodoList = todoItems;
        } else {
          console.log("No items to delete found");
        }
        console.log("delete updatedTodoList => ", updatedTodoList);
        showSaveButton = todoItems.length > 0;
      } else if (todoRequestType === "update") {
        console.log("update");
        showSaveButton = todoItems.length > 0;
      } else if (todoRequestType === "recommend") {
        console.log("recommend");
        console.log("recommendTodo", todoItems);
        updatedTodoList = todoItems;
        showSaveButton = todoItems.length > 0;
      }
    } else if (todoMode === "resetTodo") {
      console.log("reset");
      updatedTodoList = [];
      showSaveButton = false;
    } else {
      console.log("Unknown todoMode");
    }

    console.log("=========================");
    console.log("Final updatedTodoList", updatedTodoList);

    // 모든 케이스에 대해 formatTodoList 적용
    let todoListResponse = "";
    // todoListResponse = `${formatTodoList(updatedTodoList ?? [])}`;
    const formattedResponse = `${formatTodoList(todoItems ?? [])}`;
    // todoListResponse = aiResponse ? aiResponse.replace(/^([•*]\s*)?\d*\.\s*/, "").trim() : "";
    console.log("=========================");
    console.log("formattedResponse => ", formattedResponse);

    const aiMessage: Message = {
      role: "assistant",
      content: todoItems.length > 0 ? (formattedResponse ?? "") : aiResponse,
      created_at: new Date().toISOString()
    };
    messages.push(aiMessage);

    // 업데이트 된 매시지 저장
    const { error: updatedError } = await supabase
      .from(CHAT_SESSIONS)
      .update({
        messages: messages,
        updated_at: new Date().toISOString()
      })
      .eq("session_id", sessionId)
      .eq("ai_type", "assistant");

    if (updatedError) {
      console.error("Error updating session", updatedError);
      return NextResponse.json({ error: "Failed to updated session" }, { status: 500 });
    }

    const saveButtonMessage: Message = {
      role: "assistant",
      content:
        "나열된 내용을 투두리스트에 추가하고 싶다면 '저장하기' 버튼을, 모두 삭제하고 싶다면 '초기화 하기' 버튼을 눌러주세요",
      created_at: new Date().toISOString()
    };

    const todoListCompleted = aiResponse?.includes("투두리스트 작성이 완료되었습니다.");
    const hasNewTodoItems = todoItems.length > 0 && todoItems.some((item: string) => !currentTodoList.includes(item));

    console.log("todoItems 2 => ", todoItems);

    return NextResponse.json({
      message: [
        { ...userMessage },
        { ...aiMessage },
        showSaveButton ? { ...saveButtonMessage, showSaveButton } : null
      ].filter(Boolean),
      todoListCompleted,
      newTodoItems: hasNewTodoItems ? todoItems : [],
      currentTodoList: updatedTodoList,
      // currentTodoList: todoItems,
      askForListChoice
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
};
