"use client";

import Form from "@/components/Form/Form";
import FormControls from "@/components/Form/FormControls/FormControls";
import Layout from "@/components/Layout/Layout";
import { FormView } from "@/types/forms";
import { useState } from "react";

export default function Home() {
  const [formViews, setFormViews] = useState<FormView[]>([
    {
      label: "About You",
      questions: [
        { label: "What's your name?", questionType: "text" },
        { label: "What's your email?", questionType: "text" }
      ]
    },
    {
      label: "Skills",
      questions: [
        { label: "What's your primary skill?", questionType: "single-select" },
        { label: "Select all technologies you know", questionType: "multiple-select" }
      ]
    },
    {
      label: "Experience",
      questions: [
        { label: "Years of experience?", questionType: "text" },
        { label: "Previous company", questionType: "text" }
      ]
    },
    {
      label: "Contact",
      questions: [
        { label: "Phone number", questionType: "text" },
        { label: "Preferred contact method", questionType: "single-select" }
      ]
    }
  ]);

  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const handleViewChange = (newViews: string[]) => {
    // Update formViews when FormControls changes the page order
    const updatedViews = newViews.map(viewLabel => {
      const existingView = formViews.find(view => view.label === viewLabel);
      return existingView || { label: viewLabel, questions: [] };
    });
    setFormViews(updatedViews);
  };

  const handleAddView = (viewLabel: string) => {
    const newView: FormView = {
      label: viewLabel,
      questions: []
    };
    setFormViews([...formViews, newView]);
  };

  const handleDeleteView = (viewLabel: string) => {
    setFormViews(formViews.filter(view => view.label !== viewLabel));
  };

  const handleRenameView = (oldLabel: string, newLabel: string) => {
    setFormViews(formViews.map(view =>
      view.label === oldLabel ? { ...view, label: newLabel } : view
    ));
  };

  const currentView = formViews[currentViewIndex] || formViews[0];

  return (
    <div>
      <Layout>
        <div className="flex w-full items-center justify-center h-full flex-col gap-4">
          <Form
            questions={currentView?.questions || []}
            viewLabel={currentView?.label || ""}
          />
          <div className="w-full flex items-center">
            <FormControls
              views={formViews}
              onViewsChange={handleViewChange}
              onAddView={handleAddView}
              onDeleteView={handleDeleteView}
              onRenameView={handleRenameView}
              currentViewIndex={currentViewIndex}
              onViewIndexChange={setCurrentViewIndex}
            />
          </div>
        </div>
      </Layout>
    </div>
  );
}