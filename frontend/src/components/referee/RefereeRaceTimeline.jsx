import { motion } from 'framer-motion';

const STEPS = [
  { id: 'checking', label: 'Checking', icon: 'fact_check' },
  { id: 'racing', label: 'Racing', icon: 'sprint' },
  { id: 'reviewing', label: 'Reviewing', icon: 'video_camera_front' },
  { id: 'finished', label: 'Finished', icon: 'sports_score' }
];

export default function RefereeRaceTimeline({ currentStatus, onStepClick }) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="w-64 bg-surface-container-low border-r border-outline-variant p-6 h-full flex flex-col">
      <h2 className="font-display text-title-lg text-primary font-bold mb-8">Race Workflow</h2>
      
      <div className="flex-1 relative">
        {/* Vertical Line */}
        <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-outline-variant rounded-full"></div>
        
        <div className="space-y-12 relative">
          {STEPS.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            
            return (
              <div 
                key={step.id} 
                className={`flex items-start gap-4 relative ${!isActive && !isCompleted ? 'opacity-50' : ''} ${onStepClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => onStepClick && onStepClick(step.id)}
              >
                <div 
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                    ${isActive ? 'bg-primary text-on-primary border-primary shadow-md' : 
                      isCompleted ? 'bg-primary-container text-on-primary-container border-primary-container' : 
                      'bg-surface text-on-surface-variant border-outline'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">
                    {step.icon}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -inset-2 border-2 border-primary rounded-full opacity-50"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </div>
                
                <div className="pt-2">
                  <h3 className={`font-body text-label-lg font-bold uppercase tracking-wider
                    ${isActive ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                    {step.label}
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mt-1">
                    {isActive ? 'Current Phase' : isCompleted ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
