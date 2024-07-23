import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";

interface Todo {
  todo_id: string;
  user_id: string;
  todo_title: string;
  todo_description?: string;
  event_datetime: Date;
  address?: {
    lat: number;
    lng: number;
  };
  is_done: boolean;
  created_at: Date;
}

interface TodoListProps {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "todo_id">) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, addTodo }) => {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: ""
      }}
      events={todos.map((todo) => ({
        title: todo.todo_title
        // start: dayjs(todo.event_datetime).toISOString()
      }))}
      dateClick={(info) => {
        const title = prompt("투두를 입력하세요");
        if (title) {
          addTodo({
            user_id: "example-user",
            todo_title: title,
            todo_description: "",
            event_datetime: new Date(info.dateStr),
            address: {
              lat: 0,
              lng: 0
            },
            is_done: false,
            created_at: new Date()
          });
        }
      }}
    />
  );
};

export default TodoList;
