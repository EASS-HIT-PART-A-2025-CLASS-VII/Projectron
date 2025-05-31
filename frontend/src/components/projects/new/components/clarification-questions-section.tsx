"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Check, AlertCircle } from "lucide-react";
import { TypewriterText } from "./typewriter-text";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ClarificationQuestionsSectionProps {
  questions: string[];
  onSubmit: (answers: Record<string, string>) => void;
  isLoading: boolean;
}

const MAX_ANSWER_LENGTH = 3500;
const WARNING_THRESHOLD = 3200; // Show warning at 90% of limit

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

  // Get character count for a specific answer
  const getCharacterCount = (questionIndex: number): number => {
    if (questionIndex < questions.length) {
      return answers[questions[questionIndex]]?.length || 0;
    }
    return 0;
  };

  // Check if an answer is valid (within character limit and not empty)
  const isAnswerValid = (questionIndex: number): boolean => {
    const question = questions[questionIndex];
    const answer = answers[question];
    return (
      typeof answer === "string" &&
      answer.trim().length > 0 &&
      answer.length <= MAX_ANSWER_LENGTH
    );
  };

  // Check if any answer exceeds the character limit
  const hasInvalidAnswers = (): boolean => {
    return Object.values(answers).some(
      (answer) => answer && answer.length > MAX_ANSWER_LENGTH
    );
  };

  // Handle answer input for the current question
  const handleAnswerChange = (
    value: string,
    questionIndex = currentQuestionIndex
  ) => {
    if (questionIndex < questions.length) {
      // Allow typing but truncate if exceeding limit during paste operations
      const truncatedValue =
        value.length > MAX_ANSWER_LENGTH
          ? value.substring(0, MAX_ANSWER_LENGTH)
          : value;

      setAnswers((prev) => ({
        ...prev,
        [questions[questionIndex]]: truncatedValue,
      }));
    }
  };

  // Handle proceeding to the next question
  const handleNextQuestion = () => {
    if (
      currentQuestionIndex < questions.length &&
      isAnswerValid(currentQuestionIndex)
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTypingComplete(false);
    }
  };

  // Handle "Let Projectron Decide" button click
  const handleLetProjectronDecide = () => {
    const defaultAnswer =
      "Choose the best approach based on project requirements.";
    handleAnswerChange(defaultAnswer);
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
    if (!hasInvalidAnswers()) {
      onSubmit(answers);
    }
  };

  // Render character counter with appropriate styling
  const renderCharacterCounter = (questionIndex: number) => {
    const charCount = getCharacterCount(questionIndex);
    const isOverLimit = charCount > MAX_ANSWER_LENGTH;
    const isNearLimit = charCount >= WARNING_THRESHOLD;

    let textColor = "text-secondary-text";
    if (isOverLimit) {
      textColor = "text-red-400";
    } else if (isNearLimit) {
      textColor = "text-yellow-400";
    }

    return (
      <div className={`text-sm ${textColor} flex items-center gap-1`}>
        {isOverLimit && <AlertCircle className="h-4 w-4" />}
        <span>
          {charCount.toLocaleString()}/{MAX_ANSWER_LENGTH.toLocaleString()}{" "}
          characters
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">
        Let's Clarify Your Project Requirements
      </h2>
      <p className="text-secondary-text mb-6">
        Please answer these questions to help us understand your project better.
        This will ensure your generated plan is as accurate and detailed as
        possible. Each answer should be under{" "}
        {MAX_ANSWER_LENGTH.toLocaleString()} characters.
      </p>

      {/* Show warning if any answers are too long */}
      {hasInvalidAnswers() && (
        <Alert className="border-red-500/20 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            Some answers exceed the {MAX_ANSWER_LENGTH.toLocaleString()}{" "}
            character limit. Please shorten them before proceeding.
          </AlertDescription>
        </Alert>
      )}

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
                  className={`bg-primary-background min-h-[120px] ${
                    getCharacterCount(index) > MAX_ANSWER_LENGTH
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  maxLength={MAX_ANSWER_LENGTH}
                />
                <div className="flex justify-between items-center">
                  {renderCharacterCounter(index)}
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!isAnswerValid(index)}
                    className="bg-primary-cta hover:bg-primary-cta/90"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <p
                    className={`
                      flex-1 min-w-0              
                      bg-primary-background/50 border p-3 rounded-md
                      break-words whitespace-pre-wrap
                      overflow-wrap-anywhere text-wrap
                      ${
                        getCharacterCount(index) > MAX_ANSWER_LENGTH
                          ? "border-red-500/50"
                          : "border-divider"
                      }
                    `}
                  >
                    {answers[question]}
                  </p>
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
                <div className="flex justify-end">
                  {renderCharacterCounter(index)}
                </div>
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
                  className={`bg-primary-background min-h-[120px] ${
                    getCharacterCount(currentQuestionIndex) > MAX_ANSWER_LENGTH
                      ? "border-red-500 focus:border-red-500"
                      : ""
                  }`}
                  maxLength={MAX_ANSWER_LENGTH}
                />
                <div className="flex sm:flex-row flex-col items-start sm:justify-between sm:items-center gap-4">
                  {renderCharacterCounter(currentQuestionIndex)}
                  <div className="flex gap-3">
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
                      disabled={!isAnswerValid(currentQuestionIndex)}
                      className="bg-primary-cta text-black font-semi-bold inline-block hover:bg-hover-active hover:text-white hover:border-gray-700 border"
                    >
                      Next Question
                    </Button>
                  </div>
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
                disabled={isLoading || hasInvalidAnswers()}
                className="bg-primary-cta hover:bg-hover-active hover:text-white text-black font-semi-bold"
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
