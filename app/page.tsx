import Client from "./client";
import _config from "./config.json";

export default function Home() {
  const config = _config;
  return (
    <>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <Client />
    </>
  );
}
