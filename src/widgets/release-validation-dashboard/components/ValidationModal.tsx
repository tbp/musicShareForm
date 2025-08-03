'use client'

import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react'
import type { ValidationModalProps } from '../types/validation.types'

export function ValidationModal({ 
  isOpen, 
  onClose, 
  requirements, 
  completionPercentage, 
  completedItems, 
  totalItems 
}: ValidationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-heading">Release Validation</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {completedItems}/{totalItems} requirements completed ({completionPercentage}%)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b border-border">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="p-6 space-y-6">
          {requirements.map(requirement => {
            const sectionCompleted = requirement.items.every(item => item.completed)
            const sectionProgress = requirement.items.length > 0 
              ? Math.round((requirement.items.filter(item => item.completed).length / requirement.items.length) * 100)
              : 0
            
            return (
              <div key={requirement.id}>
                <div className="flex items-center gap-3 mb-3">
                  {sectionCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : requirement.items.some(item => item.completed) ? (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <h3 className="font-medium text-heading">{requirement.title}</h3>
                  <div className="text-sm text-muted-foreground">
                    {sectionProgress}%
                  </div>
                </div>
                
                <div className="ml-8 space-y-2">
                  {requirement.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        item.completed ? 'bg-green-500' : 'bg-muted-foreground/30'
                      }`} />
                      <span className={item.completed ? 'text-green-600' : 'text-muted-foreground'}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20">
          {completionPercentage < 100 ? (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-heading mb-1">Next Steps</h4>
                <p className="text-sm text-muted-foreground">
                  Complete the missing items above to enable release creation. 
                  All fields are required for DDEX ERN 4.1 compliance.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">Ready to Create!</h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  All requirements completed. Your release is ready for professional distribution.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}