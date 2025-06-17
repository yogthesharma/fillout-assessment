import { Question } from "@/types/forms";
import React, { useState } from "react";

export interface FormPropTypes {
  questions: Question[];
  viewLabel: string;
}

const Form = (props: FormPropTypes) => {
  const { questions, viewLabel } = props;
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});

  const handleInputChange = (questionLabel: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [questionLabel]: value
    }));
  };

  const handleTextChange = (questionLabel: string, value: string) => {
    handleInputChange(questionLabel, value);
  };

  const handleSingleSelectChange = (questionLabel: string, value: string) => {
    handleInputChange(questionLabel, value);
  };

  const handleMultipleSelectChange = (questionLabel: string, option: string, checked: boolean) => {
    const currentValues = (formData[questionLabel] as string[]) || [];
    if (checked) {
      handleInputChange(questionLabel, [...currentValues, option]);
    } else {
      handleInputChange(questionLabel, currentValues.filter(v => v !== option));
    }
  };

  // Sample options for select questions (you can make this dynamic)
  const getSelectOptions = (questionLabel: string) => {
    // This is a simple example - you might want to make this more dynamic
    if (questionLabel.toLowerCase().includes('skill')) {
      return ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'];
    }
    if (questionLabel.toLowerCase().includes('contact')) {
      return ['Email', 'Phone', 'Text Message'];
    }
    if (questionLabel.toLowerCase().includes('technolog')) {
      return ['React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL'];
    }
    return ['Option 1', 'Option 2', 'Option 3'];
  };

  return (
    <div className="bg-blue-950 w-full text-white md:h-full rounded-3xl flex items-center justify-center p-8">
      <div className="md:w-1/2 w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">{viewLabel}</h2>

        {questions.length === 0 ? (
          <div className="text-center text-gray-300">
            <p>No questions added yet.</p>
            <p className="text-sm mt-2">Add some questions to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={`${question.label}-${index}`} className="flex flex-col gap-3">
                <label className="text-lg font-medium">{question.label}</label>

                {question.questionType === "text" && (
                  <input
                    type="text"
                    value={(formData[question.label] as string) || ""}
                    onChange={(e) => handleTextChange(question.label, e.target.value)}
                    className="border border-gray-600 outline-none rounded-lg text-lg bg-gray-900 px-4 py-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
                    placeholder="Enter your answer..."
                  />
                )}

                {question.questionType === "single-select" && (
                  <div className="space-y-2">
                    {getSelectOptions(question.label).map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={question.label}
                          value={option}
                          checked={(formData[question.label] as string) === option}
                          onChange={(e) => handleSingleSelectChange(question.label, e.target.value)}
                          className="w-4 h-4 text-blue-400 bg-gray-900 border-gray-600 focus:ring-blue-400"
                        />
                        <span className="text-base">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.questionType === "multiple-select" && (
                  <div className="space-y-2">
                    {getSelectOptions(question.label).map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={((formData[question.label] as string[]) || []).includes(option)}
                          onChange={(e) => handleMultipleSelectChange(question.label, option, e.target.checked)}
                          className="w-4 h-4 text-blue-400 bg-gray-900 border-gray-600 rounded focus:ring-blue-400"
                        />
                        <span className="text-base">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Form;