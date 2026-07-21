import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@context/AuthContext";
import ProtectedRoute from "@components/ProtectedRoute";
import Layout from "@components/Layout";

import ReactGA from 'react-ga4';
import usePageTracking from "./hooks/usePageTracking";

import Login from "@pages/Login";
import Places from "@pages/Places";
import PlaceDetail from "@pages/PlaceDetail";
import Favorites from "@pages/Favorites";
import Events from "@pages/Events";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Home from "./pages/Home";
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
import UsersAdmin from "./pages/UsersAdmin";
import SiteSettingsAdmin from "./pages/SiteSettingsAdmin";
import GASetup from "./components/GASetup";
import NotFound from "./pages/NotFound";


// 👇 CRUD unificado de contactos
import { ListContacts, CreateContact, EditContact } from "./pages/ContactManager";

// 👇 Página pública de contactos
import Contact from "./pages/Contact";

export default function App() {
  


  return (
    <HelmetProvider>
    <AuthProvider>
      <BrowserRouter>
      <GASetup />
        <Routes>
          {/* Rutas con el mismo layout (Navbar fijo) */}
          <Route element={<Layout />}>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/places" element={<Places />} />
            <Route path="/places/:slug" element={<PlaceDetail />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/events" element={<Events />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/como-llegar" element={<ComoLlegar />} />
            <Route path="/informacion" element={<Informacion />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />

            {/* Admin / privadas */}
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
                <ProtectedRoute roles={["admin", "editor"]}>
                  <ReviewsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-event"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            {/* 👇 NUEVAS rutas correctas para Contactos (protegidas) */}
            <Route
              path="/admin/contactos"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <ListContacts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contactos/nuevo"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <CreateContact />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contactos/:id/editar"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <EditContact />
                </ProtectedRoute>
              }
            />

            {/* 👇 elimina esta si aún la tenías, ya no se usa */}
            {/* <Route path="/admin/create-contact" element={<ProtectedRoute><CreateContact /></ProtectedRoute>} /> */}

            <Route
              path="/admin/gallery"
              element={
                <ProtectedRoute>
                  <GalleryAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <UsersAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/site-info"
              element={
                <ProtectedRoute roles={["admin", "editor"]}>
                  <SiteSettingsAdmin />
                </ProtectedRoute>
              }
            />

            {/* 404: dentro del Layout para que conserve el Navbar */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
}
