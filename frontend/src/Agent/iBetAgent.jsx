import React from "react";

const IbetAgent = () => {
  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full h-full max-w-screen-2xl max-h-screen-2xl border border-gray-300 shadow-lg overflow-hidden rounded-lg">
        <iframe
          src="https://ag.ibet788.com/Public/Default1.aspx?r=1682687276"
          title="iBet788 Full Website"
          className="w-full h-full"
          style={{ border: "none" }}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default IbetAgent;
