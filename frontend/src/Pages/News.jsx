import React from "react";

const News = () => {
  return (
    <section className="my-8 text-center">
      <h1 className="text-xl font-bold">DAILY SLOT TIPS GAMES</h1>
      <div className="grid grid-row-2 gap-4 p-4 pt-8">
        <div className="row-span-2 bg-[rgb(55 65 81 / 7%)] p-4 rounded-lg text-clip overflow-hidden">
          <a href="#">
            <img src="news.jpg" className="w-full h-85 " />
            {/* <h2 className="text-left text-balance text-lg sm:text-sm md:text-2xl lg:text-3xl font-bold pt-4">
              POPULAR GAMES OF THE WEEK
            </h2>
            <h5 className="text-left text-wrap text-[14px] sm:text-sm md:text-[14px] lg:text-[14px] font-bold pt-4 pb-2">
              6.11.2024 | 1:13 PM
            </h5>
            <p className="text-balance text-left">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus,
              tempora vero impedit dolor id labore. Unde, eius consequuntur
              mollitia enim at harum non doloribus est autem suscipit error,
              accusamus placeat. Lorem ipsum dolor sit amet consectetur
              adipisicing elit. Delectus, tempora vero impedit dolor id labore.
              Unde, eius consequuntur mollitia enim at harum non doloribus est
              autem suscipit error, accusamus placeat.
            </p> */}
          </a>
        </div>
      </div>
    </section>
  );
};

export default News;
