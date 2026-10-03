import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader } from './components/UI';
import { useAuth } from './context/AuthContext';
import {
  AdminDashboard, Favorites, Home, Login, MyInquiries, MyProperties, NearbyProperties, NotFound,
  OwnerDashboard, OwnerInquiries, Properties, PropertiesManagement, PropertyDetails, PropertyForm,
  Register, UsersManagement
} from './pages/Pages';

export default function App() {
  const { loading } = useAuth();
  if (loading) return <Loader label="Preparing NearNest..." />;
  return <Routes><Route element={<AppLayout />}>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/properties" element={<Properties />} />
    <Route path="/properties/:id" element={<PropertyDetails />} />
    <Route element={<ProtectedRoute roles={['tenant']} />}>
      <Route path="/nearby" element={<NearbyProperties />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/my-inquiries" element={<MyInquiries />} />
    </Route>
    <Route element={<ProtectedRoute roles={['owner']} />}>
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/my-properties" element={<MyProperties />} />
      <Route path="/add-property" element={<PropertyForm />} />
      <Route path="/edit-property/:id" element={<PropertyForm editing />} />
      <Route path="/owner-inquiries" element={<OwnerInquiries />} />
    </Route>
    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UsersManagement />} />
      <Route path="/admin/properties" element={<PropertiesManagement />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route></Routes>;
}
