// =====================================================

// frontend/src/services/alertService.js
import toast from 'react-hot-toast';
import { ALERT_SEVERITY } from '../utils/constants';

class AlertService {
  showAlert(alert) {
    const { severity, message, alertType } = alert;

    const options = {
      duration: severity === ALERT_SEVERITY.CRITICAL ? 10000 : 5000,
      icon: severity === ALERT_SEVERITY.CRITICAL ? '🚨' : '⚠️',
      style: {
        borderLeft:
          severity === ALERT_SEVERITY.CRITICAL ? '4px solid #ef4444' : '4px solid #f59e0b',
      },
    };

    if (severity === ALERT_SEVERITY.CRITICAL) {
      toast.error(message, options);
      this.playAlertSound();
    } else {
      toast(message, options);
    }
  }

  playAlertSound() {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  }

  showSuccess(message) {
    toast.success(message);
  }

  showError(message) {
    toast.error(message);
  }

  showInfo(message) {
    toast(message, { icon: 'ℹ️' });
  }

  showLoading(message) {
    return toast.loading(message);
  }

  dismiss(toastId) {
    toast.dismiss(toastId);
  }
}

export default new AlertService();
