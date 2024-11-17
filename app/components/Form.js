// app/components/Form.js
import { useState } from "react";

const Form = ({ onSubmit }) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL"
          className="w-full p-4 pl-10 rounded-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          required
        />
        {/* Adding a little icon to the left for a fancier touch */}
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          🔗
        </span>
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
      >
        Predict
      </button>
    </form>
  );
};

export default Form;
