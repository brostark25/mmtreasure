import React from "react";

const ServicesPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* FROM THE BEST Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            MM Treasure မှ လူကြီးမင်းများအတွက် အကောင်းဆုံးဝန်ဆောင်မှုများ
          </h2>
          {/* <p className="text-xl text-gray-600">
            We are dedicated to providing top-notch services to meet your needs.
          </p> */}
        </section>

        {/* OUR SERVICES Section */}
        <section>
          {/* 24 Hours Services */}
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <img
                src="https://media.istockphoto.com/id/1210501575/vector/male-hotline-operator-advises-client.jpg?s=612x612&w=0&k=20&c=fRhixOcDvnjDI3Jwi0ZNQ5gcbnksYJNepWlxD1GnWfk="
                alt="24 Hours Services"
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                01 | 24/7 အမြဲတမ်း ဝန်ဆောင်မှု
              </h3>
              <p className="text-gray-600 mb-4">
                MM Treasure မှ လူကြီးမင်းများလိုအပ်ချက်များကို
                အကောင်းဆုံးသောဝန်ဆောင်မှုများဖြင့် ၂၄ နာရီ
                အမြဲမပြတ်ဝန်ဆောင်မှုပေးခြင်း။
              </p>
              {/* <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                Learn More
              </button> */}
            </div>
          </div>

          {/* Multiplayer Services */}
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <img
                src="https://live-production.wcms.abc-cdn.net.au/b1ab7a433862df716a69ea77c6e74011?impolicy=wcms_crop_resize&cropH=2813&cropW=5000&xPos=0&yPos=265&width=862&height=485"
                alt="Accurate Odds & Fair Play"
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                02 | အလျာ်အစားမှန်ကန်မှု
              </h3>
              <p className="text-gray-600 mb-4">
                2D/3D သာမက၊ စလော့ဂိမ်းများမှ ရရှိသော အနိုင်အရှံးများကို
                မှန်ကန်တိကျစွာ တွက်ချက်ပေးခြင်း
              </p>
              {/* <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                Learn More
              </button> */}
            </div>
          </div>

          {/* Multiplayer Services */}
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0">
              <img
                src="https://eidk95seyu2.exactdn.com/en/blog/wp-content/uploads/2022/12/roulette_casino.jpg?strip=all&lossy=1&ssl=1"
                alt="Unit In/Out"
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                03 | ငွေလွှဲမှုများနှင့် ဝန်ဆောင်မှု
              </h3>
              <p className="text-gray-600 mb-4">
                <li>Unit အသွင်း/အထုတ်များ 💸</li>
                <li>
                  အလျော်အစားများနှင့် လူကြီးမင်းတို့လိုအပ်သည့်
                  အထွေထွေကိစ္စများအားလုံးကို
                </li>
                <li>၂၄ နာရီ အသင့်ရှိနေပြီး ဝန်ဆောင်မှုပေးနေပါပြီရှင်...</li>
              </p>
              {/* <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
                Learn More
              </button> */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicesPage;
