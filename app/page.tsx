import Client from "./client";
import _config from "./config.json";

export default function Home() {
  //@ts-ignore
  const config: ts_task[] = _config;
  return (
    <>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <Client config={config} />
    </>
  );
}
