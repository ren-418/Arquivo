import React from "react";
import BaseLayout from "@/layout/BaseLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner"

export const RootRoute = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <BaseLayout>
      {/* <Toaster /> */}
      <Outlet />
    </BaseLayout>
  );
}
