import React, { useState, useEffect } from "react";
import moment from "moment";

const Countdown = ({ expiryAt }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = moment();
      const expiryTime = moment(expiryAt);
      const diff = expiryTime.diff(now);

      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    };

    calculateTimeLeft(); // Initial calculation

    const timer = setInterval(() => {
      calculateTimeLeft();
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryAt]);

  if (timeLeft === null) {
    return null; // Or a loading indicator
  }

  if (timeLeft <= 0) {
    return <span className="text-red-500">Expired</span>;
  }

  const duration = moment.duration(timeLeft);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return (
    <span className="text-sm text-gray-700">
      Time Left: {days > 0 && `${days}d `}{hours}h {minutes}m {seconds}s
    </span>
  );
};

export default Countdown;