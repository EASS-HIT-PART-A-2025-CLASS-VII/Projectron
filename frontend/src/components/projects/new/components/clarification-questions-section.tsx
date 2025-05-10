"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Check } from "lucide-react";
import { TypewriterText } from "./typewriter-text";

interface ClarificationQuestionsSectionProps {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

export function ClarificationQuestionsSection({
  questions,
  onSubmit,
  isLoading,
}: ClarificationQuestionsSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [typingComplete, setTypingComplete] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // Check if all questions have been shown and answered
  useEffect(() => {
    if (
      currentQuestionIndex >= questions.length &&
      Object.keys(answers).length === questions.length
    ) {
      setAllQuestionsAnswered(true);
    }
  }, [currentQuestionIndex, answers, questions.length]);

  // Handle answer input for the current question
  const handleAnswerChange = (
    value: string,
    questionIndex = currentQuestionIndex
  ) => {
    if (questionIndex < questions.length) {
      setAnswers((prev) => ({
        ...prev,
        [questions[questionIndex]]: value,
      }));
    }
  };

  // Handle proceeding to the next question
  const handleNextQuestion = () => {
    if (
      currentQuestionIndex < questions.length &&
      answers[questions[currentQuestionIndex]]?.trim()
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTypingComplete(false);
    }
  };

  // Handle "Let Projectron Decide" button click
  const handleLetProjectronDecide = () => {
    handleAnswerChange(
      "Choose the best approach based on project requirements."
    );
    setCurrentQuestionIndex((prev) => prev + 1);
    setTypingComplete(false);
  };

  // Handle edit button click for an answered question
  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
  };

  // Handle save button click after editing a question
  const handleSaveEdit = () => {
    setEditingQuestionIndex(null);
  };

  // Handle submission of all answers
  const handleSubmitAnswers = () => {
    onSubmit(answers);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        Let's Clarify Your Project Requirements
      </h2>
      <p className="text-secondary-text mb-6">
        Please answer these questions to help us understand your project better.
        This will ensure your generated plan is as accurate and detailed as
        possible.
      </p>

      <div className="space-y-8">
        {/* Display questions that have already been asked and answered */}
        {questions.slice(0, currentQuestionIndex).map((question, index) => (
          <div
            key={index}
            className="space-y-2 border border-divider/30 rounded-md p-4 bg-secondary-background/30"
          >
            <div className="font-medium text-primary-text">{question}</div>

            {editingQuestionIndex === index ? (
              // Editing mode
              <div className="space-y-2">
                <Textarea
                  value={answers[question] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value, index)}
                  className="bg-primary-background min-h-[120px]"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    className="bg-primary-cta hover:bg-primary-cta/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex justify-between items-start gap-4">
                <div className="bg-primary-background/50 border border-divider p-3 rounded-md flex-1">
                  {answers[question]}
                </div>
                <Button
                  type="button"
                  onClick={() => handleEditQuestion(index)}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Current question with typewriter effect */}
        {currentQuestionIndex < questions.length && (
          <div className="space-y-3 border border-divider/30 rounded-md p-4 bg-secondary-background/30">
            <TypewriterText
              text={questions[currentQuestionIndex]}
              onComplete={() => setTypingComplete(true)}
              className="font-medium text-primary-text"
            />

            {typingComplete && (
              <>
                <Textarea
                  value={answers[questions[currentQuestionIndex]] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="bg-primary-background min-h-[120px]"
                />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="cta"
                    onClick={handleLetProjectronDecide}
                    className="text-background bg-white hover:bg-hover-active hover:text-white hover:border-gray-700 border"
                  >
                    Decide For Me
                  </Button>
                  <Button
                    type="button"
                    variant="cta"
                    onClick={handleNextQuestion}
                    disabled={!answers[questions[currentQuestionIndex]]?.trim()}
                    className="bg-primary-cta text-black font-semi-bold inline-block hover:bg-hover-active hover:text-white hover:border-gray-700 border"
                  >
                    Next Question
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Submit button when all questions are answered */}
        {allQuestionsAnswered && (
          <div className="pt-4 border-t border-divider">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-secondary-text text-center sm:text-left">
                Thank you for answering all the questions! We're ready to
                generate your project plan.
              </p>
              <Button
                onClick={handleSubmitAnswers}
                disabled={isLoading}
                className="bg-primary-cta hover:bg-primary-cta/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Plan...
                  </>
                ) : (
                  <>Generate Project Plan</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
