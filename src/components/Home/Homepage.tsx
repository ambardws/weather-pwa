"use client";

import React, { useEffect, useState, Fragment, useRef } from "react";
import { Bars3Icon, BeakerIcon, EyeIcon } from "@heroicons/react/20/solid";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { fetchApi, fetchLocation } from "@/services/api";
import { formatDate } from "@/utils/format";
import { Combobox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { toastError } from "@/utils/toast";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const [selected, setSelected] = useState<listPlace>();
  const [query, setQuery] = useState("");
  const [listPlace, setListPlace] = useState<listPlace[]>([]);
  const [weather, setWeather] = useState<ResponeWeather[]>([]);
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });
  const inputRef = useRef<any>(null);

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

  const addLocation = async () => {
    const inputValue = inputRef.current?.value;
    if (inputValue.trim() !== "") {
      const result: ResponeWeather = await fetchApi(
        `${selected?.lat},${selected?.lon}`
      );
      setWeather((prevWeather) => [...prevWeather, result]);
    } else {
      toastError("Error", "Location can not be empty");
    }
  };

  useEffect(() => {
    setWeather([]);
    getLocationAndFetchWeather();
  }, []);

  useEffect(() => {
    const getloc = setTimeout(async () => {
      if (query) {
        const res = await fetchLocation(query);
        const formattedData = res.results?.map((result: any) => {
          return {
            id: result.place_id,
            name: result.formatted,
            lon: result.lon,
            lat: result.lat,
          };
        });
        if (formattedData) {
          setListPlace(formattedData);
        }
      }
    }, 500);
    return () => clearTimeout(getloc);
  }, [query]);

  return (
    <>
      <ToastContainer />
      {weather && (
        <div className="flex flex-col justify-center space-y-10 p-4 sm:p-10 items-center text-white">
          <div className="flex flex-row space-x-3">
            <Combobox value={selected} onChange={setSelected}>
              <div className="relative mt-1">
                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                  <Combobox.Input
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                    displayValue={(listPlace: listPlace) => listPlace.name}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Add Location"
                    ref={inputRef}
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronUpDownIcon
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>

                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                  afterLeave={() => setQuery("")}
                >
                  <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
                    {listPlace.length === 0 && query !== "" ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nothing found.
                      </div>
                    ) : (
                      listPlace.map((city, i) => (
                        <Combobox.Option
                          key={i}
                          className={({ active }) =>
                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                              active
                                ? "bg-teal-600 text-white"
                                : "text-gray-900"
                            }`
                          }
                          value={city}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={`block truncate ${
                                  selected ? "font-medium" : "font-normal"
                                }`}
                              >
                                {city.name}
                              </span>
                              {selected ? (
                                <span
                                  className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                    active ? "text-white" : "text-teal-600"
                                  }`}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Combobox.Option>
                      ))
                    )}
                  </Combobox.Options>
                </Transition>
              </div>
            </Combobox>
            <button className="btn btn-sm mt-1.5" onClick={() => addLocation()}>
              Add
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {weather.map((item, i) => (
              <div
                key={i}
                className="relative h-[24rem] sm:h-96 w-full md:w-[calc(33.333% - 1rem)] lg:w-[calc(25% - 1rem)] rounded-2xl"
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
                      {item.location.name} {item.location.region}
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
                  <div className="flex flex-col space-y-5 mt-10 text-xs px-2">
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
