export async function onRequest(context) {
  const table = context.params.table;
  const id = context.params.id;
  const { DB } = context.env;
  const method = context.request.method;

  try {

    // GET
    if (method === "GET") {
      const { results } = await DB.prepare(
        `SELECT * FROM ${table}`
      ).all();

      return Response.json({
        success: true,
        data: results
      });
    }

    // POST
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

      return Response.json({ success: true });
    }

    // PUT
    if (method === "PUT") {
      if (!id) return Response.json({ success: false }, { status: 400 });

      const body = await context.request.json();
      const keys = Object.keys(body);
      const values = Object.values(body);
      const setClause = keys.map(k => `${k} = ?`).join(",");

      await DB.prepare(
        `UPDATE ${table} SET ${setClause} WHERE id = ?`
      )
        .bind(...values, id)
        .run();

      return Response.json({ success: true });
    }

    // DELETE
    if (method === "DELETE") {
      if (!id) return Response.json({ success: false }, { status: 400 });

      await DB.prepare(
        `DELETE FROM ${table} WHERE id = ?`
      )
        .bind(id)
        .run();

      return Response.json({ success: true });
    }

    return Response.json({ success: false }, { status: 405 });

  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
