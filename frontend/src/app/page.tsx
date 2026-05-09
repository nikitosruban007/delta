import { redirect } from "next/navigation";

export default function HomePage() {
  // Миттєвий редирект на твою сторінку
  redirect("/jury/eco-quest");
}