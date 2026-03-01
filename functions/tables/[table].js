export async function onRequest(context) {
  const table = context.params.table;
  const { DB } = context.env;

  // GET - 데이터 조회
  if (context.request.method === "GET") {
    try {
      const { results } = await DB.prepare(
        `SELECT * FROM ${table}`
      ).all();

      return Response.json(results);
    } catch (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }

  // POST - 데이터 추가
  if (context.request.method === "POST") {
    try {
      const body = await context.request.json();

      // 🔥 id 자동 생성
      body.id = crypto.randomUUID();

      const keys = Object.keys(body);
      const values = Object.values(body);
      const placeholders = keys.map(() => "?").join(",");

      await DB.prepare(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`
      )
        .bind(...values)
        .run();

      // 🔥 저장된 실제 데이터 반환
      return Response.json(body);

    } catch (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }

  return Response.json(
    { success: false, message: "Method Not Allowed" },
    { status: 405 }
  );
}
