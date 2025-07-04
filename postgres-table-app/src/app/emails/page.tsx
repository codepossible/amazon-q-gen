"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EmailsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the email_message table in notifications schema
    router.push('/tables/email_message?schema=notifications');
  }, [router]);

  return (
    <div className="text-center py-10">
      <p>Redirecting to email messages...</p>
    </div>
  );
}