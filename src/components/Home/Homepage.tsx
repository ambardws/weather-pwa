"use client";

import React, { useEffect, useState } from "react";
import { Bars3Icon, BeakerIcon, EyeIcon } from "@heroicons/react/20/solid";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import fetchApi from "@/services/api";
import { formatDate } from "@/utils/format";

const Homepage = () => {
  const [weather, setWeather] = useState<ResponeWeather[]>([]);
  const [place, setPlace] = useState("");
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  const getLocationAndFetchWeather = async () => {
    try {
      const positionData: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (error) => reject(error)
        );
      });

      setPosition({
        latitude: positionData.latitude,
        longitude: positionData.longitude,
      });

      const result: ResponeWeather = await fetchApi(
        `${positionData.latitude},${positionData.longitude}`
      );

      setWeather((prevWeather) => [...prevWeather, result]);
    } catch (error) {
      console.error("Error getting location or fetching weather", error);
    }
  };

  const addLocation = async (place: string) => {
    if (place) {
      const result: ResponeWeather = await fetchApi(place);

      setWeather((prevWeather) => [...prevWeather, result]);
    } else {
      return;
    }
  };

  useEffect(() => {
    setWeather([]);
    getLocationAndFetchWeather();
  }, []);

  return (
    <>
      {weather && (
        <div className="flex flex-col justify-center space-y-10 p-10 items-center text-white">
          <div className="flex flex-row space-x-3">
            <input
              type="text"
              placeholder="Add Location"
              className="input input-bordered w-full max-w-xs text-black"
              onChange={(x) => setPlace(x.target.value)}
            />
            <button className="btn" onClick={() => addLocation(place)}>
              Submit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {weather.map((item, i) => (
              <div
                key={i}
                className="relative h-[24rem] w-[20rem] md:h-96 md:w-80 rounded-2xl"
              >
                <div className="absolute inset-0 bg-slate-500 opacity-30 rounded-2xl"></div>
                <div className="relative flex flex-row pt-6 pl-3 space-x-3">
                  <div>
                    <img
                      src={`https://${item.current.condition.icon}`}
                      alt={item.current.condition.text}
                      className="w-[80px] h-[80px]"
                    />
                  </div>
                  <div className="pt-5">
                    <h1 className="text-base font-bold">
                      {item.location.name}
                    </h1>
                    <h2 className="text-xs">
                      {formatDate(item.location.localtime)}
                    </h2>
                  </div>
                </div>
                <div className="relative flex flex-col justify-center items-center text-white">
                  <h1 className="text-[100px] font-light">
                    {item.current.temp_c}
                    <span className="text-xs absolute top-9">°C</span>
                  </h1>
                  <p className="text-xs -mt-6">{item.current.condition.text}</p>
                  <div className="fle flex-col space-y-5 mt-10 text-xs">
                    <div className="flex flex-row">
                      <p className="w-[130px]">
                        <EyeIcon className="h-4 w-4 inline" /> Visibility{" "}
                        {item.current.vis_km}KM
                      </p>
                      <p className="w-[130px]">
                        <BeakerIcon className="h-4 w-4 inline" /> Feels Like{" "}
                        {item.current.feelslike_c}°C
                      </p>
                    </div>
                    <div className="flex flex-row">
                      <p className="w-[130px]">
                        <Bars3Icon className="h-4 w-4 inline" /> Humidity{" "}
                        {item.current.humidity}RH
                      </p>
                      <p className="w-[130px]">
                        <PaperAirplaneIcon className="h-4 w-4 inline" /> Wind{" "}
                        {item.current.wind_kph}Kph
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Homepage;
