export async function onRequest(context) {
  const table = context.params.table;
  const { DB } = context.env;
  const method = context.request.method;

  try {

    // ============================
    // GET - 전체 조회
    // ============================
    if (method === "GET") {
      const { results } = await DB.prepare(
        `SELECT * FROM ${table}`
      ).all();

      return Response.json(results);
    }

    // ============================
    // POST - 데이터 추가
    // ============================
    if (method === "POST") {
      const body = await context.request.json();

      body.id = crypto.randomUUID();

      const keys = Object.keys(body);
      const values = Object.values(body);
      const placeholders = keys.map(() => "?").join(",");

      await DB.prepare(
        `INSERT INTO ${table} (${keys.join(",")}) VALUES (${placeholders})`
      )
        .bind(...values)
        .run();

      return Response.json(body);
    }

    return Response.json(
      { success: false, message: "Method Not Allowed" },
      { status: 405 }
    );

  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
