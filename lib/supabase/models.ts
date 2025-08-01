export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  user_id: string;
}

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  sort_order: number;
  created_at: string;
}

// Additional types for a more comprehensive system

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface Label {
  id: string;
  board_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface TaskLabel {
  id: string;
  task_id: string;
  label_id: string;
  created_at: string;
}

export type TaskWithDetails = Task & {
  comments: Comment[];
  attachments: Attachment[];
  labels: Label[];
  assignee_details?: User | null;
};

export type BoardWithColumns = Board & {
  columns: ColumnWithTasks[];
};

export interface ActivityLog {
  id: string;
  board_id: string;
  user_id: string;
  action_type: string;
  target_type: "task" | "column" | "board" | "comment" | "attachment";
  target_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface BoardMember {
  id: string;
  board_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface TaskFilterOptions {
  assignee?: string | null;
  priority?: ("low" | "medium" | "high")[];
  due_date?: {
    from?: string | null;
    to?: string | null;
  };
  labels?: string[];
  search?: string;
}

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
