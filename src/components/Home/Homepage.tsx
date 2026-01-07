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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 transition-all duration-500">
            {weather.map((item, index) => {
              const bgColor = getWeatherBackground(item.current.condition.text, item.current.is_day);
              const temp = Math.round(item.current.temp_c);
              const isExpanded = expandedCard === index;

              return (
                <div
                  key={index}
                  className={`
                    group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 ease-out border border-gray-200 flex flex-col cursor-pointer overflow-hidden
                    ${isExpanded ? 'xl:col-span-2 lg:col-span-2 md:col-span-2' : ''}
                  `}
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLocation(index);
                    }}
                    className="absolute top-3 right-3 z-10 p-1.5 bg-white hover:bg-red-50 rounded-full shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
                    title="Hapus lokasi"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                  </button>

                  {/* Card Content */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Location Header */}
                    <div className="mb-4 transition-all duration-500">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinIcon className={`h-4 w-4 transition-all duration-500 ${isExpanded ? 'scale-125' : ''}`} style={{ color: bgColor }} />
                        <h3 className={`font-bold text-gray-900 transition-all duration-500 ${isExpanded ? 'text-2xl' : 'text-lg'}`}>
                          {item.location.name}
                        </h3>
                        <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
                          {isExpanded ? '← Klik untuk tutup' : 'Klik untuk detail →'}
                        </span>
                      </div>
                      <p className={`text-gray-500 transition-all duration-500 ${isExpanded ? 'text-sm' : 'text-xs'}`}>
                        {item.location.region}
                      </p>
                      <p className={`text-gray-400 transition-all duration-500 ${isExpanded ? 'text-xs' : 'text-xs'}`}>
                        {formatDate(item.location.localtime)}
                      </p>
                    </div>

                    {/* Weather Icon & Temperature */}
                    <div className={`flex items-center ${isExpanded ? 'justify-start gap-8' : 'justify-center gap-4'} mb-4 py-3 transition-all duration-500`}>
                      <div className={`transform transition-all duration-500 ${isExpanded ? 'scale-125 hover:scale-135' : 'scale-100 hover:scale-110'}`}>
                        {getWeatherIcon(item.current.condition.text, item.current.is_day, isExpanded ? "w-28 h-28" : "w-16 h-16")}
                      </div>
                      <div className="transition-all duration-500">
                        <h2 className={`font-bold text-gray-900 transition-all duration-500 ease-out ${isExpanded ? 'text-8xl' : 'text-4xl'}`}>
                          {temp}°
                        </h2>
                        <p className={`text-gray-600 text-center transition-all duration-500 ${isExpanded ? 'text-base mt-2' : 'text-sm'}`}>
                          {item.current.condition.text}
                        </p>
                      </div>
                    </div>

                    {/* Weather Stats */}
                    <div className={`space-y-2 mt-auto transition-all duration-500 ${isExpanded ? 'space-y-3' : 'space-y-2'}`}>
                      {/* Visibility */}
                      <div className="flex items-center justify-between text-xs transition-all duration-300 hover:bg-gray-50 rounded-lg p-2 -mx-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <EyeIcon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                          <span>Visibility</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.current.vis_km} km</span>
                      </div>

                      {/* Feels Like */}
                      <div className="flex items-center justify-between text-xs transition-all duration-300 hover:bg-gray-50 rounded-lg p-2 -mx-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BeakerIcon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                          <span>Feels Like</span>
                        </div>
                        <span className="font-semibold text-gray-900">{Math.round(item.current.feelslike_c)}°</span>
                      </div>

                      {/* Humidity with bar */}
                      <div className="space-y-1 transition-all duration-300 hover:bg-gray-50 rounded-lg p-2 -mx-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Bars3Icon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                            <span>Humidity</span>
                          </div>
                          <span className="font-semibold text-gray-900">{item.current.humidity}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${item.current.humidity}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Wind */}
                      <div className="flex items-center justify-between text-xs transition-all duration-300 hover:bg-gray-50 rounded-lg p-2 -mx-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <BoltIcon className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                          <span>Wind</span>
                        </div>
                        <span className="font-semibold text-gray-900">{item.current.wind_kph} km/h</span>
                      </div>

                      {/* Additional Details (shown when expanded) */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-down">
                          <h4 className="text-sm font-bold text-gray-900 mb-4 animate-scale-in">Detail Cuaca</h4>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {/* UV Index */}
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-1">
                              <div className="flex items-center gap-2 mb-2">
                                <SunIcon className="h-5 w-5 text-yellow-500" />
                                <span className="text-xs text-gray-600">UV Index</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.uv}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {item.current.uv <= 2 ? 'Low' : item.current.uv <= 5 ? 'Moderate' : item.current.uv <= 7 ? 'High' : item.current.uv <= 10 ? 'Very High' : 'Extreme'}
                              </p>
                            </div>

                            {/* Pressure */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-2">
                              <div className="flex items-center gap-2 mb-2">
                                <BeakerIcon className="h-5 w-5 text-blue-500" />
                                <span className="text-xs text-gray-600">Pressure</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.pressure_mb}</p>
                              <p className="text-xs text-gray-500 mt-1">mb</p>
                            </div>

                            {/* Precipitation */}
                            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-3">
                              <div className="flex items-center gap-2 mb-2">
                                <CloudIcon className="h-5 w-5 text-cyan-500" />
                                <span className="text-xs text-gray-600">Precipitation</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.precip_mm}</p>
                              <p className="text-xs text-gray-500 mt-1">mm</p>
                            </div>

                            {/* Cloud Cover */}
                            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-4">
                              <div className="flex items-center gap-2 mb-2">
                                <CloudIcon className="h-5 w-5 text-gray-500" />
                                <span className="text-xs text-gray-600">Cloud</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.cloud}</p>
                              <p className="text-xs text-gray-500 mt-1">% coverage</p>
                            </div>

                            {/* Wind Degree */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-5">
                              <div className="flex items-center gap-2 mb-2">
                                <BoltIcon className="h-5 w-5 text-green-500" />
                                <span className="text-xs text-gray-600">Wind Dir</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.wind_degree}°</p>
                              <p className="text-xs text-gray-500 mt-1">{item.current.wind_dir}</p>
                            </div>

                            {/* Gust */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-md stagger-6">
                              <div className="flex items-center gap-2 mb-2">
                                <BoltIcon className="h-5 w-5 text-purple-500" />
                                <span className="text-xs text-gray-600">Wind Gust</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900">{item.current.gust_kph}</p>
                              <p className="text-xs text-gray-500 mt-1">km/h</p>
                            </div>
                          </div>

                          {/* Last Updated */}
                          <div className="mt-4 text-center animate-fade-in">
                            <p className="text-xs text-gray-500">
                              Last updated: {item.current.last_updated}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom color bar */}
                  <div
                    className={`h-1.5 w-full transition-all duration-500 ${isExpanded ? 'h-2' : ''}`}
                    style={{ backgroundColor: bgColor }}
                  ></div>
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

