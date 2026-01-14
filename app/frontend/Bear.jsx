import React from "react";
import "./Bear.css";

export default function Bear({ looking }) {
  return (
    <div>
      <h1>Bear Animation</h1>
      <div className={`bear ${looking ? "looking" : ""}`}>
        <div className="ears">
          <div className="ear left"></div>
          <div className="ear right"></div>
        </div>
        <div className="face">
          <div className="eyes">
            <div className="eye left"></div>
            <div className="eye right"></div>
          </div>
          <div className="nose"></div>
          <div className="mouth"></div>
        </div>
      </div>
    </div>
  );
}