import React, { useEffect, useState } from "react";

const Loader = ({ minDuration = 2000 }) => {
  const [canHide, setCanHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanHide(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  if (!canHide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return null;
};

export default Loader;
