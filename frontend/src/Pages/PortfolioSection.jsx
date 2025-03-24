import React from "react";

const PortfolioSection = () => {
  const projects = [
    {
      title: "စလော့ဂိမ်း",
      image:
        "https://store-images.s-microsoft.com/image/apps.12280.13883470003746040.69c2265a-5473-4460-8ced-badfa44795ba.7ca38016-71cd-4459-b3af-60fe43f97be6?mode=scale&q=90&h=1080&w=1920",
    },
    {
      title: "2d/3d",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQfywszhvbbda06EHMJaC5tqdbBuz3_w0sgw&s",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          ဂိမ်းများ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                <h3 className="text-white text-2xl font-bold">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
