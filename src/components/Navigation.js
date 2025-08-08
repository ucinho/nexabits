import React from "react";
import { NavLink } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext.js";
import coin from "../assets/coin.png";
import referral from "../assets/boost.png";
import boost from "../assets/chatbot.png";
import earn from "../assets/earn.png";
import news from "../assets/news.png";
import trophy from "../assets/trophy.png";

const Navigation = () => {
  const { theme } = useThemeContext();

  return (
    <nav
      className={`fixed bottom-0 z-50 flex justify-around items-center font-inter shadow-md`}
      style={{
        height: "80px", // Adjust the height to ensure it overlaps content below
        backgroundColor: theme === "dark" ? "#" : "rgba(241, 241, 241, 0.7)", // Add transparency
        borderRadius: "15px", // Add rounded corners
        margin: "0 10px 10px 10px", // Add margin to move away from left and right
        left: "1px", // Ensure the nav is away from the left edge
        right: "1px", // Ensure the nav is away from the right edge
      }}
    >
      <NavLink
        to="/launch"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-inter 
          ${
            isActive
              ? "border-t-4 border-[#A97A0F] text-gold" // Thicker gold border at the top when active
              : "text-[#dbe2eb] transition duration-300 ease-in active:text-gray-300"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={referral} className="sm:w-12 w-8 mb-2" alt="Friends" /> {/* Move image upwards */}
        <p className="sm:text-base text-sm mt-neg-15">MemeX</p> {/* Move text upwards */}
      </NavLink>
      {/*<NavLink
        to="/leaderboard"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-poppins 
          ${
            isActive
              ? "border-t-4 border-[#A97A0F]" // Thicker gold border at the top when active
              : "text-gray-100 transition duration-300 ease-in active:text-gray-300"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={trophy} className="sm:w-12 w-8 mb-2" alt="quest" /> 
        <p className="sm:text-base text-sm mt-neg-15">Quest</p> 
      </NavLink> */}

      <NavLink
        to="/task"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-inter
          ${
            isActive
              ? "border-t-4 border-[#A97A0F] text-gold" // Thicker gold border at the top when active
              : "text-[#dbe2eb] transition duration-300 ease-in active:text-gray-300"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={earn} className="sm:w-12 w-8 mb-2" alt="Earn" /> {/* Move image upwards */}
        <p className="sm:text-base text-sm mt-neg-15">Earn</p> {/* Move text upwards */}
      </NavLink>

      <NavLink
        to="/"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-inter 
          ${
            isActive
              ? "border-t-4 border-[#A97A0F] text-gold" // Thicker gold border at the top when active
              : "text-[#dbe2eb] transition duration-300 ease-in active:text-gray-300"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={coin} className="sm:w-12 w-8 mb-2" alt="Tap" /> {/* Move image upwards */}
        <p className="sm:text-base text-sm mt-neg-15">Home</p> {/* Move text upwards */}
      </NavLink>



      <NavLink
        to="/news"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-inter
          ${
            isActive
              ? "border-t-4 border-[#A97A0F] text-gold" // Thicker gold border at the top when active
              : "text-[#dbe2eb] transition duration-300 ease-in active:text-purple"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={news} className="sm:w-12 w-8 mb-2" alt="News"  /> {/* Move image upwards */}
        <p className="sm:text-base text-sm mt-neg-15">News</p> {/* Move text upwards */}
      </NavLink>

            <NavLink
        to="/ai"
        className={({ isActive }) => {
          return `flex-grow flex-basis-0 text-base text-center font-inter
          ${
            isActive
              ? "border-t-4 border-[#A97A0F] text-gold" // Thicker gold border at the top when active
              : "text-[#dbe2eb] transition duration-300 ease-in active:text-purple"
          }
          cursor-pointer rounded capitalize font-semibold flex flex-col justify-center items-center h-full p-2`;
        }}
      >
        <img src={boost} className="sm:w-12 w-8 mb-2" alt="Boost" /> {/* Move image upwards */}
        <p className="sm:text-base text-sm mt-neg-15">AI</p> {/* Move text upwards */}
      </NavLink>
    </nav>
  );
};

export default Navigation;
