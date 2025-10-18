import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import ProtectedRoute from "@components/ProtectedRoute";
import Layout from "@components/Layout";

import Login from "@pages/Login";
import Places from "@pages/Places";
import PlaceDetail from "@pages/PlaceDetail";
import Events from "@pages/Events";
import Dashboard from "@pages/Dashboard";
import Home from "./pages/Home";
// Si tu archivo es src/pages/CreatePost.jsx usa esta línea:
import CreatePost from "./pages/CreatePost";
import PostsAdmin from "./pages/PostsAdmin";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import PlacesAdmin from "./pages/PlacesAdmin";
import ReviewsAdmin from "./pages/ReviewsAdmin";
import ComoLlegar from "./pages/ComoLlegar";
import Informacion from "./pages/Informacion";
import CreateEvent from "./pages/CreateEvent";
import GalleryAdmin from "./pages/GalleryAdmin";
import { ListContact, CreateContact, EditContact } from "./pages/CreateContact";
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas que comparten el mismo layout (Navbar fijo) */}
          <Route element={<Layout />}>
            {/* públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/places" element={<Places />} />
            <Route path="/places/:slug" element={<PlaceDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="contactos" element={<ListContacts />} />
            <Route path="contactos/nuevo" element={<CreateContact />} />
            <Route path="contactos/:id/editar" element={<EditContact />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/como-llegar" element={<ComoLlegar />} />
            <Route path="/informacion" element={<Informacion />} />
            <Route path="/login" element={<Login />} />
            {/* privadas (anidar con ProtectedRoute como “gate”) */}
            <Route
              path="/admin/posts/new"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <CreatePost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
            path="/admin/posts"
            element={
                <ProtectedRoute roles={["admin", "editor"]}>
                <PostsAdmin />
                </ProtectedRoute>
            }
            />
            <Route
              path="/admin/places"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <PlacesAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute roles={["admin"]}> {/* Usualmente solo el admin puede moderar */}
                  <ReviewsAdmin />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
            <Route path="/admin/create-contact" element={<ProtectedRoute><CreateContact /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute><GalleryAdmin /></ProtectedRoute>} />
          </Route> 
          

          {/* login puede ir fuera del layout si no quieres mostrar el Navbar */}
          

          {/* 404 opcional */}
          <Route path="*" element={<div style={{ padding: 20 }}>Página no encontrada</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
