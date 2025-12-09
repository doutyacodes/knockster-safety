// app/page.js
import { redirect } from 'next/navigation';

export default async function HomePage() {
  try {
    const res = await fetch('/api/user/me', {
      method: "GET",
      credentials: "include", // allows cookies
    });

    if (!res.ok) {
      redirect('/auth/login');
    }

    const data = await res.json();
    console.log("data", data)
    const role = data?.user?.role?.name;

    if (!role) {
      redirect('/auth/login');
    }

    // Redirect based on role
    switch (role) {
      case 'super_admin':
        redirect('/super-admin/dashboard');
      case 'org_admin':
        redirect('/org-admin/dashboard');
      case 'moderator':
        redirect('/moderator/dashboard');
      default:
        redirect('/auth/login');
    }
  } catch (error) {
    redirect('/auth/login');
  }
}
