export async function onRequest(context) {
  const table = context.params.table;
  const id = context.params.id; // /tables/awe_schedule/아이디 대응
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

      // id 자동 생성
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

    // ============================
    // PUT - 데이터 수정
    // ============================
    if (method === "PUT") {
      if (!id) {
        return Response.json(
          { success: false, message: "ID required for update" },
          { status: 400 }
        );
      }

      const body = await context.request.json();

      const keys = Object.keys(body);
      const values = Object.values(body);

      const setClause = keys.map(key => `${key} = ?`).join(", ");

      await DB.prepare(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`
      )
        .bind(...values, id)
        .run();

      return Response.json({ success: true });
    }

    // ============================
    // DELETE - 데이터 삭제
    // ============================
    if (method === "DELETE") {
      if (!id) {
        return Response.json(
          { success: false, message: "ID required for delete" },
          { status: 400 }
        );
      }

      await DB.prepare(
        `DELETE FROM ${table} WHERE id = ?`
      )
        .bind(id)
        .run();

      return Response.json({ success: true });
    }

    // ============================
    // 허용되지 않은 메서드
    // ============================
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
