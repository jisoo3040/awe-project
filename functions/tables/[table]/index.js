export async function onRequest(context) {

  const table = context.params.table;
  const id = context.params.id;

  const { DB } = context.env;
  const method = context.request.method;

  try {

    // ---------------------------
    // GET : 전체 조회
    // ---------------------------
    if (method === "GET") {

      const { results } = await DB.prepare(
        `SELECT * FROM ${table}`
      ).all();

      return Response.json({
        success: true,
        data: results
      });
    }


    // ---------------------------
    // POST : 데이터 생성
    // ---------------------------
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

      return Response.json({
        success: true,
        id: body.id
      });
    }


    // ---------------------------
    // PUT : 데이터 수정
    // ---------------------------
    if (method === "PUT") {

      if (!id) {
        return Response.json(
          { success: false, error: "id required" },
          { status: 400 }
        );
      }

      const body = await context.request.json();

      const keys = Object.keys(body);
      const values = Object.values(body);

      const setClause = keys.map(k => `${k} = ?`).join(",");

      await DB.prepare(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`
      )
        .bind(...values, id)
        .run();

      return Response.json({
        success: true
      });
    }


    // ---------------------------
    // DELETE : 삭제
    // ---------------------------
    if (method === "DELETE") {

      // 특정 데이터 삭제
      if (id) {

        await DB.prepare(
          `DELETE FROM ${table} WHERE id = ?`
        )
          .bind(id)
          .run();

        return Response.json({
          success: true
        });
      }

      // 전체 삭제 (id 없는 경우)
      await DB.prepare(
        `DELETE FROM ${table}`
      ).run();

      return Response.json({
        success: true
      });
    }


    // ---------------------------
    // 허용되지 않은 method
    // ---------------------------
    return Response.json(
      { success: false, error: "Method Not Allowed" },
      { status: 405 }
    );


  } catch (error) {

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }

}
