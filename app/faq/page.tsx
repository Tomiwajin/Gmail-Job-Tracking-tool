import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b w-screen md:w-full">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold">FAQ</h1>
        </div>
      </div>
    </div>
  );
};

export default page;
