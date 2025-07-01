import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface CountdownTimerProps {
  endDate: string | Date;
  compact?: boolean;
}

export default function CountdownTimer({ endDate, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endDate);
      const now = new Date();
      const difference = end.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ days, hours, minutes, expired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <Badge variant="destructive" className={compact ? "text-xs" : ""}>
        منتهي
      </Badge>
    );
  }

  const getTimeString = () => {
    if (timeLeft.days > 0) {
      if (timeLeft.days === 1) return "يوم واحد متبقي";
      if (timeLeft.days === 2) return "يومان متبقيان";
      if (timeLeft.days <= 10) return `${timeLeft.days} أيام متبقية`;
      return `${timeLeft.days} يوم متبقي`;
    }

    if (timeLeft.hours > 0) {
      if (timeLeft.hours === 1) return "ساعة واحدة متبقية";
      if (timeLeft.hours === 2) return "ساعتان متبقيتان";
      if (timeLeft.hours <= 10) return `${timeLeft.hours} ساعات متبقية`;
      return `${timeLeft.hours} ساعة متبقية`;
    }

    if (timeLeft.minutes > 0) {
      if (timeLeft.minutes === 1) return "دقيقة واحدة متبقية";
      if (timeLeft.minutes === 2) return "دقيقتان متبقيتان";
      if (timeLeft.minutes <= 10) return `${timeLeft.minutes} دقائق متبقية`;
      return `${timeLeft.minutes} دقيقة متبقية`;
    }

    return "أقل من دقيقة";
  };

  const getBadgeVariant = () => {
    if (timeLeft.days === 0 && timeLeft.hours < 24) {
      return "destructive" as const; // Urgent - less than 24 hours
    }
    if (timeLeft.days <= 3) {
      return "secondary" as const; // Warning - 3 days or less
    }
    return "default" as const; // Normal
  };

  const getBadgeClass = () => {
    if (timeLeft.days === 0 && timeLeft.hours < 24) {
      return "countdown-timer text-white"; // Red gradient for urgent
    }
    return "";
  };

  return (
    <Badge 
      variant={getBadgeVariant()} 
      className={`${getBadgeClass()} ${compact ? "text-xs" : ""}`}
    >
      <i className="fas fa-clock ml-1"></i>
      {getTimeString()}
    </Badge>
  );
}
