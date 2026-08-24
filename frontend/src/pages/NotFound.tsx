import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="font-utility text-6xl font-extrabold text-lavender-soft">404</p>
      <h1 className="font-display text-xl font-bold text-ink">This page took a wrong turn.</h1>
      <p className="max-w-sm text-sm text-inkmute">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/"><Button>Back to home</Button></Link>
    </div>
  );
}
