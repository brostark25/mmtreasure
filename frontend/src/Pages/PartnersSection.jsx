import React from "react";

const PartnersSection = () => {
  const partners = [
    {
      name: "Pragmatic Play",
      logo: "https://slot.day/wp-content/uploads/2024/04/Pragmatic-Play-Logo-3.webp", // Replace with actual partner logo URL
    },
    {
      name: "Ibet789",
      logo: "https://www.telecomasia.net/upload/iblock/492/492d0f1f1af1fa19ab3c3b18572e024d.png", // Replace with actual partner logo URL
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 ">
          မိတ်ဖက်များ
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-auto max-h-20 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
