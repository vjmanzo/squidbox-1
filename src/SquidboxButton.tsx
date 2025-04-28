import { useState } from "react";
import RedButton from "./assets/red.png";
import PushedRedButton from "./assets/red_pushed.png";
import GreenButton from "./assets/green.png";
import PushedGreenButton from "./assets/green_pushed.png";
import PurpleButton from "./assets/purple.png";
import PushedPurpleButton from "./assets/purple_pushed.png";
import YellowButton from "./assets/yellow.png";
import PushedYellowButton from "./assets/yellow_pushed.png";

const SquidboxButton = ({
  color,
  alt,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}) => {
  const [isPushed, setIsPushed] = useState(false);

  const buttonImages = {
    red: isPushed ? PushedRedButton : RedButton,
    green: isPushed ? PushedGreenButton : GreenButton,
    purple: isPushed ? PushedPurpleButton : PurpleButton,
    yellow: isPushed ? PushedYellowButton : YellowButton,
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
      src={buttonImages[color]}
      alt={alt}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: "pointer" }}
    />
  );
};

export default SquidboxButton;
