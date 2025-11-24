import { A, useNavigate } from "@solidjs/router";

export default function NotFound() {
  const navigate = useNavigate();
  navigate("/", { replace: true })
  return (
    <main>
    </main>
  );
}
