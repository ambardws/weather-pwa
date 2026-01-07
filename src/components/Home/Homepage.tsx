"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bars3Icon,
  BeakerIcon,
  EyeIcon,
  CloudIcon,
  SunIcon,
  MoonIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon, XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { fetchApi, fetchLocation, DEFAULT_LOCATIONS } from "@/services/api";
import { formatDate } from "@/utils/format";
import { toastError } from "@/utils/toast";
import { ToastContainer } from "react-toastify";

const Homepage = () => {
  const [selected, setSelected] = useState<listPlace>();
  const [query, setQuery] = useState("");
  const [listPlace, setListPlace] = useState<listPlace[]>([]);
  const [weather, setWeather] = useState<ResponeWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get background color based on weather
  const getWeatherBackground = (condition: string, isDay: number) => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")) {
      return "#4A90E2";
    } else if (condition.toLowerCase().includes("cloud") || condition.toLowerCase().includes("overcast")) {
      return "#95A5A6";
    } else if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear")) {
      if (isNight || isDay === 0) {
        return "#2C3E50";
      }
      return "#F39C12";
    } else if (condition.toLowerCase().includes("thunder") || condition.toLowerCase().includes("storm")) {
      return "#34495E";
    }
    return "#3498DB";
  };

  // Get weather icon
  const getWeatherIcon = (condition: string, isDay: number, size: string = "w-24 h-24") => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")) {
      return <CloudIcon className={`${size} text-blue-400`} />;
    } else if (condition.toLowerCase().includes("cloud") || condition.toLowerCase().includes("overcast")) {
      return <CloudIcon className={`${size} text-gray-400`} />;
    } else if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear")) {
      if (isNight || isDay === 0) {
        return <MoonIcon className={`${size} text-yellow-300`} />;
      }
      return <SunIcon className={`${size} text-yellow-500`} />;
    } else if (condition.toLowerCase().includes("thunder") || condition.toLowerCase().includes("storm")) {
      return <BoltIcon className={`${size} text-yellow-500`} />;
    }
    return <SunIcon className={`${size} text-yellow-500`} />;
  };

  const getDefaultWeather = async () => {
    try {
      setLoading(true);
      const promises = DEFAULT_LOCATIONS.map((location) => fetchApi(location));
      const results = await Promise.all(promises);
      setWeather(results);
    } catch (error) {
      console.error("Error fetching default weather", error);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async () => {
    if (selected) {
      try {
        const exists = weather.some(
          (w) =>
            Math.abs(parseFloat(w.location.lat) - parseFloat(selected.lat)) < 0.01 &&
            Math.abs(parseFloat(w.location.lon) - parseFloat(selected.lon)) < 0.01
        );

        if (exists) {
          toastError("Info", "Lokasi sudah ditambahkan");
          return;
        }

        const result: ResponeWeather = await fetchApi(
          `${selected?.lat},${selected?.lon}`
        );
        setWeather((prevWeather) => [...prevWeather, result]);
        setSelected(undefined);
        setQuery("");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        setListPlace([]);
        setShowDropdown(false);
      } catch (error) {
        toastError("Error", "Gagal menambahkan lokasi");
      }
    } else {
      toastError("Error", "Silakan pilih lokasi dari dropdown");
    }
  };

  const removeLocation = (indexToRemove: number) => {
    setWeather((prevWeather) => prevWeather.filter((_, index) => index !== indexToRemove));
  };

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.length > 2) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setListPlace([]);
    }
  };

  const selectLocation = (place: listPlace) => {
    setSelected(place);
    setQuery(place.name);
    setShowDropdown(false);
  };

  const clearSearch = () => {
    setQuery("");
    setListPlace([]);
    setShowDropdown(false);
    setSelected(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setWeather([]);
    getDefaultWeather();
  }, []);

  useEffect(() => {
    const getloc = setTimeout(async () => {
      if (query && query.trim().length > 2) {
        try {
          const res = await fetchLocation(query);

          if (res.error) {
            setListPlace([]);
            return;
          }

          const formattedData = res.results?.map((result: any) => {
            return {
              id: result.place_id,
              name: result.formatted,
              lon: result.lon,
              lat: result.lat,
            };
          });

          if (formattedData && formattedData.length > 0) {
            setListPlace(formattedData);
          } else {
            setListPlace([]);
          }
        } catch (error) {
          console.error("Error fetching location:", error);
          setListPlace([]);
        }
      } else {
        setListPlace([]);
      }
    }, 300);
    return () => clearTimeout(getloc);
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-center" theme="light" />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <CloudIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Weather Jabodetabek</h1>
                <p className="text-xs text-gray-500">Cuaca real-time untuk kota Anda</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
                  Memuat...
                </span>
              ) : (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {weather.length} Kota
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div ref={searchRef} className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl py-3 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                  placeholder="Cari lokasi baru (minimal 3 karakter)..."
                  onChange={(e) => handleSearchChange(e.target.value)}
                  value={query}
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <button
                onClick={addLocation}
                disabled={!selected}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                Tambah
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && listPlace.length > 0 && (
              <div className="absolute mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto z-50 animate-fade-in">
                {listPlace.map((city, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(city)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-all border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 group-hover:text-blue-600 font-medium truncate">
                          {city.name}
                        </p>
                      </div>
                    </div>
                    {selected?.id === city.id && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat data cuaca...</p>
          </div>
        )}

        {/* Weather Cards Grid */}
        {!loading && weather.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {weather.map((item, index) => {
              const bgColor = getWeatherBackground(item.current.condition.text, item.current.is_day);
              const isDark = bgColor === "#2C3E50" || bgColor === "#34495E" || bgColor === "#3498DB" || bgColor === "#4A90E2";

              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                  style={{ borderTop: `4px solid ${bgColor}` }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeLocation(index)}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-gray-100 hover:bg-red-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Hapus lokasi"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </button>

                  {/* Card Content */}
                  <div className="p-5">
                    {/* Location */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <h3 className="text-lg font-bold text-gray-900">{item.location.name}</h3>
                      </div>
                      <p className="text-gray-500 text-sm">{item.location.region}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {formatDate(item.location.localtime)}
                      </p>
                    </div>

                    {/* Weather Icon */}
                    <div className="flex justify-center mb-4 py-2">
                      {getWeatherIcon(item.current.condition.text, item.current.is_day)}
                    </div>

                    {/* Temperature */}
                    <div className="text-center mb-4">
                      <h2 className="text-5xl font-light text-gray-900">
                        {Math.round(item.current.temp_c)}
                        <span className="text-2xl align-top">°</span>
                      </h2>
                      <p className="text-gray-600 text-sm mt-1 font-medium">{item.current.condition.text}</p>
                    </div>

                    {/* Weather Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <EyeIcon className="h-4 w-4" />
                          <span>Visibility</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.current.vis_km} km</span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BeakerIcon className="h-4 w-4" />
                          <span>Feels Like</span>
                        </div>
                        <span className="font-semibold text-gray-900">{Math.round(item.current.feelslike_c)}°</span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bars3Icon className="h-4 w-4" />
                          <span>Humidity</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.current.humidity}%</span>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BoltIcon className="h-4 w-4" />
                          <span>Wind</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.current.wind_kph} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && weather.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum ada lokasi</h3>
            <p className="text-gray-600">Cari dan tambahkan lokasi untuk melihat cuaca</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p>Weather PWA - Data cuaca dari WeatherAPI.com</p>
            <p className="mt-1 text-xs text-gray-500">Dibuat dengan Next.js 13+ dan TypeScript</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;

