import React, { useState, useEffect, useRef } from "react";
import { useThemeContext } from "../context/ThemeContext.js";
import { useTapContext } from "../context/TapContext.js";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { HiHandRaised } from "react-icons/hi2";
import { MdBatteryChargingFull, MdElectricBolt } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import crypto from "../assets/crypto.png";
import { setStorageItem, getStorageItem } from '../components/storageHelpers.js';

const levelRequirements = [
  { level: 2, cost: 1000, pointsPerTap: 2 },
  { level: 3, cost: 5000, pointsPerTap: 3 },
  { level: 4, cost: 20000, pointsPerTap: 5 },
  { level: 5, cost: 100000, pointsPerTap: 8 },
  { level: 6, cost: 300000, pointsPerTap: 12 },
  { level: 7, cost: 700000, pointsPerTap: 17 },
  { level: 8, cost: 1000000, pointsPerTap: 20 },
  { level: 9, cost: 5000000, pointsPerTap: 25 },
];

const energyLevelRequirements = [
  { level: 1, cost: 500, energyLimit: 1000 },
  { level: 2, cost: 1000, energyLimit: 2000 },
  { level: 3, cost: 5000, energyLimit: 3000 },
  { level: 4, cost: 10000, energyLimit: 4000 },
  { level: 5, cost: 20000, energyLimit: 5000 },
  { level: 6, cost: 50000, energyLimit: 6000 },
  { level: 7, cost: 100000, energyLimit: 7000 },
  { level: 8, cost: 500000, energyLimit: 8000 },
];

const rechargeSpeedRequirements = [
  { level: 1, cost: 1000, refillRateMultiplier: 2 },
  { level: 2, cost: 5000, refillRateMultiplier: 2 },
  { level: 3, cost: 20000, refillRateMultiplier: 2 },
  { level: 4, cost: 50000, refillRateMultiplier: 2 },
  { level: 5, cost: 100000, refillRateMultiplier: 2 },
];

const formatCount = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Boost = () => {
  const { theme } = useThemeContext();
  const {
    count,
    decrementCount,
    coinsPerTap,
    setCoinsPerTap,
    energyLimit,
    setEnergyLimit,
    refillRate,
    setRefillRate,
    updateStateAndStorage,
  } = useTapContext();

  const [currentLevel, setCurrentLevel] = useState(null);
  const [nextLevelRequirement, setNextLevelRequirement] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);
  const [nextEnergyLevelRequirement, setNextEnergyLevelRequirement] = useState(null);
  const [rechargeSpeedLevel, setRechargeSpeedLevel] = useState(null);
  const [nextRechargeSpeedRequirement, setNextRechargeSpeedRequirement] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const prevValues = useRef({
    coinsPerTap,
    energyLimit,
    refillRate
  });

  const loadData = async () => {
    const savedCurrentLevel = await getStorageItem("currentLevel");
    const savedEnergyLevel = await getStorageItem("energyLevel");
    const savedRechargeSpeedLevel = await getStorageItem("rechargeSpeedLevel");

    if (savedCurrentLevel !== null) {
      setCurrentLevel(savedCurrentLevel);
      setNextLevelRequirement(savedCurrentLevel > 1 && savedCurrentLevel <= levelRequirements.length ? levelRequirements[savedCurrentLevel - 1] : null);
    } else {
      setCurrentLevel(1);
      setNextLevelRequirement(levelRequirements[0]);
    }

    if (savedEnergyLevel !== null) {
      setEnergyLevel(savedEnergyLevel);
      setNextEnergyLevelRequirement(savedEnergyLevel > 1 && savedEnergyLevel <= energyLevelRequirements.length ? energyLevelRequirements[savedEnergyLevel - 1] : null);
    } else {
      setEnergyLevel(1);
      setNextEnergyLevelRequirement(energyLevelRequirements[0]);
    }

    if (savedRechargeSpeedLevel !== null) {
      setRechargeSpeedLevel(savedRechargeSpeedLevel);
      setNextRechargeSpeedRequirement(savedRechargeSpeedLevel > 1 && savedRechargeSpeedLevel <= rechargeSpeedRequirements.length ? rechargeSpeedRequirements[savedRechargeSpeedLevel - 1] : null);
    } else {
      setRechargeSpeedLevel(1);
      setNextRechargeSpeedRequirement(rechargeSpeedRequirements[0]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentLevel !== null) {
      setStorageItem("currentLevel", currentLevel); // Save to Cloud Storage
    }
  }, [currentLevel]);

  useEffect(() => {
    if (energyLevel !== null) {
      setStorageItem("energyLevel", energyLevel); // Save to Cloud Storage
    }
  }, [energyLevel]);

  useEffect(() => {
    if (rechargeSpeedLevel !== null) {
      setStorageItem("rechargeSpeedLevel", rechargeSpeedLevel); // Save to Cloud Storage
    }
  }, [rechargeSpeedLevel]);

  useEffect(() => {
    const prev = prevValues.current;
    const updateStateAndStorageAsync = async (key, value, setState) => {
      await updateStateAndStorage(key, value, setState);
    };
    if (prev.coinsPerTap !== coinsPerTap) {
      updateStateAndStorageAsync('coinsPerTap', coinsPerTap, setCoinsPerTap);
    }
    if (prev.energyLimit !== energyLimit) {
      updateStateAndStorageAsync('energyLimit', energyLimit, setEnergyLimit);
    }
    if (prev.refillRate !== refillRate) {
      updateStateAndStorageAsync('refillRate', refillRate, setRefillRate);
    }
    prevValues.current = { coinsPerTap, energyLimit, refillRate };
  }, [coinsPerTap, energyLimit, refillRate, updateStateAndStorage, setCoinsPerTap, setEnergyLimit, setRefillRate]);

  const handleMultiTapClick = async () => {
    if (count >= nextLevelRequirement.cost) {
      decrementCount(nextLevelRequirement.cost);
      setCoinsPerTap(nextLevelRequirement.pointsPerTap);
      const newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);
      await setStorageItem("currentLevel", newLevel);
      showCelebration();
    }
  };

  const handleEnergyUpgradeClick = async () => {
    if (count >= nextEnergyLevelRequirement.cost) {
      decrementCount(nextEnergyLevelRequirement.cost);
      const newEnergyLevel = energyLevel + 1;
      setEnergyLevel(newEnergyLevel);
      await setStorageItem("energyLevel", newEnergyLevel);
      setEnergyLimit(nextEnergyLevelRequirement.energyLimit);
      setRefillRate(refillRate * 2); // Double the refill rate
      showCelebration();
    }
  };

  const handleRechargeSpeedClick = async () => {
    if (count >= nextRechargeSpeedRequirement.cost) {
      decrementCount(nextRechargeSpeedRequirement.cost);
      const newRechargeSpeedLevel = rechargeSpeedLevel + 1;
      setRechargeSpeedLevel(newRechargeSpeedLevel);
      await setStorageItem("rechargeSpeedLevel", newRechargeSpeedLevel);
      setRefillRate(refillRate / nextRechargeSpeedRequirement.refillRateMultiplier);
      showCelebration();
    }
  };

  const showCelebration = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 3000);
  };

  const isMultiTapActive = count >= nextLevelRequirement?.cost;
  const isEnergyUpgradeActive = count >= nextEnergyLevelRequirement?.cost;
  const isRechargeSpeedActive = count >= nextRechargeSpeedRequirement?.cost;

  if (currentLevel === null || energyLevel === null || rechargeSpeedLevel === null) {
    // Show loading state or placeholder while data is being fetched
    return <div>Loading...</div>;
  }

  return (
    <section
      className={`h-full w-[90%] flex flex-col mt-10 mb-24 relative ${
        theme === "dark"
          ? "bg-gradient-to-b from-[#19191E] to-[#232323] text-[#fff]"
          : "bg-[#fff] text-[#19191E]"
      } `}
    >
      <h1 className="sm:text-2xl text-xl my-3 text-center font-semibold text-gray-100">
        Boost
      </h1>

      <div
        className={`w-full min-h-[70vh] sm:pb-12 pb-0 rounded overflow-y-scroll scrollbar-hide ${
          theme === "dark"
            ? "bg-[#19191E] text-[#fff]"
            : "bg-[#F1F2F2] text-[#19191E]"
        }`}
      >
        <div className="flex flex-col items-center sm:p-0 p-3">
          <div className="flex flex-col gap-3 sm:w-[80%] w-full items-center pt-3 justify-items-center">
            <div className="text-sm text-gray-100 text-center">
              Your $Squad Balance:
            </div>
            <div className="flex flex-row gap-3 items-center">
              <img src={crypto} className="sm:w-11 w-8" />
              <div
                className={`${
                  theme === "dark"
                    ? "bg-[#19191E] text-[#fff]"
                    : "bg-[#F1F2F2] text-[#19191E]"
                } sm:text-6xl text-3xl font-semibold`}
              >
                {formatCount(count)}
              </div>
            </div>
          </div>

          {/* Boosters */}
          <div className="flex flex-col items-center gap-2 mt-6 sm:w-[80%] w-full">
            <div className="text-center">
              <span className="text-blue-500">Increase Your </span>
              <span className="text-gold-500">Earning </span>
              <span className="text-blue-500">Speed</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {/* Multi Tap Booster */}
              <div
                onClick={isMultiTapActive && nextLevelRequirement ? handleMultiTapClick : undefined}
                className={`${
                  theme === "dark"
                    ? "bg-[#232323] border border-gray-200"
                    : "bg-[#fff] border border-[#F1F2F2]"
                } flex flex-row gap-1 items-center justify-between px-6 py-3 rounded-md ${
                  isMultiTapActive && nextLevelRequirement ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                } hover:bg-gray-300 transition-all duration-200 ease-in`}
              >
                <div className="flex flex-row items-center gap-2">
                  <HiHandRaised className="text-gray-100 sm:text-4xl text-3xl" />
                  <div className="flex flex-col gap-1">
                    <div className={`text-sm ${isMultiTapActive ? 'text-white' : 'text-gray-500'}`}>
                      Multi tap
                    </div>
                    <div className="text-gray-100 text-sm flex flex-row gap-2 items-center">
                      <img src={crypto} className="sm:w-6 w-4" />
                      <div className={isMultiTapActive ? "text-white" : "text-gray-500"}>
                        {nextLevelRequirement ? nextLevelRequirement.cost.toLocaleString() : " "}
                      </div> | <div className={isMultiTapActive ? "text-white" : "text-gray-500"}>{nextLevelRequirement ? `Level ${currentLevel}` : "Limit Reached ✅"}</div>
                    </div>
                  </div>
                </div>
                <MdOutlineKeyboardArrowRight className="text-gray-100" />
              </div>

              {/* Energy Limit Upgrade */}
              <div
                onClick={isEnergyUpgradeActive && nextEnergyLevelRequirement ? handleEnergyUpgradeClick : undefined}
                className={`${
                  theme === "dark"
                    ? "bg-[#232323] border border-gray-200"
                    : "bg-[#fff] border border-[#F1F2F2]"
                } flex flex-row gap-1 items-center justify-between px-6 py-3 rounded-md ${
                  isEnergyUpgradeActive && nextEnergyLevelRequirement ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                } hover:bg-gray-300 transition-all duration-200 ease-in`}
              >
                <div className="flex flex-row items-center gap-2">
                  <MdBatteryChargingFull className="text-gray-100 sm:text-4xl text-3xl" />
                  <div className="flex flex-col gap-1">
                    <div className={`text-sm ${isEnergyUpgradeActive ? 'text-white' : 'text-gray-500'}`}>
                      Energy Limits
                    </div>
                    <div className="text-gray-100 text-sm flex flex-row gap-2 items-center">
                      <img src={crypto} className="sm:w-6 w-4" />
                      <div className={isEnergyUpgradeActive ? "text-white" : "text-gray-500"}>
                        {nextEnergyLevelRequirement ? nextEnergyLevelRequirement.cost.toLocaleString() : " "}
                      </div> | <div className={isEnergyUpgradeActive ? "text-white" : "text-gray-500"}>{nextEnergyLevelRequirement ? `Level ${energyLevel}` : "Limit Reached ✅"}</div>
                    </div>
                  </div>
                </div>
                <MdOutlineKeyboardArrowRight className="text-gray-100" />
              </div>

              {/* Recharge Speed Upgrade */}
              <div
                onClick={isRechargeSpeedActive && nextRechargeSpeedRequirement ? handleRechargeSpeedClick : undefined}
                className={`${
                  theme === "dark"
                    ? "bg-[#232323] border border-gray-200"
                    : "bg-[#fff] border border-[#F1F2F2]"
                } flex flex-row gap-1 items-center justify-between px-6 py-3 rounded-md ${
                  isRechargeSpeedActive && nextRechargeSpeedRequirement ? "cursor-pointer" : "cursor-not-allowed bg-gray-300"
                } hover:bg-gray-300 transition-all duration-200 ease-in`}
              >
                <div className="flex flex-row items-center gap-2">
                  <MdElectricBolt className="text-gray-100 sm:text-4xl text-3xl" />
                  <div className="flex flex-col gap-1">
                    <div className={`text-sm ${isRechargeSpeedActive ? 'text-white' : 'text-gray-500'}`}>
                      Recharge Speed
                    </div>
                    <div className="text-gray-100 text-sm flex flex-row gap-2 items-center">
                      <img src={crypto} className="sm:w-6 w-4" />
                      <div className={isRechargeSpeedActive ? "text-white" : "text-gray-500"}>
                        {nextRechargeSpeedRequirement ? nextRechargeSpeedRequirement.cost.toLocaleString() : " "}
                      </div> | <div className={isRechargeSpeedActive ? "text-white" : "text-gray-500"}>{nextRechargeSpeedRequirement ? `Level ${rechargeSpeedLevel}` : "Limit Reached ✅"}</div>
                    </div>
                  </div>
                </div>
                <MdOutlineKeyboardArrowRight className="text-gray-100" />
              </div>

              {/* Other boosters (unchanged) */}
              <div
                className={`${
                  theme === "dark"
                    ? "bg-[#232323] border border-gray-200"
                    : "bg-[#fff] border border-[#F1F2F2]"
                } flex flex-row gap-1 items-center justify-between px-6 py-3 rounded-md cursor-pointer hover:bg-gray-300 transition-all duration-200 ease-in`}
              >
                <div className="flex flex-row items-center gap-2">
                  <FaRobot className="text-gray-100 sm:text-4xl text-3xl" />
                  <div className="flex flex-col gap-1">
                    <div className="text-gray-100 text-sm">Trading Bot AI</div>
                    <div className="text-gray-100 text-sm flex flex-row gap-2 items-center">
                      <img src={crypto} className="sm:w-6 w-4" />
                      <div>💎10,000</div> | <div>Coming Soon</div>
                    </div>
                  </div>
                </div>
                <MdOutlineKeyboardArrowRight className="text-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAnimation && (
        <div className="celebration-animation">🎉 Congratulations! 🎉</div>
      )}
    </section>
  );
};

export default Boost;
