export async function onRequest(context) {
  const table = context.params.table;
  const id = context.params.id;
  const { DB } = context.env;
  const method = context.request.method;

  try {

    if (!id) {
      return Response.json(
        { success: false, message: "ID required" },
        { status: 400 }
      );
    }

    // ============================
    // PUT - 수정
    // ============================
    if (method === "PUT") {
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
    // DELETE - 삭제
    // ============================
    if (method === "DELETE") {
      await DB.prepare(
        `DELETE FROM ${table} WHERE id = ?`
      )
        .bind(id)
        .run();

      return Response.json({ success: true });
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
