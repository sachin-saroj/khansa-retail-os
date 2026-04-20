import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="text-center">
        <div className="text-8xl mb-4">🧾</div>
        <h1 className="text-4xl font-bold text-neutral-800 mb-2">404</h1>
        <p className="text-neutral-500 mb-6">Page not found</p>
        <Link to="/dashboard" className="btn btn-primary no-underline">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
