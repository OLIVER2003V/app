// src/components/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import EventAnnouncement from "./EventAnnouncement";

export default function Layout() {
  return (
    <div>
      <Navbar />
      {/* pb-16 deja espacio para la barra fija inferior en móvil */}
      <div className="pb-16 lg:pb-0">
        <Outlet />
      </div>
      <EventAnnouncement />
    </div>
  );
}
