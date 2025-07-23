import '@/styles/dashboard.css'; // ✅ Make sure path is correct
import { ReactNode } from 'react';

export const metadata = {
  title: 'Dashboard | Smart Hustle Hub',
  description: 'Your smart dashboard for online hustle tools',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-wrapper">
      {children}
    </div>
  );
}
