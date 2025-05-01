import { useState } from "react";
import RedButton from "./assets/red.png";
import PushedRedButton from "./assets/red_pushed.png";
import GreenButton from "./assets/green.png";
import PushedGreenButton from "./assets/green_pushed.png";
import PurpleButton from "./assets/purple.png";
import PushedPurpleButton from "./assets/purple_pushed.png";
import YellowButton from "./assets/yellow.png";
import PushedYellowButton from "./assets/yellow_pushed.png";
import { ButtonColor } from "./squidboxConfig";

const SquidboxButton = ({
  color,
  alt,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}: {
  color: ButtonColor;
  alt: string;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}) => {
  const [isPushed, setIsPushed] = useState(false);

  const getButtonImage = (color: ButtonColor): string => {
    switch (color) {
      case ButtonColor.RED:
        return isPushed ? PushedRedButton : RedButton;
      case ButtonColor.GREEN:
        return isPushed ? PushedGreenButton : GreenButton;
      case ButtonColor.PURPLE:
        return isPushed ? PushedPurpleButton : PurpleButton;
      case ButtonColor.YELLOW:
        return isPushed ? PushedYellowButton : YellowButton;
      default:
        throw new Error("Invalid button color");
    }
  };

  const handleMouseDown = () => {
    setIsPushed(true);
    onMouseDown();
  };

  const handleMouseUp = () => {
    setIsPushed(false);
    onMouseUp();
  };

  const handleMouseLeave = () => {
    setIsPushed(false);
    onMouseLeave();
  };

  const handleTouchStart = () => {
    setIsPushed(true);
    onTouchStart();
  };

  const handleTouchEnd = () => {
    setIsPushed(false);
    onTouchEnd();
  };

  return (
    <img
      src={getButtonImage(color)}
      alt={alt}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="cursor-pointer"
    />
  );
};

export default SquidboxButton;
