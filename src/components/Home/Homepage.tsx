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
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const inputRef = useRef<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Get background color and effect for cards
  const getWeatherBackground = (condition: string, isDay: number) => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")) {
      return {
        color: "#4A90E2",
        effect: "rain"
      };
    } else if (condition.toLowerCase().includes("cloud") || condition.toLowerCase().includes("overcast")) {
      return {
        color: "#95A5A6",
        effect: "cloud"
      };
    } else if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear")) {
      if (isNight || isDay === 0) {
        return {
          color: "#1a1a2e",
          effect: "night"
        };
      }
      return {
        color: "#F39C12",
        effect: "sun"
      };
    } else if (condition.toLowerCase().includes("thunder") || condition.toLowerCase().includes("storm")) {
      return {
        color: "#34495E",
        effect: "thunder"
      };
    }
    return {
      color: "#3498DB",
      effect: "clear"
    };
  };

  // Get weather icon
  const getWeatherIcon = (condition: string, isDay: number, size: string = "w-24 h-24") => {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;

    if (condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("drizzle")) {
      // Rain icon with cloud and rain drops
      return (
        <div className="relative">
          <CloudIcon className={`${size} text-white/90`} />
          <div className="absolute bottom-[-2px] left-1/2 transform -translate-x-1/2 flex gap-1">
            <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-4 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      );
    } else if (condition.toLowerCase().includes("cloud") || condition.toLowerCase().includes("overcast")) {
      // Cloud icon with multiple layers
      return (
        <div className="relative">
          <CloudIcon className={`${size} text-white/90`} />
          <div className="absolute top-2 right-2 w-8 h-6 bg-white/20 rounded-full blur-sm"></div>
          <div className="absolute bottom-4 left-3 w-6 h-4 bg-white/15 rounded-full blur-sm"></div>
        </div>
      );
    } else if (condition.toLowerCase().includes("sun") || condition.toLowerCase().includes("clear")) {
      if (isNight || isDay === 0) {
        // Moon icon with stars
        return (
          <div className="relative">
            <MoonIcon className={`${size} text-yellow-300`} />
            <div className="absolute top-1 right-2 w-1 h-1 bg-white/80 rounded-full animate-pulse"></div>
            <div className="absolute top-6 right-1 w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            <div className="absolute bottom-4 right-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
          </div>
        );
      }
      // Sun icon with rays
      return (
        <div className="relative">
          <SunIcon className={`${size} text-yellow-300`} />
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>
      );
    } else if (condition.toLowerCase().includes("thunder") || condition.toLowerCase().includes("storm")) {
      // Thunder icon with lightning
      return (
        <div className="relative">
          <CloudIcon className={`${size} text-white/90`} />
          <div className="absolute top-4 right-4">
            <BoltIcon className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>
      );
    }
    return <SunIcon className={`${size} text-yellow-300`} />;
  };

  // Get weather effect overlay
  const getWeatherEffect = (effect: string) => {
    switch (effect) {
      case "rain":
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-blue-900/40"></div>
            
            {/* Individual rain drops with animation */}
            <div className="absolute w-0.5 h-8 bg-white/40 rounded-full" style={{
              left: '10%',
              top: '-20px',
              animation: 'rainDrop 1.2s linear infinite'
            }}></div>
            <div className="absolute w-0.5 h-10 bg-white/35 rounded-full" style={{
              left: '25%',
              top: '-20px',
              animation: 'rainDrop 1.5s linear infinite',
              animationDelay: '0.3s'
            }}></div>
            <div className="absolute w-0.5 h-6 bg-white/45 rounded-full" style={{
              left: '40%',
              top: '-20px',
              animation: 'rainDrop 1s linear infinite',
              animationDelay: '0.6s'
            }}></div>
            <div className="absolute w-0.5 h-9 bg-white/40 rounded-full" style={{
              left: '55%',
              top: '-20px',
              animation: 'rainDrop 1.3s linear infinite',
              animationDelay: '0.2s'
            }}></div>
            <div className="absolute w-0.5 h-7 bg-white/35 rounded-full" style={{
              left: '70%',
              top: '-20px',
              animation: 'rainDrop 1.1s linear infinite',
              animationDelay: '0.5s'
            }}></div>
            <div className="absolute w-0.5 h-8 bg-white/40 rounded-full" style={{
              left: '85%',
              top: '-20px',
              animation: 'rainDrop 1.4s linear infinite',
              animationDelay: '0.4s'
            }}></div>
            <div className="absolute w-0.5 h-11 bg-white/30 rounded-full" style={{
              left: '15%',
              top: '-20px',
              animation: 'rainDrop 1.6s linear infinite',
              animationDelay: '0.7s'
            }}></div>
            <div className="absolute w-0.5 h-5 bg-white/45 rounded-full" style={{
              left: '60%',
              top: '-20px',
              animation: 'rainDrop 0.9s linear infinite',
              animationDelay: '0.1s'
            }}></div>
            <div className="absolute w-0.5 h-8 bg-white/40 rounded-full" style={{
              left: '80%',
              top: '-20px',
              animation: 'rainDrop 1.2s linear infinite',
              animationDelay: '0.8s'
            }}></div>
            <div className="absolute w-0.5 h-10 bg-white/35 rounded-full" style={{
              left: '30%',
              top: '-20px',
              animation: 'rainDrop 1.5s linear infinite',
              animationDelay: '0.9s'
            }}></div>
            <div className="absolute w-0.5 h-6 bg-white/45 rounded-full" style={{
              left: '50%',
              top: '-20px',
              animation: 'rainDrop 1s linear infinite',
              animationDelay: '0.3s'
            }}></div>
            
            {/* Rain splash effect */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
          </div>
        );
      case "cloud":
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-2 left-2 w-16 h-8 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute top-8 right-4 w-20 h-10 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute bottom-12 left-8 w-14 h-7 bg-white/10 rounded-full blur-sm"></div>
            <div className="absolute top-16 right-8 w-18 h-9 bg-white/10 rounded-full blur-sm"></div>
          </div>
        );
      case "sun":
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl"></div>
            <div className="absolute top-4 right-4 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent"></div>
          </div>
        );
      case "night":
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 right-6 w-2 h-2 bg-white/80 rounded-full"></div>
            <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-white/60 rounded-full"></div>
            <div className="absolute top-12 right-8 w-1 h-1 bg-white/50 rounded-full"></div>
            <div className="absolute top-6 left-8 w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            <div className="absolute top-16 left-12 w-1 h-1 bg-white/60 rounded-full"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-transparent"></div>
          </div>
        );
      case "thunder":
        return (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-gray-900/30"></div>
            <div className="absolute top-1/4 left-1/4 w-1 h-12 bg-yellow-300/40 blur-sm animate-pulse"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-16 bg-yellow-300/30 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        );
      default:
        return null;
    }
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
            Math.abs(w.location.lat) - parseFloat(selected.lat) < 0.01 &&
            Math.abs(w.location.lon) - parseFloat(selected.lon) < 0.01
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
    <div className="min-h-screen relative">
      <ToastContainer position="top-center" theme="light" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-10">
          <div ref={searchRef} className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-2xl py-3.5 pl-12 pr-10 focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300"
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
                className="px-6 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-medium disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <MapPinIcon className="h-5 w-5" />
                Tambah
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showDropdown && listPlace.length > 0 && (
              <div className="absolute mt-3 w-full bg-white rounded-2xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50 animate-fade-in">
                {listPlace.map((city, i) => (
                  <button
                    key={i}
                    onClick={() => selectLocation(city)}
                    className="w-full text-left px-4 py-3.5 hover:bg-gray-50 transition-all border-b border-gray-50 last:border-b-0 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 group-hover:text-gray-700 font-medium truncate">
                          {city.name}
                        </p>
                      </div>
                    </div>
                    {selected?.id === city.id && (
                      <div className="bg-gray-900 text-white rounded-full p-1">
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
            <div className="animate-spin rounded-full h-14 w-14 border-3 border-gray-200 border-t-gray-900 mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data Cuaca...</p>
          </div>
        )}

        {/* Weather Cards Grid */}
        {!loading && weather.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300">
            {weather.map((item, index) => {
              const weatherData = getWeatherBackground(item.current.condition.text, item.current.is_day);
              const temp = Math.round(item.current.temp_c);
              const isExpanded = expandedCard === index;

              return (
                <div
                  key={index}
                  className={`
                    group relative rounded-3xl shadow-lg hover:shadow-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer overflow-hidden border border-gray-100 card-entrance
                    ${isExpanded ? 'xl:col-span-2 lg:col-span-2 md:col-span-2' : ''}
                  `}
                  style={{
                    height: '280px',
                    backgroundColor: weatherData.color,
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                >
                  {/* Weather Effect Overlay */}
                  {getWeatherEffect(weatherData.effect)}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocation(index);
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white/90 hover:bg-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
                    title="Hapus lokasi"
                  >
                    <XMarkIcon className="h-3 w-3 text-gray-700" />
                  </button>

                  <div className="relative h-full flex overflow-hidden z-10">
                    {/* Left Panel - Main Info */}
                    <div className={`h-full p-5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'w-[280px] flex-shrink-0' : 'w-full'}`}>
                      {/* Location Header */}
                      <div className="flex items-center justify-between mb-3 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-white/80 transition-all duration-300" />
                          <div className="transition-all duration-300">
                            <h3 className="font-bold text-white text-sm transition-all duration-300">
                              {item.location.name}
                            </h3>
                            {!isExpanded && (
                              <p className="text-white/70 text-xs transition-all duration-300">
                                {item.location.region}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-white/60 text-xs transition-all duration-300">
                          {formatDate(item.location.localtime)}
                        </span>
                      </div>

                      {/* Weather Icon & Temperature */}
                      <div className={`flex items-center ${isExpanded ? 'justify-start gap-3' : 'justify-center gap-4'} mb-4 flex-1`}>
                        <div className="transform transition-all duration-500 hover:scale-110">
                          {getWeatherIcon(item.current.condition.text, item.current.is_day, "w-16 h-16")}
                        </div>
                        <div className="text-center transition-all duration-500">
                          <h2 className="font-bold text-white text-5xl transition-all duration-500 ease-out">
                            {temp}°
                          </h2>
                          <p className="text-white/90 font-medium mt-1 text-sm transition-all duration-500">
                            {item.current.condition.text}
                          </p>
                        </div>
                      </div>

                      {/* Weather Stats */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {/* Visibility */}
                        <div className="bg-white/90 rounded-xl text-center hover:bg-white transition-all duration-300 p-2.5 hover:scale-105 shadow-md">
                          <EyeIcon className="h-4 w-4 text-gray-600 mx-auto mb-1 transition-all duration-300" />
                          <p className="text-gray-900 font-bold text-xs">{item.current.vis_km}</p>
                          <p className="text-gray-500 text-[10px]">km</p>
                        </div>

                        {/* Feels Like */}
                        <div className="bg-white/90 rounded-xl text-center hover:bg-white transition-all duration-300 p-2.5 hover:scale-105 shadow-md">
                          <BeakerIcon className="h-4 w-4 text-gray-600 mx-auto mb-1 transition-all duration-300" />
                          <p className="text-gray-900 font-bold text-xs">{Math.round(item.current.feelslike_c)}°</p>
                          <p className="text-gray-500 text-[10px]">Feels</p>
                        </div>

                        {/* Humidity */}
                        <div className="bg-white/90 rounded-xl text-center hover:bg-white transition-all duration-300 p-2.5 hover:scale-105 shadow-md">
                          <Bars3Icon className="h-4 w-4 text-gray-600 mx-auto mb-1 transition-all duration-300" />
                          <p className="text-gray-900 font-bold text-xs">{item.current.humidity}%</p>
                          <p className="text-gray-500 text-[10px]">Hum</p>
                        </div>

                        {/* Wind */}
                        <div className="bg-white/90 rounded-xl text-center hover:bg-white transition-all duration-300 p-2.5 hover:scale-105 shadow-md">
                          <BoltIcon className="h-4 w-4 text-gray-600 mx-auto mb-1 transition-all duration-300" />
                          <p className="text-gray-900 font-bold text-xs">{item.current.wind_kph}</p>
                          <p className="text-gray-500 text-[10px]">km/h</p>
                        </div>
                      </div>

                      {/* Expand indicator */}
                      <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
                        <span className="text-white/60 text-xs flex items-center gap-1">
                          Detail →
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Additional Details (shown when expanded) */}
                    <div className={`absolute top-0 right-0 h-full left-[280px] bg-white px-4 py-5 border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                      <h4 className="text-gray-900 font-bold text-sm mb-3 animate-scale-in">Detail Cuaca</h4>

                      <div className="grid grid-cols-2 gap-2.5 flex-1">
                        {/* UV Index */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-1 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <SunIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">UV Index</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.uv}</p>
                        </div>

                        {/* Pressure */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-2 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <BeakerIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">Pressure</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.pressure_in}</p>
                        </div>

                        {/* Precipitation */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-3 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <CloudIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">Precip</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.precip_mm}mm</p>
                        </div>

                        {/* Cloud Cover */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-4 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <CloudIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">Cloud</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.cloud}%</p>
                        </div>

                        {/* Wind Degree */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-5 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <BoltIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">Direction</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.wind_degree}°</p>
                        </div>

                        {/* Gust */}
                        <div className="bg-gray-50 rounded-xl p-2.5 hover:bg-gray-100 transition-all stagger-6 hover:scale-105 shadow-sm border border-gray-100">
                          <div className="flex items-center gap-1 mb-1">
                            <BoltIcon className="h-3 w-3 text-gray-600" />
                            <span className="text-gray-600 text-xs font-medium">Gust</span>
                          </div>
                          <p className="text-gray-900 font-bold text-sm">{item.current.gust_kph}</p>
                        </div>
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
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border border-gray-200">
              <CloudIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum ada lokasi</h3>
            <p className="text-gray-500">Cari dan tambahkan lokasi untuk melihat Cuaca</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;
