import React, { useState, useEffect } from "react";

const banners = [
  "https://imgs.search.brave.com/5nZqG_2G7Ekn4Gq_LmKa4BRVv_MzVYgnmpxR96wjlWs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA3LzkxLzg0LzY4/LzM2MF9GXzc5MTg0/NjgzOF9FZE1OR29Q/VUh6Y0RrSDJPRDhz/QTdnNUhNU0o1SDRj/cC5qcGc",
  "https://imgs.search.brave.com/QgMGJUek-NR_S-b9N8dCocOpuMe82UsEt_tsPsXbS-0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA5LzE3LzM1Lzk0/LzM2MF9GXzkxNzM1/OTQyMl8xV2ZpZ1V1/SGhTVno3a3YxNm1Q/dDRNdThpcmpQeEI5/Ui5qcGc",
  "https://imgs.search.brave.com/zz01GKN1Q_bMFLR6N8iv9fLIwJN0NvH8EnDzPSRV0pc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA3LzE3Lzk5LzEy/LzM2MF9GXzcxNzk5/MTI3OV9nSHVVMGZO/NGVlUzVuMTRHb3dX/d28yUUtBdVU0YjV6/bi5qcGc",
];

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="container mx-auto text-center relative z-10 h-full flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              တစ်နေရာထဲတွင်အစုံရသော...
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Game များကို ကစားလိုပါသလား? ဒါ့အပြင် အနိုင်များသည့် Game
              များစွာလည်းရှိသည့်အပြင် 2D/3D လည်းရနိုင်သည့် Website
              ကိုရှာနေတယ်ဆိုရင်တော့, အခုဘဲ MM Treasure နဲ့ချိတ်ဆက်လိုက်ပါ။
            </p>
            <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
              Get Started
            </button>
          </div>
        </div>
      ))}

      {/* Side Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 transition duration-300"
      >
        &larr;
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 hover:bg-opacity-70 transition duration-300"
      >
        &rarr;
      </button>
    </section>
  );
};

export default BannerSlider;
