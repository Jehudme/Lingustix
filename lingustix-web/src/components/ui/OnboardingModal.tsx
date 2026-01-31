'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, FileText, Sparkles, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores';
import { Button } from '@/components/ui';

const steps = [
  {
    icon: <PenTool className="w-12 h-12" />,
    title: 'Welcome to Lingustix',
    description:
      'Your new home for focused writing and language mastery. Create compositions, analyze your writing, and improve your craft.',
  },
  {
    icon: <FileText className="w-12 h-12" />,
    title: 'Create Compositions',
    description:
      'Start writing in our distraction-free editor. Your work is automatically saved, so you never lose progress.',
  },
  {
    icon: <Sparkles className="w-12 h-12" />,
    title: 'Analyze Your Writing',
    description:
      'Get instant feedback on grammar, style, and clarity. Our AI-powered analysis helps you write better.',
  },
  {
    icon: <CheckCircle className="w-12 h-12" />,
    title: 'You\'re Ready!',
    description:
      'Start your writing journey. Press Cmd+K anytime to quickly search and navigate your compositions.',
  },
];

export function OnboardingModal() {
  const { showOnboarding, completeOnboarding } = useSettingsStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboarding) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {showOnboarding && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Content */}
              <div className="relative p-8 pt-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="text-center"
                  >
                    {/* Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1,
                      }}
                      className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6"
                    >
                      {currentStepData.icon}
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-slate-100 mb-3"
                    >
                      {currentStepData.title}
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-slate-400 leading-relaxed"
                    >
                      {currentStepData.description}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mt-8 mb-6">
                  {steps.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep
                          ? 'bg-indigo-500'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Skip tour
                  </button>
                  <Button onClick={handleNext}>
                    {currentStep === steps.length - 1 ? (
                      'Get Started'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
