import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="py-40">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-500 mb-2">404</div>
        <h1 className="text-xl font-semibold text-gray-700 mb-2">Page Not Found</h1>
        <p className="text-md mb-20">
          The page you are searching for does not exist.
        </p>
        <Link to="/" className="bg-blue-600 text-white rounded p-2">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound;