import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await new Promise((resolve, reject) => {
    exec(
      body.command,
      {
        // Опционально: передать переменные окружения или настроить таймаут
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("Ошибка выполнения:", error.message);
          reject({ error: error });
          return;
        }
        if (stderr) {
          console.error("stderr:", stderr);
          reject({ error: stderr });
          return;
        }
        resolve({ result: stdout });
        console.log("Результат:\n", stdout);
      }
    );
  });

  return NextResponse.json({ body, res });
}

/*
fetch("/api/vds/execute", {
  method: "post",
  body: JSON.stringify({
    command: "ls",
  }),
})
  .then((x) => x.json())
  .then((x) => console.log(x));

*/
