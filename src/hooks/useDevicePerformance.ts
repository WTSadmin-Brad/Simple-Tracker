/**
 * Hook for detecting device performance capabilities
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source MEMORY - "Performance Rules" section
 */

import { useState, useEffect } from 'react';

/**
 * Performance level categorization
 */
type PerformanceLevel = 'low' | 'medium' | 'high';

/**
 * Device performance metrics
 */
interface DevicePerformance {
  level: PerformanceLevel;
  canUseHeavyAnimations: boolean;
  recommendedImageQuality: 'low' | 'medium' | 'high';
  fps: number | null;
}

/**
 * Hook to detect device performance capabilities
 * Used to adjust animations and image quality based on device capabilities
 * 
 * TODO: Implement actual performance detection
 */
export function useDevicePerformance(): DevicePerformance {
  const [performance, setPerformance] = useState<DevicePerformance>({
    level: 'medium',
    canUseHeavyAnimations: true,
    recommendedImageQuality: 'medium',
    fps: null
  });

  useEffect(() => {
    // Simple detection based on user agent and device memory
    const detectPerformance = () => {
      try {
        // Check if device memory API is available
        const memory = (navigator as any).deviceMemory || 4;
        
        // Check if mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        
        // Determine performance level
        let level: PerformanceLevel = 'medium';
        if (memory <= 2 || (isMobile && memory <= 4)) {
          level = 'low';
        } else if (memory >= 8 && !isMobile) {
          level = 'high';
        }
        
        // Update performance state
        setPerformance({
          level,
          canUseHeavyAnimations: level !== 'low',
          recommendedImageQuality: level === 'low' ? 'low' : level === 'medium' ? 'medium' : 'high',
          fps: null // Will be measured during animation
        });
      } catch (error) {
        // Fallback to medium if detection fails
        console.error('Failed to detect device performance:', error);
      }
    };
    
    detectPerformance();
  }, []);

  return performance;
}
