import React from "react";
import { realTasks } from "../data/index.js";
import { useThemeContext } from "../context/ThemeContext.js";
import { TbMilitaryRank } from "react-icons/tb";
import { GiTwoCoins } from "react-icons/gi";
import { IoIosCheckmark } from "react-icons/io";
import logoSvg from "../assets/logo.svg";
import { FaTasks } from "react-icons/fa";
import { useTapContext } from "../context/TapContext.js";
import { useTaskContext } from "../context/TaskContext.js";

const Task = () => {
  const { count, incrementPoints } = useTapContext();
  const { theme } = useThemeContext();
  const { completedTasks, timers, startTaskTimer } = useTaskContext();

  const handleTaskClick = (item, index) => {
    if (completedTasks[index] || timers[index]) {
      return; // Task already completed or timer already set
    }

    const duration = (Math.floor(Math.random() * (60 - 10 + 1)) + 10) * 1000;
    startTaskTimer(index, duration);
  };

  // Function to format number with commas
  const formatCount = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <section
      className={`h-full w-[90%] flex flex-col mt-10 mb-16 relative ${
        theme === "dark" ? "bg-[#19191E] text-[#fff]" : "bg-[#fff] text-[#192928]"
      } `}
    >
      <h1 className="sm:text-2xl text-xl my-3 text-center font-semibold text-gray-100"></h1>

      <div
        className={`w-full min-h-[70vh] rounded overflow-y-scroll scrollbar-hide ${
          theme === "dark" ? "bg-[#19191E] text-[#fff]" : "bg-[#F1F2F2] text-[#192928]"
        }`}
      >
        {realTasks.map((task, taskIndex) => (
          <div key={taskIndex} className="flex mx-auto flex-col gap-3 items-center pt-5">
            <div className="flex flex-row justify-between sm:w-[80%]">
              <div className="flex sm:flex-row flex-col gap-3 sm:items-center items-start">
                <div className="flex w-full flex-col gap-2 sm:px-0 px-4">
                  <h1 className="sm:text-xl text-lg text-center sm:tracking-wide tracking-wider -mt-6 p-2">
                    {task.title}
                  </h1>
                  <div
                    className={`px-4 py-2 rounded-md flex flex-row items-center justify-between cursor-pointer ${
                      theme === "dark" ? "bg-[#232323] border border-gray-200" : "bg-[#fff] border border-[#F1F2F2]"
                    }`}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-3xl">
                        <TbMilitaryRank />
                      </span>
                      <p>Balance</p>
                    </div>
                    <div className="text-[#43B05F] text-xl font-semibold flex flex-row items-center gap-2">
                      <p className="text-2xl">{formatCount(count)}</p>
                      <GiTwoCoins style={{ color: "gold" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="sm:flex hidden justify-center flex-row mx-4">
                <img src={logoSvg} alt="CryptoBucks" className={`w-24 ${theme === "dark" ? "bg-[#E9B454]" : "bg-[#AC9053]"}`} />
              </div>
            </div>

            {/* Tasks */}
            <div className="flex flex-col gap-2 px-4 sm:w-[70%]">
              {task?.task?.map((item, index) => (
                <a
                  href={item.task_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                  className="no-underline"
                  onClick={() => handleTaskClick(item, taskIndex + "-" + index)}
                >
                  <div
                    className={`px-4 py-2 rounded-md flex flex-row items-center justify-between cursor-pointer ${
                      theme === "dark" ? "bg-[#232323] border border-gray-200" : "bg-[#fff] border border-[#F1F2F2]"
                    }`}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-2xl">
                        {completedTasks[taskIndex + "-" + index] ? (
                          <IoIosCheckmark className="text-[#ffffff] rounded-md bg-[#43b05f]" />
                        ) : (
                          <FaTasks className="text-gray-300 rounded-md bg-[#808080]" />
                        )}
                      </span>
                      <p className="sm:text-base text-sm">{item.task_title}</p>
                    </div>
                    <div className="text-gray-100 text-lg font-semibold flex flex-row items-center gap-2">
                      <p className="sm:text-base text-sm">{item.task_points}</p>
                      <GiTwoCoins />
                    </div>
                  </div>
                </a>
              ))}

              <div className="flex flex-col mt-6 gap-2">
                <h1 className="sm:text-xl text-lg w-full"></h1>
                <div className="text-center text-base mt-4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Task;