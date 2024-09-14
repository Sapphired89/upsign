import { User } from "firebase/auth";
import { Firestore } from "firebase/firestore";

export type UserType = "student" | "teacher";

export type RootContext = {
  db: Firestore,
  user: User,
  userType: UserType,
}

export type Session = {
  capacity: number,
  id: string,
  number_enrolled: number,
  restricted_to?: string | string[],
  room?: string,
  session: number,
  subtitle?: string,
  teacher: string | null,
  teacher_id?: string,
  title?: string,
}

export type UpsignUser = {
  email: string,
  name: string,
  type: string,
  uid?: string,
  groups?: string[],
  nickname?: string,
}

export type Attendance = "present" | "tardy" | "absent" | "" | null;

export type Enrollment = {
  id?: string;
  attendance?: Attendance;
  name: string;
  session?: number;
  session_id?: string;
  teacher_id?: string;
  uid?: string;
  flag?: string;
  locked?: boolean;
  nickname?: string;
}

export type DefaultDayOption = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "today" | "tomorrow";