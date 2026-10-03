import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AppLayout() {
  return <div className="flex min-h-screen flex-col"><Navbar /><div className="flex-1"><Outlet /></div><Footer /></div>;
}
